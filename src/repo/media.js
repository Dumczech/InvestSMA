// Data-access layer for the media library. Returns objects shaped exactly like
// the placeholders in media-shared.jsx so the frontend can keep its mock UI
// code while talking to the API.

const db = require('../db');
const { formatBytes, formatDims } = require('../util/format');

const VALID_SORTS = new Set([
  'uploaded-desc', 'uploaded-asc', 'name-asc', 'name-desc', 'size-desc', 'size-asc',
]);

function rowToAsset(row) {
  if (!row) return null;
  const tags = db.prepare(
    `SELECT tag FROM media_tags WHERE asset_id = ? ORDER BY tag`
  ).all(row.id).map(r => r.tag);

  const usedIn = db.prepare(
    `SELECT label, target_url FROM media_usages WHERE asset_id = ? ORDER BY label`
  ).all(row.id).map(r => r.label);

  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    folder: row.folder,
    url: row.url,
    thumb: row.thumb,
    size: formatBytes(row.size_bytes),
    sizeBytes: row.size_bytes,
    dims: formatDims(row.width, row.height, row.dims_label),
    width: row.width,
    height: row.height,
    duration: row.duration,
    alt: row.alt,
    uploaded: row.uploaded,
    tags,
    usedIn,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function listAssets({ folder, kind, search, sort, limit, offset } = {}) {
  const where = [];
  const params = {};

  if (folder && folder !== 'all') {
    // Matches the design rule a.folder.startsWith(folder) — exact or any subfolder.
    where.push(`(folder = @folder OR folder LIKE @folderPrefix)`);
    params.folder = folder;
    params.folderPrefix = `${folder}/%`;
  }
  if (kind && kind !== 'all') {
    where.push(`kind = @kind`);
    params.kind = kind;
  }
  if (search) {
    where.push(`(
      LOWER(name) LIKE @q
      OR LOWER(IFNULL(alt, '')) LIKE @q
      OR id IN (SELECT asset_id FROM media_tags WHERE LOWER(tag) LIKE @q)
    )`);
    params.q = `%${String(search).toLowerCase()}%`;
  }

  const order = (() => {
    switch (sort && VALID_SORTS.has(sort) ? sort : 'uploaded-desc') {
      case 'uploaded-asc':  return 'uploaded ASC,  id ASC';
      case 'name-asc':      return 'name ASC,      id ASC';
      case 'name-desc':     return 'name DESC,     id DESC';
      case 'size-desc':     return 'size_bytes DESC, id ASC';
      case 'size-asc':      return 'size_bytes ASC,  id ASC';
      case 'uploaded-desc':
      default:              return 'uploaded DESC, id DESC';
    }
  })();

  const sql = `
    SELECT * FROM media_assets
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${order}
    ${Number.isFinite(limit) ? `LIMIT ${Math.max(1, limit | 0)}` : ''}
    ${Number.isFinite(offset) ? `OFFSET ${Math.max(0, offset | 0)}` : ''}
  `;

  const rows = db.prepare(sql).all(params);
  return rows.map(rowToAsset);
}

function countAssets({ folder, kind, search } = {}) {
  return listAssets({ folder, kind, search }).length;
}

function getAsset(id) {
  const row = db.prepare(`SELECT * FROM media_assets WHERE id = ?`).get(id);
  return rowToAsset(row);
}

function createAsset(input) {
  const id = input.id;
  if (!id) throw new Error('asset id is required');
  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO media_assets
        (id, kind, name, folder, url, thumb, size_bytes, width, height, dims_label, duration, alt, uploaded)
      VALUES
        (@id, @kind, @name, @folder, @url, @thumb, @size_bytes, @width, @height, @dims_label, @duration, @alt, @uploaded)
    `).run({
      id,
      kind: input.kind,
      name: input.name,
      folder: input.folder || 'site',
      url: input.url,
      thumb: input.thumb || input.url,
      size_bytes: input.size_bytes || 0,
      width: input.width || null,
      height: input.height || null,
      dims_label: input.dims_label || null,
      duration: input.duration || null,
      alt: input.alt || null,
      uploaded: input.uploaded || new Date().toISOString().slice(0, 10),
    });
    for (const tag of input.tags || []) {
      db.prepare(`INSERT OR IGNORE INTO media_tags (asset_id, tag) VALUES (?, ?)`).run(id, tag);
    }
  });
  tx();
  return getAsset(id);
}

function updateAsset(id, patch) {
  const existing = db.prepare(`SELECT id FROM media_assets WHERE id = ?`).get(id);
  if (!existing) return null;

  const fields = [];
  const params = { id };
  const map = {
    name: 'name',
    folder: 'folder',
    alt: 'alt',
    url: 'url',
    thumb: 'thumb',
    duration: 'duration',
  };
  for (const [key, col] of Object.entries(map)) {
    if (patch[key] !== undefined) {
      fields.push(`${col} = @${key}`);
      params[key] = patch[key];
    }
  }
  fields.push(`updated_at = datetime('now')`);

  const tx = db.transaction(() => {
    if (fields.length > 1) {
      db.prepare(`UPDATE media_assets SET ${fields.join(', ')} WHERE id = @id`).run(params);
    }
    if (Array.isArray(patch.tags)) {
      db.prepare(`DELETE FROM media_tags WHERE asset_id = ?`).run(id);
      const ins = db.prepare(`INSERT OR IGNORE INTO media_tags (asset_id, tag) VALUES (?, ?)`);
      for (const t of patch.tags) {
        const tag = String(t).trim();
        if (tag) ins.run(id, tag);
      }
    }
  });
  tx();
  return getAsset(id);
}

function deleteAsset(id) {
  const info = db.prepare(`DELETE FROM media_assets WHERE id = ?`).run(id);
  return info.changes > 0;
}

function bulkDelete(ids = []) {
  if (!ids.length) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const info = db.prepare(`DELETE FROM media_assets WHERE id IN (${placeholders})`).run(...ids);
  return info.changes;
}

function bulkMove(ids, folder) {
  if (!ids.length || !folder) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const info = db.prepare(
    `UPDATE media_assets SET folder = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`
  ).run(folder, ...ids);
  return info.changes;
}

function bulkAddTags(ids, tags) {
  if (!ids.length || !tags.length) return 0;
  const ins = db.prepare(`INSERT OR IGNORE INTO media_tags (asset_id, tag) VALUES (?, ?)`);
  let n = 0;
  const tx = db.transaction(() => {
    for (const id of ids) for (const t of tags) {
      const tag = String(t).trim();
      if (tag) {
        ins.run(id, tag);
        n++;
      }
    }
  });
  tx();
  return n;
}

function getStorageStats() {
  const row = db.prepare(`
    SELECT
      COUNT(*)                         AS total,
      COALESCE(SUM(size_bytes), 0)     AS total_bytes,
      SUM(CASE WHEN kind='image' THEN 1 ELSE 0 END) AS images,
      SUM(CASE WHEN kind='video' THEN 1 ELSE 0 END) AS videos,
      SUM(CASE WHEN kind='document' THEN 1 ELSE 0 END) AS documents
    FROM media_assets
  `).get();

  const quotaBytes = 5 * 1024 ** 3; // 5 GB to match the design.
  return {
    total: row.total,
    images: row.images,
    videos: row.videos,
    documents: row.documents,
    usedBytes: row.total_bytes,
    used: formatBytes(row.total_bytes),
    quotaBytes,
    quota: formatBytes(quotaBytes),
    percent: Math.min(100, Math.round((row.total_bytes / quotaBytes) * 100)),
  };
}

function listFolders() {
  const folders = db.prepare(`SELECT * FROM folders ORDER BY sort, id`).all();
  // Counts include subfolders, matching the design's folderCounts memo.
  const counts = db.prepare(`SELECT folder, COUNT(*) AS n FROM media_assets GROUP BY folder`).all();
  const totals = {};
  let all = 0;
  for (const c of counts) {
    totals[c.folder] = (totals[c.folder] || 0) + c.n;
    all += c.n;
    const parts = c.folder.split('/');
    for (let i = 1; i < parts.length; i++) {
      const parent = parts.slice(0, i).join('/');
      totals[parent] = (totals[parent] || 0) + c.n;
    }
  }
  const tree = folders.map(f => ({
    id: f.id, label: f.label, icon: f.icon, depth: f.depth, count: totals[f.id] || 0,
  }));
  return [{ id: 'all', label: 'All assets', icon: 'grid', depth: 0, count: all }, ...tree];
}

function createFolder({ id, label, icon = 'folder' }) {
  if (!id || !label) throw new Error('folder id and label required');
  const depth = Math.max(0, id.split('/').length - 1);
  const sort = (db.prepare(`SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM folders`).get().n) || 1;
  db.prepare(
    `INSERT OR REPLACE INTO folders (id, label, icon, depth, sort) VALUES (?, ?, ?, ?, ?)`
  ).run(id, label, icon, depth, sort);
  return { id, label, icon, depth, count: 0 };
}

module.exports = {
  listAssets, countAssets, getAsset, createAsset, updateAsset, deleteAsset,
  bulkDelete, bulkMove, bulkAddTags,
  getStorageStats, listFolders, createFolder,
};
