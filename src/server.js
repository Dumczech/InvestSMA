const path = require('path');
const fs = require('fs');
const express = require('express');

const db = require('./db');
const { seed } = require('./seed');

const mediaRoutes = require('./routes/media');
const folderRoutes = require('./routes/folders');
const storageRoutes = require('./routes/storage');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Auto-seed on first boot so the design lights up immediately after `npm start`.
const assetCount = db.prepare(`SELECT COUNT(*) AS n FROM media_assets`).get().n;
if (assetCount === 0) {
  console.log('Empty database detected — seeding placeholder media assets.');
  seed();
}

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: path.basename(db.DB_PATH || ''), uptime: process.uptime() });
});

app.use('/api/media',   mediaRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/storage', storageRoutes);

app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true, maxAge: '7d' }));
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Convenience: bare /admin redirects to the media library landing page.
app.get('/admin', (_req, res) => res.redirect('/admin/media.html'));
app.get('/', (_req, res) => res.redirect('/admin/media.html'));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`InvestSMA admin running at http://localhost:${PORT}/admin/media.html`);
  });
}

module.exports = app;
