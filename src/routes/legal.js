const express = require('express');
const repo = require('../repo/legal');

const router = express.Router();

// GET /api/legal — both documents (disclosures + terms) in render order.
router.get('/', (_req, res) => {
  const docs = repo.listDocuments();
  if (!docs.length) return res.status(503).json({ error: 'not_seeded' });
  const byKey = Object.fromEntries(docs.map(d => [d.slug, d]));
  const summary = {
    docCode: docs[0].docCode,
    version: docs[0].version,
    lastUpdated: docs.reduce((a, d) => (d.lastUpdated > a ? d.lastUpdated : a), docs[0].lastUpdated),
  };
  res.json({ ...summary, disclosures: byKey.disclosures || null, terms: byKey.terms || null, documents: docs });
});

// POST /api/legal/acceptances — records acknowledgement of disclosures + terms.
router.post('/acceptances', express.json(), (req, res) => {
  const { email, intent, documents } = req.body || {};
  if (!Array.isArray(documents) || !documents.length) {
    return res.status(400).json({ error: 'documents_required' });
  }
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
  }
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;
  try {
    const rec = repo.recordAcceptance({ email, intent, documents, ip, userAgent });
    res.status(201).json(rec);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// GET /api/legal/acceptances — admin listing.
router.get('/acceptances', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
  res.json({ items: repo.listAcceptances({ limit }) });
});

// GET /api/legal/:slug — single document for embedding or PDF export.
// Defined last so that the /acceptances routes above take priority.
router.get('/:slug', (req, res) => {
  const doc = repo.getDocument(req.params.slug);
  if (!doc) return res.status(404).json({ error: 'not_found' });
  res.json(doc);
});

module.exports = router;
