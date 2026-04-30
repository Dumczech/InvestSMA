const express = require('express');
const repo = require('../repo/media');

const router = express.Router();

// GET /api/folders — folder tree + counts for the left rail in admin/media.html.
router.get('/', (_req, res) => {
  res.json({ items: repo.listFolders() });
});

// POST /api/folders — backs the "+ New folder" button in the topbar.
router.post('/', express.json(), (req, res) => {
  const { id, label, icon } = req.body || {};
  if (!id || !label) return res.status(400).json({ error: 'id_and_label_required' });
  if (!/^[a-z0-9][a-z0-9-_/]*$/.test(id)) return res.status(400).json({ error: 'invalid_id' });
  const folder = repo.createFolder({ id, label, icon });
  res.status(201).json(folder);
});

module.exports = router;
