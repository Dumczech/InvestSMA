// Shared boot for tests: spins up the express app on a temp DB and an
// ephemeral port, returns { url, close }.

const path = require('path');
const fs = require('fs');
const os = require('os');

function makeTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'investsma-test-'));
  const file = path.join(dir, 'test.db');
  return { dir, file };
}

function startServer() {
  const { dir, file } = makeTempDb();
  process.env.INVESTSMA_DB = file;

  // Require fresh: clear any cached modules that hold a Database handle.
  for (const k of Object.keys(require.cache)) {
    if (k.includes(`${path.sep}src${path.sep}`)) delete require.cache[k];
  }

  const app = require('../src/server');
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}`,
        async close() {
          await new Promise(r => server.close(r));
          // best-effort cleanup of the temp DB dir
          try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
        },
      });
    });
  });
}

async function jget(url) {
  const r = await fetch(url);
  const text = await r.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: r.status, body };
}

async function jpost(url, payload) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: r.status, body };
}

async function jpatch(url, payload) {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: r.status, body };
}

async function jdelete(url) {
  const r = await fetch(url, { method: 'DELETE' });
  return { status: r.status };
}

module.exports = { startServer, jget, jpost, jpatch, jdelete };
