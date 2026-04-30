// Shared media library state + reusable MediaPicker modal.
// Wires the admin UI to the InvestSMA backend at /api/*.

// MEDIA_ASSETS / MEDIA_FOLDERS used to be hard-coded in the design prototype.
// We now hydrate them from the API the first time the page mounts and expose
// a small store hook so any admin page (media library, media picker, etc.)
// reads from the same cache.

const MediaStore = (function () {
  let assets = [];
  let folders = [];
  let storage = null;
  let loaded = false;
  let loading = null;
  const listeners = new Set();

  function emit() { listeners.forEach(l => l()); }

  async function load() {
    if (loaded) return { assets, folders, storage };
    if (loading) return loading;
    loading = (async () => {
      const [m, f, s] = await Promise.all([
        window.api.listMedia({ limit: 500 }),
        window.api.listFolders(),
        window.api.storage(),
      ]);
      assets = m.items;
      folders = f.items;
      storage = s;
      loaded = true;
      emit();
      return { assets, folders, storage };
    })();
    try { return await loading; } finally { loading = null; }
  }

  async function refresh() {
    loaded = false;
    return load();
  }

  return {
    load, refresh,
    get assets()  { return assets; },
    get folders() { return folders; },
    get storage() { return storage; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();

// React hook: returns { assets, folders, storage, loading, refresh }.
function useMediaStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  const [loading, setLoading] = React.useState(!MediaStore.assets.length);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const unsub = MediaStore.subscribe(force);
    let alive = true;
    setLoading(true);
    MediaStore.load()
      .then(() => { if (alive) setLoading(false); })
      .catch(e => { if (alive) { setError(e); setLoading(false); } });
    return () => { alive = false; unsub(); };
  }, []);

  return {
    assets: MediaStore.assets,
    folders: MediaStore.folders,
    storage: MediaStore.storage,
    loading, error,
    refresh: () => MediaStore.refresh(),
  };
}

// Backward-compat globals so any code that still references MEDIA_ASSETS /
// MEDIA_FOLDERS directly keeps working — they're just live arrays now.
Object.defineProperty(window, 'MEDIA_ASSETS',  { get: () => MediaStore.assets });
Object.defineProperty(window, 'MEDIA_FOLDERS', { get: () => MediaStore.folders });

// ============== MEDIA PICKER MODAL ==============
// Usage: <MediaPicker open kind="image" multiple onSelect={(assets) => …} onClose={…} />

function MediaPicker({ open, kind, multiple, onSelect, onClose, title }) {
  const { assets, folders } = useMediaStore();
  const [folder, setFolder] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState([]);
  const [tab, setTab] = React.useState('library');

  if (!open) return null;

  const filtered = assets.filter(a => {
    if (kind && a.kind !== kind) return false;
    if (folder !== 'all' && !a.folder.startsWith(folder)) return false;
    if (search && !(a.name + ' ' + (a.tags || []).join(' ') + ' ' + (a.alt || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (asset) => {
    if (multiple) {
      setSelected(prev => prev.find(a => a.id === asset.id) ? prev.filter(a => a.id !== asset.id) : [...prev, asset]);
    } else {
      setSelected([asset]);
    }
  };

  const confirm = () => {
    onSelect(multiple ? selected : selected[0]);
    setSelected([]);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'grid', placeItems: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        width: 'min(1100px, 100%)', height: 'min(720px, 90vh)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{title || 'Select media'}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {kind ? `${kind === 'image' ? 'Images' : 'Videos'} only · ` : ''}
              {multiple ? 'Select multiple' : 'Select one'}
            </div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'library', l: `Library (${assets.length})` },
            { id: 'upload',  l: 'Upload new' },
            { id: 'url',     l: 'From URL' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: '2px solid ' + (tab === t.id ? 'var(--fg)' : 'transparent'),
              fontWeight: tab === t.id ? 600 : 500, fontSize: 13,
              color: tab === t.id ? 'var(--fg)' : 'var(--fg-muted)',
            }}>{t.l}</button>
          ))}
        </div>

        {tab === 'library' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', overflow: 'hidden' }}>
            <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '12px 0', background: 'var(--surface-2)' }}>
              <div style={{ padding: '4px 16px 8px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Folders</div>
              {folders.map(f => (
                <button key={f.id} onClick={() => setFolder(f.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: `7px 16px 7px ${16 + (f.depth || 0) * 12}px`,
                  background: folder === f.id ? 'var(--bg-subtle)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left',
                  color: folder === f.id ? 'var(--fg)' : 'var(--fg-muted)',
                  fontWeight: folder === f.id ? 600 : 500,
                }}>
                  <span>{f.label}</span>
                  <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{f.count}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Icon name="search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: 0.5 }} />
                  <input className="input" style={{ paddingLeft: 32 }} placeholder="Search by name, tag, or alt text…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <span className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--fg-muted)' }}>
                    <Icon name="search" style={{ width: 32, height: 32, opacity: 0.3, marginBottom: 8 }} />
                    <div>No matching assets</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {filtered.map(asset => {
                      const isSelected = selected.find(a => a.id === asset.id);
                      return (
                        <button key={asset.id} onClick={() => toggle(asset)} style={{
                          background: 'var(--surface)', border: '2px solid ' + (isSelected ? 'var(--fg)' : 'var(--border)'),
                          borderRadius: 'var(--radius)', padding: 0, cursor: 'pointer', textAlign: 'left',
                          overflow: 'hidden', position: 'relative',
                        }}>
                          <div style={{ aspectRatio: '4/3', background: 'var(--bg-subtle)', overflow: 'hidden', position: 'relative' }}>
                            <img src={asset.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {asset.kind === 'video' && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'grid', placeItems: 'center' }}>
                                  <span style={{ borderLeft: '10px solid #14130F', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 3 }} />
                                </div>
                              </div>
                            )}
                            {asset.kind === 'video' && asset.duration && (
                              <span className="mono" style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, padding: '2px 5px', borderRadius: 3 }}>{asset.duration}</span>
                            )}
                            {isSelected && (
                              <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--fg)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12 }}>
                                <Icon name="check" style={{ width: 14, height: 14 }} />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{asset.dims} · {asset.size}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'upload' && <PickerUploadTab onUploaded={() => { MediaStore.refresh(); setTab('library'); }} />}
        {tab === 'url'    && <PickerUrlTab    onAdded={()    => { MediaStore.refresh(); setTab('library'); }} folders={folders} />}

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            {selected.length > 0 ? `${selected.length} selected` : 'Click an asset to select'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={selected.length === 0} onClick={confirm}>
              Use {selected.length > 0 ? `${selected.length} ${kind || 'asset'}${selected.length !== 1 ? 's' : ''}` : 'selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PickerUploadTab({ onUploaded }) {
  const inputRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const onFiles = async (files) => {
    if (!files || !files.length) return;
    setBusy(true); setError(null);
    try {
      await window.api.uploadFiles(Array.from(files));
      onUploaded && onUploaded();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40 }}>
      <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '60px 40px', textAlign: 'center', maxWidth: 520, width: '100%' }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
        <Icon name="upload" style={{ width: 40, height: 40, opacity: 0.4, marginBottom: 12 }} />
        <div style={{ fontWeight: 600, fontSize: 16 }}>Drop files to upload</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>JPG, PNG, WebP, SVG, MP4 · max 200 MB · multiple OK</div>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => onFiles(e.target.files)} />
        <button className="btn" style={{ marginTop: 20 }} onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>
          <Icon name="upload" /> {busy ? 'Uploading…' : 'Choose files'}
        </button>
        {error && <div style={{ color: 'var(--status-danger)', fontSize: 12, marginTop: 12 }}>{error}</div>}
        <div className="muted" style={{ fontSize: 11, marginTop: 16 }}>Files are auto-resized to 3 sizes (thumb / medium / full) and CDN-hosted on upload.</div>
      </div>
    </div>
  );
}

function PickerUrlTab({ folders, onAdded }) {
  const [url, setUrl] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [folder, setFolder] = React.useState('site/hero');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = async () => {
    if (!url.trim()) return;
    setBusy(true); setError(null);
    try {
      await window.api.addFromUrl({ url: url.trim(), alt: alt.trim(), folder });
      onAdded && onAdded();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const folderOpts = (folders || []).filter(f => f.id !== 'all');

  return (
    <div style={{ flex: 1, padding: 40 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="form-label">Paste image, YouTube, or Vimeo URL</div>
        <input className="input" placeholder="https://…" style={{ marginBottom: 16 }} value={url} onChange={e => setUrl(e.target.value)} />
        <div className="form-label">Alt text</div>
        <input className="input" placeholder="Describe the image for accessibility…" style={{ marginBottom: 16 }} value={alt} onChange={e => setAlt(e.target.value)} />
        <div className="form-label">Folder</div>
        <select className="select" value={folder} onChange={e => setFolder(e.target.value)}>
          {folderOpts.map(f => <option key={f.id} value={f.id}>{f.id}</option>)}
        </select>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={submit} disabled={busy || !url.trim()}>
          {busy ? 'Adding…' : 'Add to library'}
        </button>
        {error && <div style={{ color: 'var(--status-danger)', fontSize: 12, marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { MediaStore, MediaPicker, useMediaStore });
