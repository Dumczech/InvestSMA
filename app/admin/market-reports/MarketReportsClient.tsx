'use client';

import { useMemo, useState } from 'react';
import { Button, Checkbox, Field, StatusPill, TextArea, TextInput, Toast } from '../_components/forms';

export type ReportRow = {
  id: string;
  title: string;
  period: string;
  summary: string | null;
  pdf_path: string | null;
  published: boolean;
  created_at: string;
};

type Draft = {
  id: string | null;
  title: string;
  period: string;
  summary: string;
  pdf_path: string;
  published: boolean;
};

const EMPTY: Draft = {
  id: null, title: '', period: '', summary: '', pdf_path: '', published: false,
};

function rowToDraft(r: ReportRow): Draft {
  return {
    id: r.id,
    title: r.title,
    period: r.period,
    summary: r.summary ?? '',
    pdf_path: r.pdf_path ?? '',
    published: r.published,
  };
}

export default function MarketReportsClient({ initialRows }: { initialRows: ReportRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [editingId, setEditingId] = useState<string | null>(initialRows[0]?.id ?? null);
  const [draft, setDraft] = useState<Draft>(initialRows[0] ? rowToDraft(initialRows[0]) : EMPTY);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const editing = useMemo(() => rows.find(r => r.id === editingId) ?? null, [rows, editingId]);

  const select = (id: string) => {
    setToast(null);
    const row = rows.find(r => r.id === id);
    if (!row) return;
    setEditingId(id);
    setDraft(rowToDraft(row));
  };

  const startNew = () => {
    setToast(null);
    setEditingId(null);
    setDraft(EMPTY);
  };

  const save = async () => {
    setToast(null);
    if (!draft.title.trim() || !draft.period.trim()) {
      setToast({ tone: 'err', msg: 'Title and period are required.' });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        id: draft.id,
        title: draft.title.trim(),
        period: draft.period.trim(),
        summary: draft.summary.trim() || null,
        pdf_path: draft.pdf_path.trim() || null,
        published: draft.published,
      };
      const r = await fetch('/api/admin/market-reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      const newId = j.id ?? draft.id ?? `tmp-${Date.now()}`;
      setToast({ tone: 'ok', msg: `Saved "${payload.title}".` });
      setRows(prev => {
        const next = prev.filter(p => p.id !== newId);
        const synthetic: ReportRow = {
          id: newId,
          title: payload.title,
          period: payload.period,
          summary: payload.summary,
          pdf_path: payload.pdf_path,
          published: payload.published,
          created_at: editing?.created_at ?? new Date().toISOString(),
        };
        return [synthetic, ...next];
      });
      setEditingId(newId);
      setDraft(prev => ({ ...prev, id: newId }));
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft(prev => ({ ...prev, [k]: v }));

  return (
    <div className='mt-6 grid gap-6 md:grid-cols-[300px_1fr]'>
      <aside className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='text-xs uppercase tracking-wide text-white/50'>Reports</div>
          <Button variant='ghost' onClick={startNew}>+ New</Button>
        </div>
        {rows.length === 0 && (
          <div className='text-sm text-white/50'>No reports yet — click <em>New</em>.</div>
        )}
        <ul className='space-y-1'>
          {rows.map(r => (
            <li key={r.id}>
              <button
                onClick={() => select(r.id)}
                className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-sm transition ${
                  editingId === r.id
                    ? 'border-gold/60 bg-gold/10 text-ivory'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <span className='truncate'>
                  <span className='block font-medium'>{r.title}</span>
                  <span className='block text-xs text-white/50'>{r.period}</span>
                </span>
                <StatusPill status={r.published ? 'published' : 'draft'} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className='space-y-4'>
        <Field label='Title'>
          <TextInput value={draft.title} onChange={v => setField('title', v)} placeholder='SMA Q2 2026 Market Report' />
        </Field>
        <Field label='Period' hint='Free-form, e.g. "Q2 2026" or "March 2026"'>
          <TextInput value={draft.period} onChange={v => setField('period', v)} placeholder='Q2 2026' />
        </Field>
        <Field label='Summary'>
          <TextArea value={draft.summary} onChange={v => setField('summary', v)} rows={4} />
        </Field>
        <Field label='PDF path' hint='Path within the investsma-reports storage bucket'>
          <TextInput value={draft.pdf_path} onChange={v => setField('pdf_path', v)} placeholder='reports/sma-q2-2026.pdf' />
        </Field>
        <Checkbox checked={draft.published} onChange={v => setField('published', v)} label='Published (visible to gated investors)' />

        <div className='flex items-center gap-2'>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update report' : 'Create report'}
          </Button>
          {editing && (
            <span className='text-xs text-white/40'>
              Created {new Date(editing.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </section>
    </div>
  );
}
