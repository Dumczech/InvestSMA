const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, jget, jpost, jpatch, jdelete } = require('./helpers');

let server;
before(async () => { server = await startServer(); });
after(async () => { if (server) await server.close(); });

test('GET /api/media returns 21 seeded assets with counts', async () => {
  const { status, body } = await jget(`${server.url}/api/media`);
  assert.equal(status, 200);
  assert.equal(body.totalAll, 21);
  assert.equal(body.total, 21);
  assert.equal(body.images, 19);
  assert.equal(body.videos, 2);
});

test('folder filter is prefix-aware (matches subfolders)', async () => {
  const { body } = await jget(`${server.url}/api/media?folder=properties`);
  assert.ok(body.total >= 11, `expected at least 11, got ${body.total}`);
  for (const a of body.items) {
    assert.ok(a.folder.startsWith('properties'), `unexpected folder ${a.folder}`);
  }
});

test('search matches name, alt and tags case-insensitively', async () => {
  const byName = (await jget(`${server.url}/api/media?search=courtyard`)).body;
  assert.equal(byName.total, 1);
  assert.equal(byName.items[0].id, 'm-001');

  const byTag = (await jget(`${server.url}/api/media?search=floorplan`)).body;
  assert.equal(byTag.total, 1);
  assert.equal(byTag.items[0].id, 'm-400');
});

test('sort=name-asc orders alphabetically', async () => {
  const { body } = await jget(`${server.url}/api/media?sort=name-asc&limit=3`);
  const names = body.items.map(a => a.name);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted);
});

test('GET /api/folders rolls up counts including subfolders', async () => {
  const { body } = await jget(`${server.url}/api/folders`);
  const props = body.items.find(f => f.id === 'properties');
  assert.ok(props, 'properties folder present');
  // 5 olivos photos + 1 floorplan + 1 walkthrough video + 3 mirador + 2 bougainvillea = 12
  assert.equal(props.count, 12);
  const all = body.items.find(f => f.id === 'all');
  assert.equal(all.count, 21);
});

test('GET /api/storage reports the 5 GB quota', async () => {
  const { body } = await jget(`${server.url}/api/storage`);
  assert.equal(body.quotaBytes, 5 * 1024 ** 3);
  assert.equal(body.total, 21);
  assert.ok(body.usedBytes > 0);
  assert.ok(body.percent >= 0 && body.percent <= 100);
});

test('PATCH /api/media/:id updates alt + replaces tags', async () => {
  const { status, body } = await jpatch(`${server.url}/api/media/m-001`, {
    alt: 'New alt', tags: ['hero', 'updated'],
  });
  assert.equal(status, 200);
  assert.equal(body.alt, 'New alt');
  assert.deepEqual([...body.tags].sort(), ['hero', 'updated']);
});

test('POST /api/media/from-url adds and is then visible', async () => {
  const { status, body } = await jpost(`${server.url}/api/media/from-url`, {
    url: 'https://example.com/test.jpg', alt: 'x', folder: 'site/hero',
  });
  assert.equal(status, 201);
  assert.equal(body.folder, 'site/hero');

  const got = (await jget(`${server.url}/api/media/${body.id}`)).body;
  assert.equal(got.id, body.id);
});

test('POST /api/media/bulk move + delete cascade through tags + usages', async () => {
  const created = (await jpost(`${server.url}/api/media/from-url`, {
    url: 'https://example.com/bulk.jpg', folder: 'site/hero',
  })).body;

  const moved = (await jpost(`${server.url}/api/media/bulk`, {
    action: 'move', ids: [created.id], folder: 'reports',
  })).body;
  assert.equal(moved.affected, 1);
  const after = (await jget(`${server.url}/api/media/${created.id}`)).body;
  assert.equal(after.folder, 'reports');

  const deleted = (await jpost(`${server.url}/api/media/bulk`, {
    action: 'delete', ids: [created.id],
  })).body;
  assert.equal(deleted.affected, 1);
  const gone = await jget(`${server.url}/api/media/${created.id}`);
  assert.equal(gone.status, 404);
});

