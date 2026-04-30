const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, jget, jpost } = require('./helpers');

let server;

before(async () => { server = await startServer(); });
after(async () => { if (server) await server.close(); });

test('GET /api/legal returns both seeded documents with version metadata', async () => {
  const { status, body } = await jget(`${server.url}/api/legal`);
  assert.equal(status, 200);
  assert.equal(body.version, 'v1.0');
  assert.equal(body.docCode, 'INV-LGL-2026-Q2');
  assert.equal(body.lastUpdated, '2026-04-30');

  assert.ok(body.disclosures, 'disclosures present');
  assert.ok(body.terms, 'terms present');
  assert.equal(body.disclosures.items.length, 7);
  assert.equal(body.terms.items.length, 8);
  assert.equal(body.disclosures.sectionNum, '1');
  assert.equal(body.terms.sectionNum, '2');
  assert.equal(body.disclosures.items[0].t, 'Not a real estate brokerage');
});

test('GET /api/legal/disclosures returns one document', async () => {
  const { status, body } = await jget(`${server.url}/api/legal/disclosures`);
  assert.equal(status, 200);
  assert.equal(body.slug, 'disclosures');
  assert.equal(body.title, 'Disclosures');
  assert.equal(body.items.length, 7);
});

test('GET /api/legal/terms includes the limitation-of-liability sub-list', async () => {
  const { status, body } = await jget(`${server.url}/api/legal/terms`);
  assert.equal(status, 200);
  const liability = body.items.find(c => c.n === '04');
  assert.ok(liability, 'clause 04 present');
  assert.ok(Array.isArray(liability.list));
  assert.equal(liability.list.length, 4);
});

test('GET /api/legal/unknown returns 404 with a JSON error', async () => {
  const { status, body } = await jget(`${server.url}/api/legal/no-such-doc`);
  assert.equal(status, 404);
  assert.equal(body.error, 'not_found');
});

test('POST /api/legal/acceptances persists and returns the acceptance', async () => {
  const { status, body } = await jpost(`${server.url}/api/legal/acceptances`, {
    intent: 'contact',
    email: 'investor@example.com',
    documents: [
      { slug: 'disclosures', version: 'v1.0' },
      { slug: 'terms',       version: 'v1.0' },
    ],
  });
  assert.equal(status, 201);
  assert.ok(body.id, 'returned id');
  assert.equal(body.email, 'investor@example.com');
  assert.equal(body.intent, 'contact');
  assert.equal(body.documents.length, 2);
  assert.ok(body.acceptedAt, 'acceptedAt present');
});

test('POST /api/legal/acceptances rejects empty document list', async () => {
  const { status, body } = await jpost(`${server.url}/api/legal/acceptances`, {
    intent: 'contact', documents: [],
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'documents_required');
});

test('POST /api/legal/acceptances rejects malformed email', async () => {
  const { status, body } = await jpost(`${server.url}/api/legal/acceptances`, {
    email: 'not-an-email',
    documents: [{ slug: 'terms', version: 'v1.0' }],
  });
  assert.equal(status, 400);
  assert.equal(body.error, 'invalid_email');
});

test('GET /api/legal/acceptances lists what we recorded', async () => {
  const before = (await jget(`${server.url}/api/legal/acceptances`)).body.items.length;
  await jpost(`${server.url}/api/legal/acceptances`, {
    intent: 'engagement',
    documents: [{ slug: 'terms', version: 'v1.0' }],
  });
  const { status, body } = await jget(`${server.url}/api/legal/acceptances`);
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.items));
  assert.equal(body.items.length, before + 1);
  assert.ok(body.items[0].acceptedAt);
});

test('legal.html static page is served', async () => {
  const r = await fetch(`${server.url}/legal/legal.html`);
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, /Disclosures/);
  assert.match(html, /legal\.jsx/);
});
