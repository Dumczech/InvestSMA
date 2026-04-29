# InvestSMA — Admin Backend

Node + Express + SQLite backend for the InvestSMA admin. The first page wired up
is **Media Library** (`admin/media.html`) — the design from the Claude Design
handoff is rendered as-is, with all data flowing through this server.

## Run

```bash
npm install
npm start          # http://localhost:3000/admin/media.html
```

The database auto-seeds on first boot from the placeholder `MEDIA_ASSETS` /
`MEDIA_FOLDERS` data in the design bundle. To reset:

```bash
npm run reset
```

## Layout

```
src/
  server.js          Express app + static file serving
  db.js              better-sqlite3 connection + schema
  seed.js            Placeholder data, mirrors the design's MEDIA_ASSETS
  util/format.js     Bytes ⇄ "2.4 MB" and "4032×3024" parsing
  repo/media.js      Data-access layer (queries + mappers)
  routes/
    media.js         /api/media — list, get, patch, delete, bulk, upload, from-url
    folders.js       /api/folders — tree + counts, create
    storage.js       /api/storage — used / quota / percent
public/admin/        Design files (HTML/CSS/JSX) wired to /api/*
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
