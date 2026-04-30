const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
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
