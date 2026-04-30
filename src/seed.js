// Seeds the database with the placeholder MEDIA_ASSETS / MEDIA_FOLDERS from
// the Claude Design handoff (investsma/project/admin/media-shared.jsx).

const db = require('./db');
const { parseSizeToBytes, parseDimsToWidthHeight } = require('./util/format');
const { seedLegal } = require('./seed-legal');

const SMA_PHOTO = (seed, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${seed}?w=${w}&h=${h}&fit=crop&q=80`;

const SEED_FOLDERS = [
  { id: 'site',                          label: 'Site',                  icon: 'home',     depth: 0, sort: 10 },
  { id: 'site/hero',                     label: 'Homepage hero',         icon: 'image',    depth: 1, sort: 11 },
  { id: 'site/brand',                    label: 'Brand · logos',         icon: 'image',    depth: 1, sort: 12 },
  { id: 'site/video',                    label: 'Video',                 icon: 'play',     depth: 1, sort: 13 },
  { id: 'properties',                    label: 'Properties',            icon: 'building', depth: 0, sort: 20 },
  { id: 'properties/casa-olivos',        label: 'Casa de los Olivos',    icon: 'building', depth: 1, sort: 21 },
  { id: 'properties/hacienda-mirador',   label: 'Hacienda Mirador',      icon: 'building', depth: 1, sort: 22 },
  { id: 'properties/casa-bougainvillea', label: 'Casa Bougainvillea',    icon: 'building', depth: 1, sort: 23 },
  { id: 'insights',                      label: 'Insights',              icon: 'edit',     depth: 0, sort: 30 },
  { id: 'insights/headers',              label: 'Article headers',       icon: 'image',    depth: 1, sort: 31 },
  { id: 'reports',                       label: 'Reports & PDFs',        icon: 'file',     depth: 0, sort: 40 },
];

const SEED_ASSETS = [
  { id: 'm-001', kind: 'image', url: SMA_PHOTO('1518780664697-55e3ad937233'), thumb: SMA_PHOTO('1518780664697-55e3ad937233', 320, 240), name: 'casa-olivos-courtyard-01.jpg', folder: 'properties/casa-olivos', size: '2.4 MB', dims: '4032×3024', uploaded: '2026-03-12', tags: ['hero', 'courtyard', 'centro'], usedIn: ['Property: Casa de los Olivos'], alt: 'Stone courtyard with bougainvillea, Casa de los Olivos' },
  { id: 'm-002', kind: 'image', url: SMA_PHOTO('1582719478250-c89cae4dc85b'), thumb: SMA_PHOTO('1582719478250-c89cae4dc85b', 320, 240), name: 'casa-olivos-rooftop-02.jpg',   folder: 'properties/casa-olivos', size: '3.1 MB', dims: '4032×3024', uploaded: '2026-03-12', tags: ['rooftop', 'sunset'], usedIn: ['Property: Casa de los Olivos'], alt: 'Rooftop terrace at golden hour' },
  { id: 'm-003', kind: 'image', url: SMA_PHOTO('1586023492125-27b2c045efd7'), thumb: SMA_PHOTO('1586023492125-27b2c045efd7', 320, 240), name: 'casa-olivos-living-03.jpg',    folder: 'properties/casa-olivos', size: '2.8 MB', dims: '4032×3024', uploaded: '2026-03-12', tags: ['interior', 'living-room'], usedIn: ['Property: Casa de los Olivos'], alt: 'Living room with vaulted ceiling and stone fireplace' },
  { id: 'm-004', kind: 'image', url: SMA_PHOTO('1564013799919-ab600027ffc6'), thumb: SMA_PHOTO('1564013799919-ab600027ffc6', 320, 240), name: 'casa-olivos-master-04.jpg',    folder: 'properties/casa-olivos', size: '2.6 MB', dims: '4032×3024', uploaded: '2026-03-12', tags: ['interior', 'bedroom'], usedIn: ['Property: Casa de los Olivos'], alt: 'Master bedroom with linen curtains' },
  { id: 'm-005', kind: 'image', url: SMA_PHOTO('1600585154340-be6161a56a0c'), thumb: SMA_PHOTO('1600585154340-be6161a56a0c', 320, 240), name: 'casa-olivos-pool-05.jpg',      folder: 'properties/casa-olivos', size: '3.4 MB', dims: '4032×3024', uploaded: '2026-03-12', tags: ['pool', 'exterior'], usedIn: ['Property: Casa de los Olivos'], alt: 'Lap pool surrounded by olive trees' },

  { id: 'm-010', kind: 'image', url: SMA_PHOTO('1613490493576-7fde63acd811'), thumb: SMA_PHOTO('1613490493576-7fde63acd811', 320, 240), name: 'hacienda-mirador-aerial.jpg',     folder: 'properties/hacienda-mirador', size: '4.2 MB', dims: '5472×3648', uploaded: '2026-02-28', tags: ['aerial', 'hero'], usedIn: ['Property: Hacienda Mirador'], alt: 'Aerial view of Hacienda Mirador estate' },
  { id: 'm-011', kind: 'image', url: SMA_PHOTO('1564540586988-aa4e53c3d799'), thumb: SMA_PHOTO('1564540586988-aa4e53c3d799', 320, 240), name: 'hacienda-mirador-grand-room.jpg', folder: 'properties/hacienda-mirador', size: '3.6 MB', dims: '4032×3024', uploaded: '2026-02-28', tags: ['interior'], usedIn: ['Property: Hacienda Mirador'], alt: 'Grand reception room' },
  { id: 'm-012', kind: 'image', url: SMA_PHOTO('1580587771525-78b9dba3b914'), thumb: SMA_PHOTO('1580587771525-78b9dba3b914', 320, 240), name: 'hacienda-mirador-vineyard.jpg',   folder: 'properties/hacienda-mirador', size: '3.2 MB', dims: '4032×3024', uploaded: '2026-02-28', tags: ['exterior', 'vineyard'], usedIn: ['Property: Hacienda Mirador'], alt: 'Private vineyard at dawn' },

  { id: 'm-020', kind: 'image', url: SMA_PHOTO('1512917774080-9991f1c4c750'), thumb: SMA_PHOTO('1512917774080-9991f1c4c750', 320, 240), name: 'casa-bougainvillea-front.jpg',    folder: 'properties/casa-bougainvillea', size: '2.1 MB', dims: '4032×3024', uploaded: '2026-01-22', tags: ['exterior', 'hero'], usedIn: ['Property: Casa Bougainvillea'], alt: 'Pink bougainvillea cascading over stone facade' },
  { id: 'm-021', kind: 'image', url: SMA_PHOTO('1571055107559-3e67626fa8be'), thumb: SMA_PHOTO('1571055107559-3e67626fa8be', 320, 240), name: 'casa-bougainvillea-kitchen.jpg',  folder: 'properties/casa-bougainvillea', size: '2.4 MB', dims: '4032×3024', uploaded: '2026-01-22', tags: ['interior', 'kitchen'], usedIn: ['Property: Casa Bougainvillea'], alt: 'Talavera-tiled chef kitchen' },

  { id: 'm-100', kind: 'image', url: SMA_PHOTO('1518105779142-d975f22f1b0a'), thumb: SMA_PHOTO('1518105779142-d975f22f1b0a', 320, 240), name: 'sma-skyline-parroquia-dusk.jpg', folder: 'site/hero', size: '5.2 MB', dims: '5472×3648', uploaded: '2025-12-15', tags: ['hero', 'parroquia', 'dusk'], usedIn: ['Homepage hero', 'OG default'], alt: 'Parroquia at dusk, San Miguel de Allende skyline' },
  { id: 'm-101', kind: 'image', url: SMA_PHOTO('1564507592333-c60657eea523'), thumb: SMA_PHOTO('1564507592333-c60657eea523', 320, 240), name: 'sma-streets-cobblestone.jpg',    folder: 'site/hero', size: '3.8 MB', dims: '4032×3024', uploaded: '2025-12-15', tags: ['streets', 'centro'], usedIn: [], alt: 'Cobblestone street in Centro Histórico' },
  { id: 'm-102', kind: 'image', url: SMA_PHOTO('1574482620811-1aa16ffe3c82'), thumb: SMA_PHOTO('1574482620811-1aa16ffe3c82', 320, 240), name: 'sma-rooftop-view.jpg',           folder: 'site/hero', size: '4.4 MB', dims: '5472×3648', uploaded: '2025-12-15', tags: ['rooftop', 'panorama'], usedIn: ['Insights hero'], alt: 'Panoramic rooftop view of San Miguel' },

  { id: 'm-200', kind: 'image', url: SMA_PHOTO('1554995207-c18c203602cb'), thumb: SMA_PHOTO('1554995207-c18c203602cb', 320, 240), name: 'investment-trends-2026.jpg',   folder: 'insights/headers', size: '1.8 MB', dims: '2400×1600', uploaded: '2026-03-20', tags: ['insights', 'editorial'], usedIn: ['Post: SMA Investment Trends 2026'], alt: 'Editorial photo for investment trends post' },
  { id: 'm-201', kind: 'image', url: SMA_PHOTO('1497366216548-37526070297c'), thumb: SMA_PHOTO('1497366216548-37526070297c', 320, 240), name: 'tax-strategy-cover.jpg',       folder: 'insights/headers', size: '1.6 MB', dims: '2400×1600', uploaded: '2026-03-08', tags: ['insights', 'tax'], usedIn: ['Post: Tax Strategy for US Investors'], alt: 'Document and pen on wood desk' },
  { id: 'm-202', kind: 'image', url: SMA_PHOTO('1487958449943-2429e8be8625'), thumb: SMA_PHOTO('1487958449943-2429e8be8625', 320, 240), name: 'centro-neighborhood-cover.jpg', folder: 'insights/headers', size: '2.2 MB', dims: '2400×1600', uploaded: '2026-02-14', tags: ['insights', 'centro'], usedIn: ['Post: Centro Neighborhood Guide'], alt: 'Centro neighborhood architecture' },

  { id: 'v-001', kind: 'video', url: 'https://player.vimeo.com/video/824804225',   thumb: SMA_PHOTO('1518105779142-d975f22f1b0a', 320, 240), name: 'sma-cinematic-montage.mp4',   folder: 'site/video',             size: '184 MB', dims: '3840×2160', duration: '1:42', uploaded: '2025-12-20', tags: ['homepage', 'cinematic'], usedIn: ['Homepage hero video'],   alt: 'San Miguel cinematic montage' },
  { id: 'v-002', kind: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumb: SMA_PHOTO('1613490493576-7fde63acd811', 320, 240), name: 'casa-olivos-walkthrough.mp4', folder: 'properties/casa-olivos', size:  '92 MB', dims: '3840×2160', duration: '3:24', uploaded: '2026-03-12', tags: ['walkthrough'],            usedIn: ['Property: Casa de los Olivos'], alt: 'Property walkthrough video' },

  { id: 'm-300', kind: 'image', url: SMA_PHOTO('1611162617474-5b21e879e113'), thumb: SMA_PHOTO('1611162617474-5b21e879e113', 320, 240), name: 'investsma-logo-light.svg', folder: 'site/brand', size: '12 KB', dims: 'vector', uploaded: '2025-11-01', tags: ['logo', 'brand'], usedIn: ['Site nav', 'Footer'],   alt: 'InvestSMA logo, light variant' },
  { id: 'm-301', kind: 'image', url: SMA_PHOTO('1611162616305-c69b3fa7fbe0'), thumb: SMA_PHOTO('1611162616305-c69b3fa7fbe0', 320, 240), name: 'investsma-logo-dark.svg',  folder: 'site/brand', size: '12 KB', dims: 'vector', uploaded: '2025-11-01', tags: ['logo', 'brand'], usedIn: ['Dark sections'],         alt: 'InvestSMA logo, dark variant' },

  { id: 'm-400', kind: 'image', url: SMA_PHOTO('1503387762-cf76f7d495e2'),    thumb: SMA_PHOTO('1503387762-cf76f7d495e2', 320, 240),    name: 'casa-olivos-floorplan.png', folder: 'properties/casa-olivos', size: '440 KB', dims: '2400×1800', uploaded: '2026-03-12', tags: ['floorplan'], usedIn: ['Property: Casa de los Olivos'], alt: 'Floor plan, Casa de los Olivos' },
];

function seed({ reset = false } = {}) {
  if (reset) {
    db.exec(`
      DELETE FROM media_usages;
      DELETE FROM media_tags;
      DELETE FROM media_assets;
      DELETE FROM folders;
      DELETE FROM legal_acceptances;
      DELETE FROM legal_documents;
    `);
  }

  const insertFolder = db.prepare(
    `INSERT OR REPLACE INTO folders (id, label, icon, depth, sort) VALUES (?, ?, ?, ?, ?)`
  );
  const insertAsset = db.prepare(`
    INSERT OR REPLACE INTO media_assets
      (id, kind, name, folder, url, thumb, size_bytes, width, height, dims_label, duration, alt, uploaded)
    VALUES (@id, @kind, @name, @folder, @url, @thumb, @size_bytes, @width, @height, @dims_label, @duration, @alt, @uploaded)
  `);
  const clearTags  = db.prepare(`DELETE FROM media_tags   WHERE asset_id = ?`);
  const insertTag  = db.prepare(`INSERT OR IGNORE INTO media_tags (asset_id, tag) VALUES (?, ?)`);
  const clearUses  = db.prepare(`DELETE FROM media_usages WHERE asset_id = ?`);
  const insertUse  = db.prepare(`INSERT OR IGNORE INTO media_usages (asset_id, label, target_url) VALUES (?, ?, ?)`);

  const tx = db.transaction(() => {
    for (const f of SEED_FOLDERS) insertFolder.run(f.id, f.label, f.icon, f.depth, f.sort);

    for (const a of SEED_ASSETS) {
      const { width, height } = parseDimsToWidthHeight(a.dims);
      insertAsset.run({
        id: a.id,
        kind: a.kind,
        name: a.name,
        folder: a.folder,
        url: a.url,
        thumb: a.thumb,
        size_bytes: parseSizeToBytes(a.size),
        width,
        height,
        dims_label: a.dims,
        duration: a.duration || null,
        alt: a.alt || null,
        uploaded: a.uploaded,
      });
      clearTags.run(a.id);
      for (const tag of a.tags || []) insertTag.run(a.id, tag);
      clearUses.run(a.id);
      for (const u of a.usedIn || []) insertUse.run(a.id, u, null);
    }
  });
  tx();

  seedLegal();

  const count = db.prepare(`SELECT COUNT(*) as n FROM media_assets`).get().n;
  const legal = db.prepare(`SELECT COUNT(*) as n FROM legal_documents`).get().n;
  console.log(`Seeded ${count} media assets, ${SEED_FOLDERS.length} folders, ${legal} legal documents.`);
}

if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seed({ reset });
}

module.exports = { seed, SEED_ASSETS, SEED_FOLDERS };
