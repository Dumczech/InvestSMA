'use client';

import { useMemo, useState } from 'react';
import {
  Button, Field, NumberInput, Select, StatusPill, TextArea, TextInput, Toast,
} from '../_components/forms';

export type PropertyRow = {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  price_usd: number | null;
  bedrooms: number | null;
  adr_low: number | null;
  adr_high: number | null;
  annual_gross_low: number | null;
  annual_gross_high: number | null;
  upgrade_potential: string | null;
  investment_thesis: string | null;
  occupancy_assumption: string | null;
  strategy: string | null;
  seasonality: string | null;
  risks: string[] | null;
  images: string[] | null;
  status: string;
  created_at: string;
};

type Status = 'draft' | 'published';

type Draft = {
  slug: string;
  name: string;
  neighborhood: string;
  price_usd: number | '';
  bedrooms: number | '';
  adr_low: number | '';
  adr_high: number | '';
  annual_gross_low: number | '';
  annual_gross_high: number | '';
  upgrade_potential: string;
  investment_thesis: string;
  occupancy_assumption: string;
  strategy: string;
  seasonality: string;
  risks: string;   // newline-separated for the form
  images: string;  // newline-separated for the form
  status: Status;
};

const EMPTY_DRAFT: Draft = {
  slug: '', name: '', neighborhood: '',
  price_usd: '', bedrooms: '',
  adr_low: '', adr_high: '',
  annual_gross_low: '', annual_gross_high: '',
  upgrade_potential: '', investment_thesis: '',
  occupancy_assumption: '', strategy: '', seasonality: '',
  risks: '', images: '',
  status: 'draft',
};

function rowToDraft(r: PropertyRow): Draft {
  return {
    slug: r.slug,
    name: r.name,
    neighborhood: r.neighborhood,
    price_usd: r.price_usd ?? '',
    bedrooms: r.bedrooms ?? '',
    adr_low: r.adr_low ?? '',
    adr_high: r.adr_high ?? '',
    annual_gross_low: r.annual_gross_low ?? '',
    annual_gross_high: r.annual_gross_high ?? '',
    upgrade_potential: r.upgrade_potential ?? '',
    investment_thesis: r.investment_thesis ?? '',
    occupancy_assumption: r.occupancy_assumption ?? '',
    strategy: r.strategy ?? '',
    seasonality: r.seasonality ?? '',
    risks: (r.risks ?? []).join('\n'),
    images: (r.images ?? []).join('\n'),
    status: r.status === 'published' ? 'published' : 'draft',
  };
}

function draftToPayload(d: Draft) {
  const numOrNull = (n: number | '') => (n === '' ? null : n);
  const linesToArray = (s: string) =>
    s.split('\n').map(x => x.trim()).filter(Boolean);
  return {
    slug: d.slug.trim(),
    name: d.name.trim(),
    neighborhood: d.neighborhood.trim(),
    price_usd: numOrNull(d.price_usd),
    bedrooms: numOrNull(d.bedrooms),
    adr_low: numOrNull(d.adr_low),
    adr_high: numOrNull(d.adr_high),
    annual_gross_low: numOrNull(d.annual_gross_low),
    annual_gross_high: numOrNull(d.annual_gross_high),
    upgrade_potential: d.upgrade_potential.trim() || null,
    investment_thesis: d.investment_thesis.trim() || null,
    occupancy_assumption: d.occupancy_assumption.trim() || null,
    strategy: d.strategy.trim() || null,
    seasonality: d.seasonality.trim() || null,
    risks: linesToArray(d.risks),
    images: linesToArray(d.images),
    status: d.status,
  };
}

