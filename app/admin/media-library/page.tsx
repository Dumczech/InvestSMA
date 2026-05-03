'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';
import { Field, TextInput, Button, Toast } from '../_components/forms';

type Asset = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  module: string | null;
  alt_text: string | null;
  created_at: string;
};

export default function Page() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [moduleName, setModuleName] = useState('property');
  const [altText, setAltText] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const load = async () => {
    try {
      const r = await fetch('/api/admin/media-assets');
      const j = await r.json();
      setAssets(j.data || []);
      if (j.warning) setToast({ tone: 'err', msg: j.warning });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setToast(null);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set('module', moduleName);
      fd.set('alt_text', altText);
      const r = await fetch('/api/admin/media-assets', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Upload failed');
      setToast({ tone: 'ok', msg: 'Upload complete.' });
      e.currentTarget.reset();
      setAltText('');
      load();
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Media Library']} />
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Media Library</h1>
            <p className='page-subtitle'>
              Upload to the <code>investsma-assets</code> Supabase Storage bucket and register
              metadata in <code>media_assets</code>. Used by properties, articles, and homepage hero.
            </p>
          </div>
        </div>

        <form onSubmit={upload} className='card' style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <Field label='File' required>
            <input type='file' name='file' className='input' required accept='image/*,.pdf' />
          </Field>
          <div className='grid-2'>
            <Field label='Module' hint='property / blog / stats / hero'>
              <TextInput value={moduleName} onChange={setModuleName} placeholder='property' />
            </Field>
            <Field label='Alt text' hint='Accessibility'>
              <TextInput value={altText} onChange={setAltText} placeholder='Casa Olivos courtyard at sunset' />
            </Field>
          </div>
          <div className='row'>
            <Button type='submit' disabled={busy}>
              <Icon name='upload' /> {busy ? 'Uploading…' : 'Upload Asset'}
            </Button>
          </div>
          {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
        </form>

        <div className='grid-3'>
          {assets.map(a => (
            <article key={a.id} className='card' style={{ padding: 16 }}>
              <div style={{ height: 128, borderRadius: 4, background: 'var(--bg-subtle)', marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.storage_path}
              </div>
              <div className='muted' style={{ fontSize: 12 }}>{a.mime_type ?? '—'} · {a.module ?? '—'}</div>
              {a.alt_text && (
                <div className='muted' style={{ fontSize: 12, marginTop: 4 }}>{a.alt_text}</div>
              )}
            </article>
          ))}
          {!assets.length && (
            <div className='muted' style={{ gridColumn: '1 / -1', padding: 16 }}>No assets yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
