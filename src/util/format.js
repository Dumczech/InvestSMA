// Helpers for converting between the design's human-readable size/dimension
// strings ("2.4 MB", "4032×3024") and the byte/integer fields stored in SQLite.

function parseSizeToBytes(label) {
  if (!label) return 0;
  const m = String(label).trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)?$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] || 'B').toUpperCase();
  const mult = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }[unit] || 1;
  return Math.round(n * mult);
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  const fixed = i === 0 ? 0 : n >= 100 ? 0 : n >= 10 ? 1 : 1;
  return `${n.toFixed(fixed)} ${units[i]}`;
}

function parseDimsToWidthHeight(label) {
  if (!label || typeof label !== 'string') return { width: null, height: null };
  // Accept "4032×3024", "4032x3024", "4032 x 3024"
  const m = label.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!m) return { width: null, height: null };
  return { width: parseInt(m[1], 10), height: parseInt(m[2], 10) };
}

function formatDims(width, height, fallback) {
  if (width && height) return `${width}×${height}`;
  return fallback || 'vector';
}

module.exports = { parseSizeToBytes, formatBytes, parseDimsToWidthHeight, formatDims };
