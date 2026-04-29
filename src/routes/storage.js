const express = require('express');
const repo = require('../repo/media');

const router = express.Router();

// GET /api/storage — stat block under the folder tree ("X GB of 5 GB used").
router.get('/', (_req, res) => {
  res.json(repo.getStorageStats());
});

module.exports = router;
