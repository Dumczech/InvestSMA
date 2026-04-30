const { test } = require('node:test');
const assert = require('node:assert/strict');

const { parseSizeToBytes, formatBytes, parseDimsToWidthHeight, formatDims } = require('../src/util/format');

test('parseSizeToBytes handles common units', () => {
  assert.equal(parseSizeToBytes('0 B'), 0);
  assert.equal(parseSizeToBytes('512 B'), 512);
  assert.equal(parseSizeToBytes('1 KB'), 1024);
  assert.equal(parseSizeToBytes('2.4 MB'), Math.round(2.4 * 1024 * 1024));
  assert.equal(parseSizeToBytes('184 MB'), 184 * 1024 * 1024);
  assert.equal(parseSizeToBytes('1.5 GB'), Math.round(1.5 * 1024 ** 3));
});

test('parseSizeToBytes returns 0 for missing/garbage input', () => {
  assert.equal(parseSizeToBytes(undefined), 0);
  assert.equal(parseSizeToBytes(''), 0);
  assert.equal(parseSizeToBytes('vector'), 0);
  assert.equal(parseSizeToBytes('not a size'), 0);
});

test('formatBytes round-trips through unit boundaries', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1023), '1023 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.match(formatBytes(2.4 * 1024 * 1024), /MB$/);
  assert.match(formatBytes(5 * 1024 ** 3), /GB$/);
});

test('parseDimsToWidthHeight accepts × and x', () => {
  assert.deepEqual(parseDimsToWidthHeight('4032×3024'), { width: 4032, height: 3024 });
  assert.deepEqual(parseDimsToWidthHeight('1920x1080'), { width: 1920, height: 1080 });
  assert.deepEqual(parseDimsToWidthHeight('vector'),    { width: null, height: null });
  assert.deepEqual(parseDimsToWidthHeight(''),          { width: null, height: null });
});

test('formatDims falls back to label when unknown', () => {
  assert.equal(formatDims(1920, 1080),       '1920×1080');
  assert.equal(formatDims(null, null, 'vector'), 'vector');
  assert.equal(formatDims(null, null),       'vector');
});
