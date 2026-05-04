'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Topbar, Icon } from '../AdminShell';
import { MEDIA_LIMITS_TEXT } from '@/lib/media/limits';
import { probeVideo } from '@/lib/media/probe-client';

// Folder tree sidebar, grid + list views, search / kind filter / sort,
// multi-select bulk actions, and a detail drawer over the
// media_assets table. After the metadata migration the table now
// stores `name`, `folder`, `size_bytes`, width/height, and `tags[]`,
// so the design's storage strip + tag filter + per-asset stats are
// all real (not derived). Kind is still derived from mime_type.

type Asset = {
  id: string;
  storage_bucket?: string | null;
  storage_path: string;
  mime_type: string | null;
  module: string | null;
  alt_text: string | null;
  created_at: string;
  name?: string | null;
  folder?: string | null;
  size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  duration_ms?: number | null;
  tags?: string[] | null;
};

type Kind = 'image' | 'video' | 'document' | 'other';

function kindOf(mime?: string | null): Kind {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf' || mime.startsWith('application/')) return 'document';
  return 'other';
}

function nameOf(a: Asset): string {
  if (a.name?.trim()) return a.name;
  const base = a.storage_path.split('/').pop() || a.storage_path;
  return decodeURIComponent(base);
}

function folderOf(a: Asset): string {
  return (a.folder ?? a.module)?.trim() || 'unsorted';
}

