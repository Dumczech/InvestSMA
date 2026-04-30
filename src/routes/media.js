const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { customAlphabet } = require('nanoid');
const repo = require('../repo/media');
const { parseSizeToBytes } = require('../util/format');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Map([
  ['image/jpeg', 'image'], ['image/png', 'image'], ['image/webp', 'image'],
  ['image/gif',  'image'], ['image/svg+xml', 'image'],
  ['video/mp4',  'video'], ['video/quicktime', 'video'],
  ['application/pdf', 'document'],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'asset';
    const stamp = Date.now().toString(36);
    cb(null, `${base}-${stamp}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB to match the upload modal.
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const newId = customAlphabet('0123456789abcdefghjkmnpqrstuvwxyz', 8);

function parseListQuery(req) {
  const { folder, kind, search, sort } = req.query;
  const limit = req.query.limit ? Math.min(500, parseInt(req.query.limit, 10) || 0) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) || 0 : undefined;
  return { folder, kind, search, sort, limit, offset };
}

// GET /api/media — list with filters/sort, plus aggregate counts for the header strip.
router.get('/', (req, res) => {
  const params = parseListQuery(req);
  const items = repo.listAssets(params);
  const totalAll = repo.listAssets({}).length;
  res.json({
    items,
    total: items.length,
    totalAll,
    images: items.filter(a => a.kind === 'image').length,
    videos: items.filter(a => a.kind === 'video').length,
  });
});

// GET /api/media/:id
router.get('/:id', (req, res) => {
  const asset = repo.getAsset(req.params.id);
  if (!asset) return res.status(404).json({ error: 'not_found' });
  res.json(asset);
});

// POST /api/media/upload — multipart file upload (matches the Upload modal).
router.post('/upload', upload.array('files', 20), (req, res) => {
  const folder = (req.body.folder || 'site').trim();
  const created = [];

  for (const file of req.files || []) {
    const kind = ALLOWED_MIME.get(file.mimetype) || 'document';
    const id = `u-${newId()}`;
    const publicUrl = `/uploads/${file.filename}`;
    created.push(repo.createAsset({
      id,
      kind,
      name: file.originalname,
      folder,
      url: publicUrl,
      thumb: publicUrl,
      size_bytes: file.size,
      uploaded: new Date().toISOString().slice(0, 10),
      tags: [],
    }));
  }

  res.status(201).json({ items: created });
});

// POST /api/media/from-url — register an external URL (matches the "From URL" tab).
router.post('/from-url', express.json(), (req, res) => {
  const { url, alt, folder, kind, name, tags } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url_required' });
  const inferredKind = kind || (/\.(mp4|mov|webm)(\?|$)/i.test(url) || /youtube|vimeo/i.test(url) ? 'video' : 'image');
  const inferredName = name || url.split('/').pop().split('?')[0] || 'asset';
  const id = `u-${newId()}`;
  const asset = repo.createAsset({
    id,
    kind: inferredKind,
    name: inferredName,
    folder: folder || 'site',
    url,
    thumb: url,
    alt,
    tags: Array.isArray(tags) ? tags : [],
    uploaded: new Date().toISOString().slice(0, 10),
  });
  res.status(201).json(asset);
});

// PATCH /api/media/:id — used by the detail drawer's "Save changes".
router.patch('/:id', express.json(), (req, res) => {
  const patch = { ...req.body };
  if (typeof patch.tags === 'string') {
    patch.tags = patch.tags.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (patch.size && !patch.size_bytes) patch.size_bytes = parseSizeToBytes(patch.size);
  const asset = repo.updateAsset(req.params.id, patch);
  if (!asset) return res.status(404).json({ error: 'not_found' });
  res.json(asset);
});

// DELETE /api/media/:id
router.delete('/:id', (req, res) => {
  const ok = repo.deleteAsset(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.status(204).end();
});

// POST /api/media/bulk — fan-out for the multi-select bulk action bar.
router.post('/bulk', express.json(), (req, res) => {
  const { action, ids = [], folder, tags } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids_required' });

  switch (action) {
    case 'delete':
      return res.json({ action, affected: repo.bulkDelete(ids) });
    case 'move':
      if (!folder) return res.status(400).json({ error: 'folder_required' });
      return res.json({ action, affected: repo.bulkMove(ids, folder) });
    case 'tag':
      if (!Array.isArray(tags) || !tags.length) return res.status(400).json({ error: 'tags_required' });
      return res.json({ action, affected: repo.bulkAddTags(ids, tags) });
    default:
      return res.status(400).json({ error: 'unknown_action' });
  }
});

// Multer's errors arrive here so the client gets useful JSON instead of an HTML 500.
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code, message: err.message });
  }
  if (err) {
    return res.status(400).json({ error: 'upload_failed', message: err.message });
  }
});

module.exports = router;