test('POST /api/media/bulk rejects unknown actions', async () => {
  const { status, body } = await jpost(`${server.url}/api/media/bulk`, {
    action: 'frobnicate', ids: ['m-001'],
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'unknown_action');
});

test('DELETE /api/media/:id is 404 for a missing id', async () => {
  const r = await jdelete(`${server.url}/api/media/never-existed`);
  assert.equal(r.status, 404);
});

test('POST /api/folders rejects ids with bad characters', async () => {
  const { status, body } = await jpost(`${server.url}/api/folders`, {
    id: 'BAD/SLASH WITH SPACES', label: 'x',
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'invalid_id');
});

// ---------- Multipart upload ----------

// Minimal valid 1x1 PNG so multer's mime-sniff (via libmagic-style content
// inspection isn't done — multer trusts the declared content-type) accepts it.
const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4' +
  '890000000d49444154789c63f8cfc0c0c0000005000101a5b6ed130000000049454e44ae426082',
  'hex'
);

async function uploadFiles({ files, folder }) {
  const fd = new FormData();
  for (const f of files) {
    fd.append('files', new Blob([f.buffer], { type: f.type }), f.name);
  }
  if (folder) fd.append('folder', folder);
  const r = await fetch(`${server.url}/api/media/upload`, { method: 'POST', body: fd });
  const text = await r.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: r.status, body };
}

test('POST /api/media/upload stores file on disk and registers an asset', async () => {
  const beforeCount = (await jget(`${server.url}/api/media`)).body.totalAll;

  const { status, body } = await uploadFiles({
    folder: 'site/hero',
    files: [{ name: 'pixel.png', type: 'image/png', buffer: PNG_1x1 }],
  });
  assert.equal(status, 201);
  assert.equal(body.items.length, 1);
  const created = body.items[0];
  assert.equal(created.kind, 'image');
  assert.equal(created.folder, 'site/hero');
  assert.match(created.url, /^\/uploads\/pixel-/);

  // File actually written to disk under /uploads
  const filename = path.basename(created.url);
  const onDisk = path.join(__dirname, '..', 'uploads', filename);
  assert.ok(fs.existsSync(onDisk), `expected uploaded file at ${onDisk}`);
  assert.equal(fs.statSync(onDisk).size, PNG_1x1.length);

  // The static handler serves it
  const fetched = await fetch(`${server.url}${created.url}`);
  assert.equal(fetched.status, 200);

  // And it shows up in the listing
  const after = (await jget(`${server.url}/api/media`)).body.totalAll;
  assert.equal(after, beforeCount + 1);

  // Cleanup so repeated test runs don't pile up files
  fs.unlinkSync(onDisk);
});

test('POST /api/media/upload rejects disallowed mime types', async () => {
  const { status, body } = await uploadFiles({
    files: [{ name: 'evil.txt', type: 'text/plain', buffer: Buffer.from('hi') }],
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'upload_failed');
  assert.match(body.message, /Unsupported file type/);
});

test('POST /api/media/upload accepts no files and returns an empty list', async () => {
  // multer is happy with zero files; the route just returns items: [].
  const fd = new FormData();
  fd.append('folder', 'site/hero');
  const r = await fetch(`${server.url}/api/media/upload`, { method: 'POST', body: fd });
  assert.equal(r.status, 201);
  const body = await r.json();
  assert.deepEqual(body.items, []);
});

// ---------- Bulk tag ----------

test('POST /api/media/bulk tag adds tags to every selected asset', async () => {
  const a = (await jpost(`${server.url}/api/media/from-url`, {
    url: 'https://example.com/a.jpg', folder: 'site/hero', tags: [],
  })).body;
  const b = (await jpost(`${server.url}/api/media/from-url`, {
    url: 'https://example.com/b.jpg', folder: 'site/hero', tags: [],
  })).body;

  const res = await jpost(`${server.url}/api/media/bulk`, {
    action: 'tag', ids: [a.id, b.id], tags: ['featured', 'q2-2026'],
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.action, 'tag');
  assert.equal(res.body.affected, 4);  // 2 assets * 2 tags

  for (const id of [a.id, b.id]) {
    const got = (await jget(`${server.url}/api/media/${id}`)).body;
    const tags = [...got.tags].sort();
    assert.ok(tags.includes('featured'), `expected 'featured' on ${id}, got ${tags}`);
    assert.ok(tags.includes('q2-2026'), `expected 'q2-2026' on ${id}, got ${tags}`);
  }
});

test('POST /api/media/bulk tag rejects empty tag list', async () => {
  const { status, body } = await jpost(`${server.url}/api/media/bulk`, {
    action: 'tag', ids: ['m-001'], tags: [],
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'tags_required');
});

test('POST /api/media/bulk tag is idempotent on the same tag', async () => {
  const before = (await jget(`${server.url}/api/media/m-002`)).body.tags;

  await jpost(`${server.url}/api/media/bulk`, {
    action: 'tag', ids: ['m-002'], tags: ['repeatme'],
  });
  await jpost(`${server.url}/api/media/bulk`, {
    action: 'tag', ids: ['m-002'], tags: ['repeatme'],
  });

  const after = (await jget(`${server.url}/api/media/m-002`)).body.tags;
  assert.equal(after.filter(t => t === 'repeatme').length, 1);
  // existing tags untouched
  for (const t of before) assert.ok(after.includes(t));
});
