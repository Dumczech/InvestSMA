// MEDIA LIBRARY — full admin page, wired to the InvestSMA API.

function MediaLibraryPage() {
  const { assets, folders: folderItems, storage, loading, refresh } = useMediaStore();

  const [view, setView] = React.useState('grid');
  const [folder, setFolder] = React.useState('all');
  const [kind, setKind] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState('uploaded-desc');
  const [selected, setSelected] = React.useState(new Set());
  const [detail, setDetail] = React.useState(null);
  const [showUpload, setShowUpload] = React.useState(false);
  const [showNewFolder, setShowNewFolder] = React.useState(false);

  const folderTree = folderItems && folderItems.length
    ? folderItems
    : [{ id: 'all', label: 'All assets', icon: 'grid', depth: 0, count: 0 }];

  const filtered = React.useMemo(() => {
    let list = assets.filter(a => {
      if (folder !== 'all' && !a.folder.startsWith(folder)) return false;
      if (kind !== 'all' && a.kind !== kind) return false;
      if (search) {
        const s = search.toLowerCase();
        const inTags = (a.tags || []).some(t => t.toLowerCase().includes(s));
        if (!a.name.toLowerCase().includes(s) && !inTags && !(a.alt || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
    list = [...list];
    if (sort === 'uploaded-desc') list.sort((a, b) => (b.uploaded || '').localeCompare(a.uploaded || ''));
    else if (sort === 'uploaded-asc') list.sort((a, b) => (a.uploaded || '').localeCompare(b.uploaded || ''));
    else if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === 'size-desc') list.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
    return list;
  }, [assets, folder, kind, search, sort]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(filtered.map(a => a.id)));
  const clearSelection = () => setSelected(new Set());

  const runBulk = async (action, payload = {}) => {
    const ids = [...selected];
    if (!ids.length) return;
    if (action === 'delete' && !window.confirm(`Delete ${ids.length} assets? This cannot be undone.`)) return;
    try {
      await window.api.bulkMedia(action, { ids, ...payload });
      clearSelection();
      await refresh();
    } catch (e) { alert(e.message); }
  };

  const onDeleteOne = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await window.api.deleteMedia(id);
      setDetail(null);
      await refresh();
    } catch (e) { alert(e.message); }
  };

  const onSaveDetail = async (id, patch) => {
    try {
      await window.api.updateMedia(id, patch);
      setDetail(null);
      await refresh();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="main">
      <Topbar crumbs={['Media library']}>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowNewFolder(true)}><Icon name="folder" /> New folder</button>
        <button className="btn btn-sm btn-primary" onClick={() => setShowUpload(true)}><Icon name="upload" /> Upload</button>
      </Topbar>

      <div className="page" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 56px)' }}>
          <aside style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', padding: '20px 0' }}>
            <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Library</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {folderTree.map(f => {
                const active = folder === f.id;
                return (
                  <button key={f.id} onClick={() => setFolder(f.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: `7px 20px 7px ${20 + (f.depth || 0) * 16}px`,
                      background: active ? 'var(--bg-subtle)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: 13, color: active ? 'var(--fg)' : 'var(--fg-muted)',
                      fontWeight: active ? 600 : 400,
                      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    }}>
                    <Icon name={f.icon || 'folder'} style={{ width: 14, height: 14, opacity: 0.7 }} />
                    <span style={{ flex: 1 }}>{f.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{f.count || 0}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '20px', marginTop: 16, borderTop: '1px solid var(--border)' }}>
              <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Storage</div>
              <div style={{ height: 4, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${(storage && storage.percent) || 0}%`, background: 'var(--accent)' }} />
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                {storage ? `${storage.used} of ${storage.quota} used` : '— of 5 GB used'}
              </div>
            </div>
          </aside>

          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h1 className="page-title" style={{ fontSize: 22 }}>{folderTree.find(f => f.id === folder)?.label || 'All assets'}</h1>
                <p className="page-subtitle">
                  {loading ? 'Loading…' : `${filtered.length} of ${assets.length} assets · ${filtered.filter(a => a.kind === 'image').length} images · ${filtered.filter(a => a.kind === 'video').length} videos`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
                <div className="addon"><Icon name="search" /></div>
                <input className="input" placeholder="Search filename, tag, alt text…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="select" value={kind} onChange={e => setKind(e.target.value)} style={{ width: 130 }}>
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
              <select className="select" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 160 }}>
                <option value="uploaded-desc">Newest first</option>
                <option value="uploaded-asc">Oldest first</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="size-desc">Largest first</option>
              </select>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button onClick={() => setView('grid')} className="btn btn-sm" style={{ border: 'none', borderRadius: 0, background: view === 'grid' ? 'var(--bg-subtle)' : 'transparent' }}>
                  <Icon name="grid" /> Grid
                </button>
                <button onClick={() => setView('list')} className="btn btn-sm" style={{ border: 'none', borderRadius: 0, background: view === 'list' ? 'var(--bg-subtle)' : 'transparent', borderLeft: '1px solid var(--border)' }}>
                  <Icon name="list" /> List
                </button>
              </div>
            </div>

            {selected.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--fg)', color: '#fff', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
                <span style={{ flex: 1 }} />
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }} onClick={() => {
                  const f = window.prompt('Move to folder id (e.g. site/hero):'); if (f) runBulk('move', { folder: f });
                }}><Icon name="folder" /> Move to folder</button>
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }} onClick={() => {
                  const t = window.prompt('Tags (comma-separated):'); if (t) runBulk('tag', { tags: t.split(',').map(s => s.trim()).filter(Boolean) });
                }}><Icon name="tag" /> Add tags</button>
                <button className="btn btn-sm" style={{ background: 'rgba(255,80,80,0.2)', color: '#fff', border: 'none' }} onClick={() => runBulk('delete')}><Icon name="trash" /> Delete</button>
                <button className="btn btn-sm btn-ghost" style={{ color: '#fff' }} onClick={clearSelection}>Clear</button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ padding: '80px 24px', textAlign: 'center', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)' }}>
                <Icon name="image" style={{ width: 32, height: 32, opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontWeight: 600 }}>{loading ? 'Loading assets…' : 'No assets match'}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Try a different folder or clear filters</div>
              </div>
            ) : view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {filtered.map(a => {
                  const isSel = selected.has(a.id);
                  return (
                    <div key={a.id}
                      onClick={(e) => { if (e.shiftKey || e.metaKey || e.ctrlKey) toggleSelect(a.id); else setDetail(a); }}
                      style={{ border: '1px solid ' + (isSel ? 'var(--accent)' : 'var(--border)'), borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}>
                      <div style={{ aspectRatio: '4/3', background: 'var(--bg-subtle)', position: 'relative', overflow: 'hidden' }}>
                        <img src={a.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {a.kind === 'video' && (
                          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <span style={{ borderLeft: '14px solid #fff', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', marginLeft: 4 }} />
                          </div>
                        )}
                        <label onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, background: 'rgba(255,255,255,0.95)', borderRadius: 3, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(a.id)} style={{ margin: 0 }} />
                        </label>
                        <span style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 10, padding: '2px 6px', background: 'rgba(20,19,15,0.85)', color: '#fff', borderRadius: 3, fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>{a.kind}</span>
                        {a.duration && <span style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 10, padding: '2px 6px', background: 'rgba(20,19,15,0.85)', color: '#fff', borderRadius: 3, fontFamily: 'var(--f-mono)' }}>{a.duration}</span>}
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 2 }}>{a.dims} · {a.size}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="table-wrap">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 32 }}><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={() => selected.size === filtered.length ? clearSelection() : selectAll()} /></th>
                        <th>Asset</th>
                        <th>Type</th>
                        <th>Folder</th>
                        <th>Dims</th>
                        <th className="num">Size</th>
                        <th>Used in</th>
                        <th>Uploaded</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id}>
                          <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                          <td onClick={() => setDetail(a)} style={{ cursor: 'pointer' }}>
                            <div className="row gap-12">
                              <div style={{ width: 40, height: 30, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                                <img src={a.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</div>
                                <div className="row-sub mono" style={{ fontSize: 11 }}>{a.id}</div>
                              </div>
                            </div>
                          </td>
                          <td><Badge kind="outline">{a.kind}</Badge></td>
                          <td className="mono" style={{ fontSize: 12 }}>{a.folder}</td>
                          <td className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{a.dims}</td>
                          <td className="num mono" style={{ fontSize: 12 }}>{a.size}</td>
                          <td style={{ fontSize: 12 }}>
                            {(a.usedIn || []).slice(0, 1).map((u, i) => <div key={i} style={{ color: 'var(--fg-muted)' }}>{u}</div>)}
                            {(a.usedIn || []).length > 1 && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>+{a.usedIn.length - 1} more</span>}
                          </td>
                          <td className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{a.uploaded}</td>
                          <td><button className="btn btn-icon btn-ghost btn-sm" onClick={() => setDetail(a)}><Icon name="more" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {detail && <MediaDetailDrawer asset={detail} onClose={() => setDetail(null)} onDelete={onDeleteOne} onSave={onSaveDetail} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onDone={() => { setShowUpload(false); refresh(); }} />}
      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} onCreated={() => { setShowNewFolder(false); refresh(); }} />}
    </div>
  );
}

function MediaDetailDrawer({ asset, onClose, onDelete, onSave }) {
  const [name, setName] = React.useState(asset.name);
  const [alt, setAlt]   = React.useState(asset.alt || '');
  const [tags, setTags] = React.useState((asset.tags || []).join(', '));
  const [busy, setBusy] = React.useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await onSave(asset.id, {
        name,
        alt,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      });
    } finally { setBusy(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.4)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(480px, 100%)', background: 'var(--bg)', overflowY: 'auto', borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{asset.id}</div>
            <div style={{ fontWeight: 600 }}>Asset details</div>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ aspectRatio: '4/3', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
            <img src={asset.url} alt={asset.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {asset.kind === 'video' && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.95)' }}><Icon name="play" /> Play preview</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            <a className="btn btn-sm" href={asset.url} target="_blank" rel="noreferrer" download><Icon name="download" /> Download</a>
            <button className="btn btn-sm" onClick={() => navigator.clipboard && navigator.clipboard.writeText(asset.url)}><Icon name="copy" /> Copy URL</button>
            <button className="btn btn-sm" onClick={() => {
              const f = window.prompt('Move to folder id:', asset.folder);
              if (f && f !== asset.folder) onSave(asset.id, { folder: f });
            }}><Icon name="folder" /> Move</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(asset.id)}><Icon name="trash" /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label className="label">Filename</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Alt text <span className="help">For accessibility &amp; SEO</span></label>
              <textarea className="textarea" rows={2} value={alt} onChange={e => setAlt(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Tags <span className="help">Comma-separated</span></label>
              <input className="input" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Dimensions</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{asset.dims}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>File size</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{asset.size}</div>
              </div>
              {asset.duration && (
                <div>
                  <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Duration</div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{asset.duration}</div>
                </div>
              )}
              <div>
                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Uploaded</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{asset.uploaded}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Folder</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{asset.folder}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Public URL</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)', wordBreak: 'break-all' }}>{asset.url}</div>
              </div>
            </div>

            <div>
              <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Used in</div>
              {(asset.usedIn || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(asset.usedIn || []).map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}>
                      <Icon name="link" style={{ width: 12, height: 12, opacity: 0.5 }} />
                      <span style={{ flex: 1 }}>{u}</span>
                      <Icon name="external" style={{ width: 12, height: 12, opacity: 0.5 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 12 }}>Not currently used anywhere — safe to delete.</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onDone }) {
  const [files, setFiles] = React.useState([]);
  const inputRef = React.useRef(null);

  const onPick = async (fileList) => {
    if (!fileList || !fileList.length) return;
    const initial = Array.from(fileList).map(f => ({
      file: f, name: f.name, size: prettyBytes(f.size), progress: 0, status: 'queued',
    }));
    setFiles(prev => [...prev, ...initial]);

    for (let i = 0; i < initial.length; i++) {
      const idx = files.length + i;
      try {
        setFiles(prev => prev.map((f, k) => k === idx ? { ...f, status: 'uploading', progress: 30 } : f));
        await window.api.uploadFiles([initial[i].file]);
        setFiles(prev => prev.map((f, k) => k === idx ? { ...f, status: 'done', progress: 100 } : f));
      } catch (e) {
        setFiles(prev => prev.map((f, k) => k === idx ? { ...f, status: 'error', error: e.message } : f));
      }
    }
  };

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'error');

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(20,19,15,0.5)', zIndex: 100, display: 'grid', placeItems: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: 'min(640px, 100%)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Upload assets</div>
            <div className="muted" style={{ fontSize: 12 }}>Drop files or browse · Up to 200 MB per file</div>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); onPick(e.dataTransfer.files); }}
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', background: 'var(--bg-subtle)', cursor: 'pointer' }}>
            <Icon name="upload" style={{ width: 32, height: 32, opacity: 0.4, marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>Drag files here or click to browse</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG, WebP, MP4, MOV, PDF</div>
            <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => onPick(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                {files.filter(f => f.status === 'uploading').length} uploading · {files.filter(f => f.status === 'done').length} done
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 24px', gap: 12, alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{f.size} {f.error ? `· ${f.error}` : ''}</div>
                      {f.status === 'uploading' && (
                        <div style={{ height: 3, background: 'var(--bg-subtle)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${f.progress}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
                        </div>
                      )}
                    </div>
                    <div className="mono" style={{ fontSize: 11, textAlign: 'right', color: f.status === 'done' ? 'var(--success, #16A34A)' : f.status === 'error' ? 'var(--status-danger)' : 'var(--fg-muted)' }}>
                      {f.status === 'done' ? '✓ Done' : f.status === 'error' ? 'Failed' : f.status === 'uploading' ? `${f.progress}%` : 'Queued'}
                    </div>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setFiles(prev => prev.filter((_, k) => k !== i))}><Icon name="close" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="info" style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              <strong style={{ color: 'var(--fg)' }}>Auto-optimization on.</strong> Images are converted to WebP and resized to 3 sizes (thumb, medium, original). Videos transcoded to H.264 1080p with HLS variants for streaming.
            </div>
          </div>
        </div>
        <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onDone} disabled={files.length > 0 && !allDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

function NewFolderModal({ onClose, onCreated }) {
  const [id, setId] = React.useState('');
  const [label, setLabel] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = async () => {
    if (!id.trim() || !label.trim()) return;
    setBusy(true); setError(null);
    try {
      await window.api.createFolder({ id: id.trim(), label: label.trim() });
      onCreated && onCreated();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(20,19,15,0.5)', zIndex: 100, display: 'grid', placeItems: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: 'min(440px, 100%)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>New folder</div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label">Folder ID <span className="help">slug, e.g. <code>properties/casa-rosa</code></span></label>
            <input className="input" value={id} onChange={e => setId(e.target.value)} placeholder="properties/new-listing" />
          </div>
          <div className="field">
            <label className="label">Label</label>
            <input className="input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Casa Rosa" />
          </div>
          {error && <div style={{ color: 'var(--status-danger)', fontSize: 12 }}>{error}</div>}
        </div>
        <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy || !id.trim() || !label.trim()}>{busy ? 'Creating…' : 'Create folder'}</button>
        </div>
      </div>
    </div>
  );
}

function prettyBytes(bytes) {
  if (!bytes) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB']; let i = 0; let n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

function App() { return <div className="app"><Sidebar active="media" /><MediaLibraryPage /></div>; }
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