export default function PropertyCmsClient({ initialRows }: { initialRows: PropertyRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [editingSlug, setEditingSlug] = useState<string | null>(initialRows[0]?.slug ?? null);
  const [draft, setDraft] = useState<Draft>(initialRows[0] ? rowToDraft(initialRows[0]) : EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const editing = useMemo(() => rows.find(r => r.slug === editingSlug) ?? null, [rows, editingSlug]);

  const select = (slug: string) => {
    setToast(null);
    const row = rows.find(r => r.slug === slug);
    if (!row) return;
    setEditingSlug(slug);
    setDraft(rowToDraft(row));
  };

  const startNew = () => {
    setToast(null);
    setEditingSlug(null);
    setDraft(EMPTY_DRAFT);
  };

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setToast(null);
    if (!draft.slug.trim() || !draft.name.trim() || !draft.neighborhood.trim()) {
      setToast({ tone: 'err', msg: 'Slug, name, and neighborhood are required.' });
      return;
    }
    setBusy(true);
    try {
      const payload = draftToPayload(draft);
      const r = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      setToast({ tone: 'ok', msg: `Saved ${payload.slug}.` });

      // Optimistic local update
      setRows(prev => {
        const next = prev.filter(p => p.slug !== payload.slug);
        const synthetic: PropertyRow = {
          id: editing?.id ?? `tmp-${payload.slug}`,
          created_at: editing?.created_at ?? new Date().toISOString(),
          ...payload,
        };
        return [synthetic, ...next];
      });
      setEditingSlug(payload.slug);
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
      <aside className='card' style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px' }}>
          <span className='muted' style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Properties
          </span>
          <Button variant='ghost' size='sm' onClick={startNew}>+ New</Button>
        </div>
        {rows.length === 0 && (
          <div className='muted' style={{ fontSize: 13, padding: '0 8px' }}>No properties yet — click <em>New</em>.</div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map(r => (
            <li key={r.slug}>
              <button
                onClick={() => select(r.slug)}
                className='btn btn-ghost'
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: editingSlug === r.slug ? 'var(--bg-subtle)' : 'transparent',
                  borderColor: editingSlug === r.slug ? 'var(--border)' : 'transparent',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', minWidth: 0 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {r.name}
                  </span>
                  <span className='muted' style={{ fontSize: 11 }}>{r.slug}</span>
                </span>
                <StatusPill status={r.status} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className='card' style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className='grid gap-3 md:grid-cols-2'>
          <Field label='Slug' hint='URL-safe identifier; can never be changed once published'>
            <TextInput value={draft.slug} onChange={v => setField('slug', v)} placeholder='casa-de-los-olivos' />
          </Field>
          <Field label='Status'>
            <Select<Status>
              value={draft.status}
              onChange={v => setField('status', v)}
              options={[
                { value: 'draft',     label: 'Draft (hidden)' },
                { value: 'published', label: 'Published (visible)' },
              ]}
            />
          </Field>
          <Field label='Name'>
            <TextInput value={draft.name} onChange={v => setField('name', v)} placeholder='Casa de los Olivos' />
          </Field>
          <Field label='Neighborhood'>
            <TextInput value={draft.neighborhood} onChange={v => setField('neighborhood', v)} placeholder='Centro' />
          </Field>
          <Field label='Price (USD)'>
            <NumberInput value={draft.price_usd} onChange={v => setField('price_usd', v)} placeholder='1500000' />
          </Field>
          <Field label='Bedrooms'>
            <NumberInput value={draft.bedrooms} onChange={v => setField('bedrooms', v)} placeholder='5' />
          </Field>
          <Field label='ADR Low (USD/night)'>
            <NumberInput value={draft.adr_low} onChange={v => setField('adr_low', v)} placeholder='800' />
          </Field>
          <Field label='ADR High (USD/night)'>
            <NumberInput value={draft.adr_high} onChange={v => setField('adr_high', v)} placeholder='1300' />
          </Field>
          <Field label='Annual Gross Low (USD)'>
            <NumberInput value={draft.annual_gross_low} onChange={v => setField('annual_gross_low', v)} placeholder='220000' />
          </Field>
          <Field label='Annual Gross High (USD)'>
            <NumberInput value={draft.annual_gross_high} onChange={v => setField('annual_gross_high', v)} placeholder='390000' />
          </Field>
        </div>

        <Field label='Upgrade potential' hint='Short label shown on the property card'>
          <TextInput value={draft.upgrade_potential} onChange={v => setField('upgrade_potential', v)} placeholder='Operational optimization' />
        </Field>
        <Field label='Investment thesis'>
          <TextArea value={draft.investment_thesis} onChange={v => setField('investment_thesis', v)} rows={3} />
        </Field>
        <div className='grid gap-3 md:grid-cols-2'>
          <Field label='Occupancy assumption'>
            <TextInput value={draft.occupancy_assumption} onChange={v => setField('occupancy_assumption', v)} placeholder='~62%' />
          </Field>
          <Field label='Strategy'>
            <TextInput value={draft.strategy} onChange={v => setField('strategy', v)} />
          </Field>
        </div>
        <Field label='Seasonality'>
          <TextArea value={draft.seasonality} onChange={v => setField('seasonality', v)} rows={2} />
        </Field>
        <Field label='Risks' hint='One per line'>
          <TextArea value={draft.risks} onChange={v => setField('risks', v)} rows={3} placeholder={'Permit timeline\nCurrency risk'} />
        </Field>
        <Field label='Images' hint='One URL per line; first image is the hero'>
          <TextArea value={draft.images} onChange={v => setField('images', v)} rows={3} placeholder={'/hero1.jpg\n/casa-olivos-2.jpg'} />
        </Field>

        <div className='flex items-center gap-2'>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update property' : 'Create property'}
          </Button>
          {editing && (
            <span className='muted' style={{ fontSize: 12 }}>
              Created {new Date(editing.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </section>
    </div>
  );
}
