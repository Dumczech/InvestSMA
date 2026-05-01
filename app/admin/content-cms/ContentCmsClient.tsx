'use client';

import { useMemo, useState } from 'react';
import { Button, Field, Select, StatusPill, TextArea, TextInput, Toast } from '../_components/forms';

type Row = { key: string; value: unknown; status: string; updated_at: string };
type Status = 'published' | 'draft';

// Well-known keys the homepage reads; we surface them first and offer a
// quick "create from template" so admins don't need to remember the JSON
// shape. Anything else (custom keys) still works via the catch-all editor.
const KNOWN_KEYS: Array<{ key: string; label: string; template: unknown }> = [
  {
    key: 'homepage_hero',
    label: 'Homepage hero',
    template: { headline: '', subheadline: '' },
  },
  {
    key: 'homepage_metrics',
    label: 'Homepage metrics',
    template: { items: [{ label: '', value: '' }] },
  },
  {
    key: 'homepage_market_snapshot',
    label: 'Homepage market snapshot',
    template: {
      title: 'Market Index Snapshot (Compare View)',
      comparisons: [{ label: 'ADR', lrm: '', market: '' }],
      ctaLabel: 'Open Full Dashboard',
      ctaHref: '/market-data',
    },
  },
  {
    key: 'homepage_gated_cta',
    label: 'Homepage gated CTA',
    template: {
      title: 'Gated Market Report',
      body: '',
      ctaLabel: 'Request access',
      ctaHref: '/contact',
    },
  },
];

export default function ContentCmsClient({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [selectedKey, setSelectedKey] = useState<string | null>(initialRows[0]?.key ?? null);
  const [draftKey, setDraftKey] = useState('');
  const [draftJson, setDraftJson] = useState('');
  const [draftStatus, setDraftStatus] = useState<Status>('published');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const selected = useMemo(
    () => rows.find(r => r.key === selectedKey) ?? null,
    [rows, selectedKey],
  );

  // Whenever selection changes, reload the editor with that row's data.
  const selectKey = (k: string) => {
    setSelectedKey(k);
    setToast(null);
    const row = rows.find(r => r.key === k);
    if (row) {
      setDraftKey(row.key);
      setDraftJson(JSON.stringify(row.value, null, 2));
      setDraftStatus((row.status === 'draft' ? 'draft' : 'published'));
    }
  };

  const startNew = (template?: { key: string; template: unknown }) => {
    setSelectedKey(null);
    setDraftKey(template?.key ?? '');
    setDraftJson(JSON.stringify(template?.template ?? {}, null, 2));
    setDraftStatus('published');
    setToast(null);
  };

  const save = async () => {
    setToast(null);
    if (!draftKey.trim()) {
      setToast({ tone: 'err', msg: 'Key is required.' });
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(draftJson);
    } catch (e) {
      setToast({ tone: 'err', msg: `Invalid JSON: ${(e as Error).message}` });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: draftKey.trim(), value: parsed, status: draftStatus }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      setToast({ tone: 'ok', msg: `Saved ${draftKey}.` });

      // Optimistic update: replace or append the row in local state so the
      // sidebar reflects the change without a full reload.
      setRows(prev => {
        const next = prev.filter(p => p.key !== draftKey.trim());
        return [
          ...next,
          { key: draftKey.trim(), value: parsed, status: draftStatus, updated_at: new Date().toISOString() },
        ].sort((a, b) => a.key.localeCompare(b.key));
      });
      setSelectedKey(draftKey.trim());
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='mt-6 grid gap-6 md:grid-cols-[260px_1fr]'>
      <aside className='space-y-2'>
        <div className='text-xs uppercase tracking-wide text-white/50'>Existing keys</div>
        {rows.length === 0 && (
          <div className='text-sm text-white/50'>No rows yet — start with a template below.</div>
        )}
        <ul className='space-y-1'>
          {rows.map(r => (
            <li key={r.key}>
              <button
                onClick={() => selectKey(r.key)}
                className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-sm transition ${
                  selectedKey === r.key
                    ? 'border-gold/60 bg-gold/10 text-ivory'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <span className='truncate'>{r.key}</span>
                <StatusPill status={r.status} />
              </button>
            </li>
          ))}
        </ul>

        <div className='pt-3 text-xs uppercase tracking-wide text-white/50'>Templates</div>
        <ul className='space-y-1'>
          {KNOWN_KEYS.map(t => {
            const exists = rows.some(r => r.key === t.key);
            return (
              <li key={t.key}>
                <button
                  onClick={() => startNew(t)}
                  className='w-full rounded border border-dashed border-white/15 px-2 py-1.5 text-left text-xs text-white/70 hover:bg-white/5'
                >
                  {exists ? 'Reset' : '+ New'} · {t.label}
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => startNew()}
              className='w-full rounded border border-dashed border-white/15 px-2 py-1.5 text-left text-xs text-white/70 hover:bg-white/5'
            >
              + Custom key
            </button>
          </li>
        </ul>
      </aside>

      <section className='space-y-4'>
        <div className='grid gap-3 md:grid-cols-[1fr_180px]'>
          <Field label='Key' hint='snake_case identifier; uniquely names this content block'>
            <TextInput value={draftKey} onChange={setDraftKey} placeholder='homepage_hero' />
          </Field>
          <Field label='Status'>
            <Select<Status>
              value={draftStatus}
              onChange={setDraftStatus}
              options={[
                { value: 'published', label: 'Published' },
                { value: 'draft',     label: 'Draft' },
              ]}
            />
          </Field>
        </div>

        <Field label='Value (JSON)' hint='Free-form JSON; structure depends on the key'>
          <TextArea value={draftJson} onChange={setDraftJson} rows={20} />
        </Field>

        <div className='flex items-center gap-2'>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : selected ? 'Update' : 'Create'}
          </Button>
          {selected && (
            <span className='text-xs text-white/40'>
              Last updated {new Date(selected.updated_at).toLocaleString()}
            </span>
          )}
        </div>

        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </section>
    </div>
  );
}
