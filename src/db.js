const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.INVESTSMA_DB || path.join(DATA_DIR, 'investsma.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS media_assets (
    id          TEXT PRIMARY KEY,
    kind        TEXT NOT NULL CHECK (kind IN ('image', 'video', 'document')),
    name        TEXT NOT NULL,
    folder      TEXT NOT NULL,
    url         TEXT NOT NULL,
    thumb       TEXT,
    size_bytes  INTEGER NOT NULL DEFAULT 0,
    width       INTEGER,
    height      INTEGER,
    dims_label  TEXT,
    duration    TEXT,
    alt         TEXT,
    uploaded    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_media_folder   ON media_assets(folder);
  CREATE INDEX IF NOT EXISTS idx_media_kind     ON media_assets(kind);
  CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media_assets(uploaded);

  CREATE TABLE IF NOT EXISTS media_tags (
    asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    tag      TEXT NOT NULL,
    PRIMARY KEY (asset_id, tag)
  );
  CREATE INDEX IF NOT EXISTS idx_media_tags_tag ON media_tags(tag);

  CREATE TABLE IF NOT EXISTS media_usages (
    asset_id  TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    label     TEXT NOT NULL,
    target_url TEXT,
    PRIMARY KEY (asset_id, label)
  );

  CREATE TABLE IF NOT EXISTS folders (
    id     TEXT PRIMARY KEY,
    label  TEXT NOT NULL,
    icon   TEXT,
    depth  INTEGER NOT NULL DEFAULT 0,
    sort   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

module.exports = db;
module.exports.DB_PATH = DB_PATH;
