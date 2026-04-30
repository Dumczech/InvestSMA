# InvestSMA — Backend

Node + Express + SQLite backend for the InvestSMA site + admin. Pages wired up
so far:

- `/admin/media.html` — Media Library (filter, sort, multi-select, bulk ops, upload, picker)
- `/legal/legal.html` — Disclosures & Terms of Use (with acceptance recording)

## Run

```bash
npm install
npm start          # http://localhost:3000
```

The database auto-seeds on first boot. To reset:

```bash
npm run reset
```

## Test

```bash
npm test
```

Uses Node's built-in `--test` runner. The suite spins up the express app on a
temp SQLite database, exercises every public route, and asserts both happy and
error paths. **All tests must pass for new builds.**

## Layout

```
src/
  server.js          Express app + static file serving
  db.js              better-sqlite3 connection + schema
  seed.js            Placeholder data, mirrors the design's MEDIA_ASSETS
  util/format.js     Bytes ⇄ "2.4 MB" and "4032×3024" parsing
  repo/media.js      Data-access layer (queries + mappers)
  seed-legal.js      Disclosures + Terms content from the design's legal.jsx
  repo/legal.js      Legal documents + acceptance log
  routes/
    media.js         /api/media — list, get, patch, delete, bulk, upload, from-url
    folders.js       /api/folders — tree + counts, create
    storage.js       /api/storage — used / quota / percent
    legal.js         /api/legal — documents + acceptances
public/admin/        Media library design files wired to /api/*
public/legal/        Legal page design files wired to /api/legal
tests/               node --test suite (format, media, legal)
uploads/             multipart upload destination (gitignored)
data/                SQLite database (gitignored)
```

## API

| Method | Path | Notes |
|---|---|---|
| GET    | `/api/media` | `?folder&kind&search&sort&limit&offset` — folder match is prefix-aware |
| GET    | `/api/media/:id` | single asset with tags + usages |
| PATCH  | `/api/media/:id` | update name, folder, alt, tags, duration |
| DELETE | `/api/media/:id` | |
| POST   | `/api/media/upload` | multipart `files[]` + optional `folder` |
| POST   | `/api/media/from-url` | register an external URL (Vimeo/YouTube/image) |
| POST   | `/api/media/bulk` | `{ action: 'delete'\|'move'\|'tag', ids, folder?, tags? }` |
| GET    | `/api/folders` | tree with rolled-up counts including subfolders |
| POST   | `/api/folders` | `{ id, label, icon? }` |
| GET    | `/api/storage` | `{ used, quota, usedBytes, quotaBytes, percent, total, images, videos }` |
| GET    | `/api/legal` | both documents + version metadata for `legal.html` |
| GET    | `/api/legal/:slug` | single legal document (`disclosures` or `terms`) |
| POST   | `/api/legal/acceptances` | record acknowledgement (intent, email?, documents[]) |
| GET    | `/api/legal/acceptances` | list recorded acceptances (admin) |
| GET    | `/api/health` | liveness probe |

### Filter / sort semantics

`folder=properties` matches every asset under `properties/*` (matches the
`a.folder.startsWith(folder)` rule used by the design's frontend filter). `sort`
accepts `uploaded-desc` (default), `uploaded-asc`, `name-asc`, `name-desc`,
`size-desc`, `size-asc`.

## Frontend wiring

`public/admin/api.js` exposes a tiny `window.api` client. `media-shared.jsx`
hydrates a `MediaStore` cache (subscribed to via `useMediaStore`) on mount, so
the existing design components — folder tree, grid/list, detail drawer, upload
modal, media picker — render against live data without changing their layout.

Backwards-compat globals `window.MEDIA_ASSETS` and `window.MEDIA_FOLDERS` are
still exposed so any code referencing them continues to work.