function fmtBytes(n?: number | null): string {
  if (n == null || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fmtDims(a: Asset): string {
  if (a.width && a.height) return `${a.width}×${a.height}`;
  return '—';
}

function fmtDuration(ms?: number | null): string {
  if (!ms) return '';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB display ceiling, matches the design

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

const KIND_LABEL: Record<Kind, string> = {
  image: 'Image', video: 'Video', document: 'Document', other: 'Other',
};

// ---------------------------------------------------------------------------

export default function Page() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [folder, setFolder] = useState('all');
  const [kind, setKind] = useState<'all' | Kind>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'uploaded-desc' | 'uploaded-asc' | 'name-asc' | 'name-desc' | 'size-desc'>('uploaded-desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Asset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const load = async () => {
    try {
      const r = await fetch('/api/admin/media-assets');
      const j = await r.json();
      setAssets((j.data ?? []) as Asset[]);
      if (j.warning) setToast({ tone: 'err', msg: j.warning });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    }
  };

  useEffect(() => { load(); }, []);

  // Build a folder tree from actual data (modules) — sorted, with counts.
  const { folderTree, folderCounts } = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    assets.forEach(a => {
      const f = folderOf(a);
      counts[f] = (counts[f] ?? 0) + 1;
    });
    const folders = Array.from(new Set(assets.map(folderOf))).sort();
    const tree: Array<{ id: string; label: string; icon: 'grid' | 'folder' | 'home' | 'building' | 'edit' | 'file'; depth: number }> = [
      { id: 'all', label: 'All assets', icon: 'grid', depth: 0 },
    ];
    for (const f of folders) {
      tree.push({
        id: f,
        label: f.charAt(0).toUpperCase() + f.slice(1),
        icon: f === 'site' ? 'home' : f === 'property' || f === 'properties' ? 'building' : f === 'blog' || f === 'insights' ? 'edit' : f === 'reports' ? 'file' : 'folder',
        depth: 0,
      });
    }
    return { folderTree: tree, folderCounts: counts };
  }, [assets]);

  const filtered = useMemo(() => {
    let list = assets.filter(a => {
      if (folder !== 'all' && folderOf(a) !== folder) return false;
      if (kind !== 'all' && kindOf(a.mime_type) !== kind) return false;
      if (search) {
        const q = search.toLowerCase();
        const tags = (a.tags ?? []).join(' ');
        const hay = `${nameOf(a)} ${a.alt_text ?? ''} ${folderOf(a)} ${tags}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list];
    if (sort === 'uploaded-desc') list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    else if (sort === 'uploaded-asc') list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    else if (sort === 'name-asc')    list.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    else if (sort === 'name-desc')   list.sort((a, b) => nameOf(b).localeCompare(nameOf(a)));
    else if (sort === 'size-desc')   list.sort((a, b) => (b.size_bytes ?? 0) - (a.size_bytes ?? 0));
    return list;
  }, [assets, folder, kind, search, sort]);

  const counts = useMemo(() => ({
    image: filtered.filter(a => kindOf(a.mime_type) === 'image').length,
    video: filtered.filter(a => kindOf(a.mime_type) === 'video').length,
  }), [filtered]);

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const clearSelection = () => setSelected(new Set());

  const folderLabel = folderTree.find(f => f.id === folder)?.label || 'All assets';

  return (
    <div className='main'>
      <Topbar crumbs={['Media library']}>
        <button className='btn btn-sm btn-ghost' title='Folders are organic · upload an asset with a new folder name to create one'>
          <Icon name='folder' /> New folder
        </button>
        <button className='btn btn-sm btn-primary' onClick={() => setShowUpload(true)}>
          <Icon name='upload' /> Upload
        </button>
      </Topbar>

      <div className='page' style={{ padding: 0 }}>
        <div className='media-layout'>
          {/* Sidebar */}
          <aside className='media-sidebar'>
            <div style={{ padding: '0 20px 12px' }}>
              <div className='muted' style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Library</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {folderTree.map(f => {
                const count = folderCounts[f.id] ?? 0;
                const active = folder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFolder(f.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: `7px 20px 7px ${20 + f.depth * 16}px`,
                      background: active ? 'var(--bg-subtle)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: 13, color: active ? 'var(--fg)' : 'var(--fg-muted)',
                      fontWeight: active ? 600 : 400,
                      borderLeft: active ? '2px solid var(--fg)' : '2px solid transparent',
                    }}
                  >
                    <Icon name={f.icon} style={{ width: 14, height: 14, opacity: 0.7 }} />
                    <span style={{ flex: 1 }}>{f.label}</span>
                    <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '20px', marginTop: 16, borderTop: '1px solid var(--border)' }}>
              <div className='muted' style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Storage</div>
              <StorageStrip assets={assets} />
            </div>
          </aside>

          {/* Main */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h1 className='page-title' style={{ fontSize: 22 }}>{folderLabel}</h1>
                <p className='page-subtitle'>
                  {filtered.length} of {assets.length} assets · {counts.image} images · {counts.video} videos
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div className='input-group' style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
                <div className='addon'><Icon name='search' /></div>
                <input
                  className='input'
                  placeholder='Search filename, alt text, folder, tag…'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className='select' value={kind} onChange={e => setKind(e.target.value as 'all' | Kind)} style={{ width: 140 }}>
                <option value='all'>All types</option>
                <option value='image'>Images</option>
                <option value='video'>Videos</option>
                <option value='document'>Documents</option>
              </select>
              <select className='select' value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={{ width: 160 }}>
                <option value='uploaded-desc'>Newest first</option>
                <option value='size-desc'>Largest first</option>
                <option value='uploaded-asc'>Oldest first</option>
                <option value='name-asc'>Name A–Z</option>
                <option value='name-desc'>Name Z–A</option>
              </select>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button onClick={() => setView('grid')} className='btn btn-sm' style={{ border: 'none', borderRadius: 0, background: view === 'grid' ? 'var(--bg-subtle)' : 'transparent' }}>
                  <Icon name='grid' /> Grid
                </button>
                <button onClick={() => setView('list')} className='btn btn-sm' style={{ border: 'none', borderRadius: 0, background: view === 'list' ? 'var(--bg-subtle)' : 'transparent', borderLeft: '1px solid var(--border)' }}>
                  <Icon name='list' /> List
                </button>
              </div>
            </div>

            {/* Bulk bar */}
            {selected.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--fg)', color: '#fff', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
                <span style={{ flex: 1 }} />
                <button className='btn btn-sm' style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }} title='Bulk move requires a confirmation modal — pending'><Icon name='folder' /> Move</button>
                <button className='btn btn-sm' style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }} title='Tag editor lives in the detail drawer — open one asset to manage tags'><Icon name='tag' /> Tags</button>
                <button className='btn btn-sm' style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}><Icon name='download' /> Download</button>
                <button className='btn btn-sm' style={{ background: 'rgba(255,80,80,0.2)', color: '#fff', border: 'none' }} title='TODO: requires DELETE endpoint'><Icon name='trash' /> Delete</button>
                <button className='btn btn-sm btn-ghost' style={{ color: '#fff' }} onClick={clearSelection}>Clear</button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className='empty'>
                <div className='empty-icon'><Icon name='image' /></div>
                <h3>No assets match</h3>
                <p>Try a different folder or clear the search.</p>
              </div>
            ) : view === 'grid' ? (
              <GridView
                items={filtered}
                selected={selected}
                onToggle={toggleSelect}
                onOpen={setDetail}
              />
            ) : (
              <ListView
                items={filtered}
                selected={selected}
                onToggle={toggleSelect}
                onOpen={setDetail}
              />
            )}

            {toast && (
              <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
                {toast.msg}
              </div>
            )}
          </div>
        </div>
      </div>

      {detail && <DetailDrawer asset={detail} onClose={() => setDetail(null)} onSaved={() => { setDetail(null); load(); }} />}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); load(); setToast({ tone: 'ok', msg: 'Upload complete.' }); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid + list views
// ---------------------------------------------------------------------------

function thumbUrl(a: Asset): string | null {
  // Public bucket convention: investsma-assets is public; build a CDN URL
  // when we know the project. Fall back to null and render a placeholder.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = a.storage_bucket || 'investsma-assets';
  if (!base || !a.storage_path) return null;
  if (kindOf(a.mime_type) !== 'image') return null;
  return `${base}/storage/v1/object/public/${bucket}/${a.storage_path}`;
}

function Thumb({ asset, height = 'aspect-43' }: { asset: Asset; height?: 'aspect-43' | 'sq' }) {
  const k = kindOf(asset.mime_type);
  const url = thumbUrl(asset);
  return (
    <div style={{
      aspectRatio: height === 'sq' ? '1/1' : '4/3',
      background: 'var(--bg-subtle)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={asset.alt_text ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--fg-subtle)' }}>
          <Icon name={k === 'video' ? 'play' : k === 'document' ? 'file' : 'image'} style={{ width: 28, height: 28, opacity: 0.5 }} />
        </div>
      )}
      <span style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 10, padding: '2px 6px', background: 'rgba(20,19,15,0.85)', color: '#fff', borderRadius: 3, fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>
        {KIND_LABEL[k]}
      </span>
    </div>
  );
}

function GridView({
  items, selected, onToggle, onOpen,
}: {
  items: Asset[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (a: Asset) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {items.map(a => {
        const isSel = selected.has(a.id);
        return (
          <div
            key={a.id}
            onClick={(e) => {
              if (e.shiftKey || e.metaKey || e.ctrlKey) onToggle(a.id);
              else onOpen(a);
            }}
            style={{
              border: '1px solid ' + (isSel ? 'var(--fg)' : 'var(--border)'),
              borderRadius: 6,
              overflow: 'hidden',
              background: 'var(--surface)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Thumb asset={a} />
            <label
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, background: 'rgba(255,255,255,0.95)', borderRadius: 3, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            >
              <input type='checkbox' checked={isSel} onChange={() => onToggle(a.id)} style={{ margin: 0 }} />
            </label>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nameOf(a)}
              </div>
              <div className='mono' style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 2 }}>
                {a.module ?? '—'} · {fmtDate(a.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  items, selected, onToggle, onOpen,
}: {
  items: Asset[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (a: Asset) => void;
}) {
  return (
    <div className='table-wrap'>
      <div className='table-scroll'>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }} />
              <th>Name</th>
              <th>Folder</th>
              <th>Type</th>
              <th>Alt text</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => {
              const isSel = selected.has(a.id);
              return (
                <tr key={a.id} className={isSel ? 'selected' : ''}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type='checkbox' checked={isSel} onChange={() => onToggle(a.id)} />
                  </td>
                  <td>
                    <button
                      className='row-link'
                      onClick={() => onOpen(a)}
                      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
                    >
                      {nameOf(a)}
                    </button>
                    <div className='row-sub mono' style={{ fontSize: 11 }}>{a.storage_path}</div>
                  </td>
                  <td>{a.module ?? '—'}</td>
                  <td><span className='badge badge-outline'>{KIND_LABEL[kindOf(a.mime_type)]}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{a.alt_text ?? '—'}</td>
                  <td className='mono' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{fmtDate(a.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function DetailDrawer({
  asset, onClose, onSaved,
}: {
  asset: Asset;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [alt, setAlt] = useState(asset.alt_text ?? '');
  const [folder, setFolder] = useState(asset.folder ?? asset.module ?? '');
  const [tagsInput, setTagsInput] = useState((asset.tags ?? []).join(', '));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const url = thumbUrl(asset);
  const k = kindOf(asset.mime_type);

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const r = await fetch('/api/admin/media-assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: asset.id,
          alt_text: alt,
          folder,
          module: folder,
          tags,
        }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className='overlay' onClick={onClose} style={{ background: 'rgba(9,9,11,0.3)' }} />
      <div className='drawer'>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className='row gap-8' style={{ marginBottom: 4 }}>
              <span className='badge badge-outline'>{KIND_LABEL[k]}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: '4px 0', wordBreak: 'break-all' }}>{nameOf(asset)}</h2>
            <div className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{asset.storage_path}</div>
          </div>
          <button className='btn btn-icon btn-ghost' onClick={onClose}><Icon name='close' /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 6, overflow: 'hidden' }}>
            {url && k === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={asset.alt_text ?? ''} style={{ width: '100%', display: 'block' }} />
            ) : (
              <div style={{ aspectRatio: '16/9', display: 'grid', placeItems: 'center', color: 'var(--fg-subtle)' }}>
                <Icon name={k === 'video' ? 'play' : 'file'} style={{ width: 40, height: 40, opacity: 0.5 }} />
              </div>
            )}
          </div>

          <div className='card'>
            <div className='card-body' style={{ padding: 14 }}>
              <Stat k='Type'        v={asset.mime_type ?? '—'} mono />
              <Stat k='Bucket'      v={asset.storage_bucket ?? '—'} mono />
              <Stat k='Folder'      v={folderOf(asset)} mono />
              <Stat k='Uploaded'    v={fmtDate(asset.created_at)} mono />
              <Stat k='Size'        v={fmtBytes(asset.size_bytes)} mono />
              <Stat k='Dimensions'  v={fmtDims(asset)} mono />
              {asset.duration_ms != null && (
                <Stat k='Duration' v={fmtDuration(asset.duration_ms)} mono />
              )}
            </div>
          </div>

          <div className='field'>
            <label className='label'>Alt text <span className='help'>accessibility + SEO</span></label>
            <textarea
              className='textarea'
              rows={2}
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder='Describe the image for screen readers and search engines'
            />
          </div>

          <div className='field'>
            <label className='label'>Folder <span className='help'>e.g. properties/casa-olivos · site/hero · reports</span></label>
            <input className='input' value={folder} onChange={e => setFolder(e.target.value)} />
          </div>

          <div className='field'>
            <label className='label'>Tags <span className='help'>comma-separated</span></label>
            <input
              className='input'
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder='hero, exterior, sunset'
            />
          </div>

          {err && <div className='badge badge-danger' style={{ padding: '8px 12px' }}>{err}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className='btn' onClick={onClose}>Close</button>
            <button className='btn btn-primary' onClick={save} disabled={busy}>
              <Icon name='save' /> {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ k, v, mono = false }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className='stat-row'>
      <span className='k'>{k}</span>
      <span className={`v ${mono ? 'mono' : ''}`}>{v}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storage usage strip
// ---------------------------------------------------------------------------

function StorageStrip({ assets }: { assets: Asset[] }) {
  const total = assets.reduce((sum, a) => sum + (a.size_bytes ?? 0), 0);
  const pct = Math.min(100, (total / STORAGE_QUOTA_BYTES) * 100);
  const known = assets.filter(a => a.size_bytes != null).length;
  return (
    <>
      <div style={{ height: 4, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--fg)' }} />
      </div>
      <div className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
        {fmtBytes(total)} of {fmtBytes(STORAGE_QUOTA_BYTES)} used
      </div>
      <div className='mono muted' style={{ fontSize: 10, marginTop: 4 }}>
        {assets.length} asset{assets.length === 1 ? '' : 's'}
        {known < assets.length ? ` · ${assets.length - known} pre-migration (size unknown)` : ''}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Upload modal
// ---------------------------------------------------------------------------

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [folderName, setFolderName] = useState('property');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData(form);
      fd.set('folder', folderName);
      fd.set('module', folderName);
      fd.set('alt_text', altText);
      fd.set('tags', tags);

      // For videos, probe the file in-browser so the server can store
      // duration + dimensions without bundling ffprobe.
      const file = fd.get('file');
      if (file instanceof File && file.type.startsWith('video/')) {
        const meta = await probeVideo(file);
        if (meta.duration_ms != null) fd.set('duration_ms', String(meta.duration_ms));
        if (meta.width  != null) fd.set('width',  String(meta.width));
        if (meta.height != null) fd.set('height', String(meta.height));
      }

      const r = await fetch('/api/admin/media-assets', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Upload failed');
      onUploaded();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()} style={{ width: 'min(560px, calc(100vw - 32px))' }}>
        <div className='modal-head'>
          <h3 className='modal-title'>Upload asset</h3>
          <p className='modal-desc'>
            Pushes to the <code>investsma-assets</code> Supabase bucket and registers metadata in <code>media_assets</code>.
            Images larger than {MEDIA_LIMITS_TEXT.maxEdge} on the long edge are auto-resized; max upload {MEDIA_LIMITS_TEXT.maxFile}, min image {MEDIA_LIMITS_TEXT.minDims}.
          </p>
        </div>
        <form onSubmit={onSubmit}>
          <div className='modal-body' style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className='field'>
              <label className='label'>File <span className='req'>*</span></label>
              <input type='file' name='file' className='input' required accept='image/*,video/*,.pdf' />
            </div>
            <div className='grid-2' style={{ gap: 12 }}>
              <div className='field'>
                <label className='label'>Folder</label>
                <input className='input' value={folderName} onChange={e => setFolderName(e.target.value)} placeholder='properties/casa-olivos' />
              </div>
              <div className='field'>
                <label className='label'>Alt text</label>
                <input className='input' value={altText} onChange={e => setAltText(e.target.value)} placeholder='Casa Olivos courtyard at sunset' />
              </div>
            </div>
            <div className='field'>
              <label className='label'>Tags <span className='help'>comma-separated</span></label>
              <input className='input' value={tags} onChange={e => setTags(e.target.value)} placeholder='hero, exterior' />
            </div>
            {err && <div className='badge badge-danger' style={{ padding: '8px 12px' }}>{err}</div>}
          </div>
          <div className='modal-foot'>
            <button type='button' className='btn' onClick={onClose}>Cancel</button>
            <button type='submit' className='btn btn-primary' disabled={busy}>
              <Icon name='upload' /> {busy ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
