'use client';

import { useMemo, useState } from 'react';
import { Button, Field, Select, StatusPill, TextArea, TextInput, Toast } from '../_components/forms';

type Row = { key: string; value: unknown; status: string; updated_at: string };
type Status = 'published' | 'draft';

// Well-known keys; quick-fill templates so admins don't have to remember
// the JSON shape. `usedBy` shows where each key surfaces on the public
// site so editors know what they're changing. Anything not listed is
// editable via the catch-all.
const KNOWN_KEYS: Array<{ key: string; label: string; usedBy: string; template: unknown }> = [
  {
    key: 'homepage_hero',
    label: 'Homepage hero',
    usedBy: '/ — hero copy',
    template: { headline: '', subheadline: '' },
  },
  {
    key: 'homepage_metrics',
    label: 'Homepage metrics',
    usedBy: '/ — credibility strip',
    template: { items: [{ label: '', value: '' }] },
  },
  {
    key: 'homepage_market_snapshot',
    label: 'Homepage market snapshot',
    usedBy: '/ — compare-view block',
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
    usedBy: '/ — gated report CTA',
    template: {
      title: 'Gated Market Report',
      body: '',
      ctaLabel: 'Request access',
      ctaHref: '/contact',
    },
  },
  {
    key: 'homepage_hero_image',
    label: 'Homepage hero image',
    usedBy: '/ — fullscreen Ken Burns background',
    template: { url: 'https://images.unsplash.com/...' },
  },
  {
    key: 'homepage_credibility',
    label: 'Homepage credibility stats',
    usedBy: '/ — Track Record section (4 stats)',
    template: {
      items: [
        { num: '312',   label: 'Properties\ntracked' },
        { num: '$2.4B', label: 'AUM in San\nMiguel market' },
        { num: '11',    label: 'Years operating\nLRM portfolio' },
        { num: '94%',   label: 'Investor 2nd-\ntransaction rate' },
      ],
    },
  },
  {
    key: 'homepage_videos',
    label: 'Homepage video tiles',
    usedBy: '/ — Video Library section (3 tiles)',
    template: {
      items: [
        { id: 'v1', title: '', dur: '0:00', img: '', cat: '' },
      ],
    },
  },
  {
    key: 'homepage_occupancy_chart',
    label: 'Homepage occupancy chart',
    usedBy: '/ — Market Intelligence chart',
    template: {
      fig_label: 'Fig. 01 · Seasonal Occupancy',
      title: '2025 average — 4-bedroom SMA',
      annual_avg: '62.4%',
      months: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      data: [78, 82, 76, 64, 52, 48, 54, 56, 58, 68, 81, 86],
    },
  },
  {
    key: 'homepage_nbhd_comparison',
    label: 'Homepage neighborhood comparison',
    usedBy: '/ — ADR-by-district bars',
    template: {
      items: [{ name: '', adr: 0, yield: 0 }],
    },
  },
  {
    key: 'ticker_items',
    label: 'Site ticker (marquee)',
    usedBy: 'All pages — top Bloomberg-style ticker',
    template: {
      items: [
        { label: 'SMA·OCC', val: '62.4%', delta: '+3.1%', up: true },
      ],
    },
  },
  {
    key: 'nav_pages',
    label: 'Site nav links',
    usedBy: 'All pages — top navigation',
    template: {
      items: [
        { id: 'home', label: 'Home', href: '/' },
      ],
    },
  },
  {
    key: 'footer_config',
    label: 'Site footer',
    usedBy: 'All pages — footer columns + copyright',
    template: {
      tagline: '',
      chips: ['Operator-led', 'Real Data'],
      explore: [{ label: '', href: '' }],
      resources: [{ label: '', href: '' }],
      contact: [{ label: '', href: '' }],
      copyright: '',
      tagline_short: '',
    },
  },
  {
    key: 'about_page',
    label: 'About page editorial',
    usedBy: '/about — stats, positioning, ops stack',
    template: {
      stats: [{ v: '', l: '' }],
      are_not: [{ t: '', d: '' }],
      are: [{ t: '', d: '' }],
      stack: [{ phase: '', items: [''] }],
    },
  },
  {
    key: 'contact_form_options',
    label: 'Contact form options',
    usedBy: '/contact — interest / budget / timeline buttons',
    template: {
      interests: [''],
      budgets: ['$500K–$1M', '$1M–$2M', '$2M–$5M', '$5M+'],
      timelines: ['0–3 mo', '3–6 mo', '6–12 mo', '12+ mo', 'Researching'],
    },
  },
  {
    key: 'insights_categories',
    label: 'Insights categories',
    usedBy: '/insights — category filter chips (future)',
    template: {
      items: [{ id: 'all', label: 'All Insights', matches: null }],
    },
  },
  {
    key: 'memo_editorial',
    label: 'Property memo editorial defaults',
    usedBy: '/properties/[slug] — thesis, upgrades, mgmt, risks, seasonal events',
    template: {
      monthly_labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      seasonality: [88, 84, 76, 64, 48, 42, 56, 58, 54, 64, 78, 92],
      adr_factor: [1.2, 1.15, 1.05, 0.92, 0.78, 0.72, 0.85, 0.85, 0.82, 0.95, 1.18, 1.35],
      thesis: [{ t: '', d: '' }],
      upgrades: [{ item: '', cost: 0, lift: '', payback: '' }],
      management: [{ phase: '', items: [''] }],
      management_stats: [{ v: '', l: '' }],
      risks: [{ t: '', d: '' }],
      seasonal_events: [{ period: '', date: '', adr: '', occ: '', notes: '' }],
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

  const selectKey = (k: string) => {
    setSelectedKey(k);
    setToast(null);
    const row = rows.find(r => r.key === k);
    if (row) {
      setDraftKey(row.key);
      setDraftJson(JSON.stringify(row.value, null, 2));
      setDraftStatus(row.status === 'draft' ? 'draft' : 'published');
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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
      {/* Sidebar list */}
      <aside className='card' style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 8px 8px' }}>
          <span className='muted' style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Existing keys
          </span>
          <span className='muted' style={{ fontSize: 11 }}>{rows.length}</span>
        </div>
        {rows.length === 0 ? (
          <div className='muted' style={{ fontSize: 13, padding: '8px 8px 12px' }}>
            No rows yet — start with a template below.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rows.map(r => (
              <li key={r.key}>
                <button
                  onClick={() => selectKey(r.key)}
                  className='btn btn-ghost'
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    background: selectedKey === r.key ? 'var(--bg-subtle)' : 'transparent',
                    borderColor: selectedKey === r.key ? 'var(--border)' : 'transparent',
                    fontWeight: selectedKey === r.key ? 600 : 500,
                    padding: '6px 10px',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.key}
                  </span>
                  <StatusPill status={r.status} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
          <div className='muted' style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Templates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {KNOWN_KEYS.map(t => {
              const exists = rows.some(r => r.key === t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => startNew(t)}
                  className='btn btn-ghost btn-sm'
                  style={{ justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '6px 10px' }}
                  title={t.usedBy}
                >
                  <span style={{ fontWeight: 500 }}>{exists ? '↻' : '+'} {t.label}</span>
                  <span className='muted' style={{ fontSize: 10, fontWeight: 400 }}>{t.usedBy}</span>
                </button>
              );
            })}
            <button
              onClick={() => startNew()}
              className='btn btn-ghost btn-sm'
              style={{ justifyContent: 'flex-start' }}
            >
              + Custom key
            </button>
          </div>
        </div>
      </aside>

      {/* Editor */}
      <section className='card' style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className='grid-2'>
          <Field label='Key' hint='snake_case identifier'>
            <TextInput value={draftKey} onChange={setDraftKey} placeholder='homepage_hero' />
          </Field>
          <Field label='Status'>
            <Select<Status>
              value={draftStatus}
              onChange={setDraftStatus}
              options={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </Field>
        </div>

        <Field label='Value (JSON)' hint='Free-form; structure varies per key'>
          <TextArea value={draftJson} onChange={setDraftJson} rows={20} mono />
        </Field>

        <div className='row'>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : selected ? 'Update' : 'Create'}
          </Button>
          {selected && (
            <span className='muted' style={{ fontSize: 12 }}>
              Last updated {new Date(selected.updated_at).toLocaleString()}
            </span>
          )}
        </div>

        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </section>
    </div>
  );
}
