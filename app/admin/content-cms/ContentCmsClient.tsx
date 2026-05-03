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
  {
    key: 'homepage_copy',
    label: 'Homepage prose',
    usedBy: '/ — every headline, lede, CTA label, paragraph copy',
    template: {
      hero_eyebrow: 'San Miguel de Allende · Vol. 04 · Q1 2026',
      hero_headline_pre: "Invest in San Miguel''s most",
      hero_headline_italic: 'desirable luxury rental',
      hero_headline_post: ' market.',
      hero_paragraph: 'Real ADR data. ...',
      hero_cta_primary_label: 'See Featured Opportunities →',
      hero_cta_primary_href: '/properties',
      hero_cta_secondary_label: 'Calculate Your ROI',
      hero_cta_secondary_href: '/roi-calculator',
      hero_card_eyebrow: 'Q1 2026 · Snapshot',
      hero_card_updated: 'Updated 04·28',
      hero_card_stats: [{ l: '', v: '', d: '', up: true }],
      hero_card_footer: '',
      credibility_eyebrow: '02 · Track Record',
      credibility_title_pre: 'The data behind ',
      credibility_title_italic: 'every',
      credibility_title_post: ' investment memo.',
      featured_eyebrow: '03 · Active Opportunities',
      featured_title_pre: 'Underwritten,',
      featured_title_italic: 'turnkey-ready.',
      featured_lede: '',
      featured_footnote: '',
      featured_cta_label: 'All Properties →',
      market_eyebrow: '04 · Market Intelligence',
      market_title_pre: 'Proprietary data,',
      market_title_italic: 'not realtor lore.',
      market_lede: '',
      market_source: '',
      market_cta_label: 'Full Market Dashboard →',
      nbhd_chart_label: 'Fig. 02 · Neighborhoods',
      nbhd_chart_title: 'ADR by district',
      legend_peak: 'PEAK · NOV–MAR',
      legend_shoulder: 'SHOULDER · APR–OCT',
      video_eyebrow: '05 · Video Library',
      video_title_pre: 'Watch the',
      video_title_italic: 'homework.',
      video_lede: '',
      insights_eyebrow: '07 · Latest insights',
      insights_title: 'From the desk.',
      insights_cta_label: 'All insights →',
      lead_eyebrow: '06 · Investor Access',
      lead_title_pre: 'The full underwriting',
      lead_title_italic: 'is gated.',
      lead_paragraph: '',
      lead_benefits: [''],
      lead_form_eyebrow: 'Request Investor Access',
      lead_form_cta_label: 'Open the full form →',
      lead_form_footnote: '',
    },
  },
  {
    key: 'about_copy',
    label: 'About page prose',
    usedBy: '/about — topbar, hero headline, section eyebrows + ledes',
    template: {
      topbar: ['§ About InvestSMA', 'Operators · not brokers', 'Est. via Luxury Rental Mgmt'],
      hero_eyebrow: 'About · 01',
      hero_headline_pre: "We don't help you\nbuy property.\n",
      hero_headline_italic: 'We help you build a performing asset.',
      hero_paragraph: '',
      positioning_eyebrow: '02 · Positioning',
      positioning_title_pre: 'What we ',
      positioning_title_italic: 'are',
      positioning_title_post: " and aren't.",
      are_not_label: 'WE ARE NOT',
      are_label: 'WE ARE',
      stack_eyebrow: '03 · Operations stack',
      stack_title_pre: 'Four phases.',
      stack_title_italic: 'One operator.',
      stack_lede: '',
      closing_eyebrow: '04 · Next step',
      closing_title_pre: 'The portfolio is small\n',
      closing_title_italic: 'by design.',
      closing_paragraph: '',
      closing_cta_apply_label: 'Apply for access →',
      closing_cta_read_label: 'Read our notes',
    },
  },
  {
    key: 'contact_copy',
    label: 'Contact page prose',
    usedBy: '/contact — hero, 3 step labels, submit copy, trust signals, success page',
    template: {
      hero_eyebrow: 'Investor Access · Application',
      hero_headline_pre: 'Apply for',
      hero_headline_italic: 'investor access.',
      hero_paragraph: '',
      hero_stats: [{ v: '', l: '' }],
      step_1_eyebrow: 'Step 01 of 03',
      step_1_title: 'Tell us who you are.',
      step_1_label_name: 'Full name',
      step_1_label_email: 'Email',
      step_1_label_phone: 'Phone',
      step_2_eyebrow: 'Step 02 of 03',
      step_2_title: 'Investment profile.',
      step_2_label_budget: 'Budget range',
      step_2_label_timeline: 'Buying timeline',
      step_3_eyebrow: 'Step 03 of 03',
      step_3_title: 'What are you looking for?',
      step_3_label_interests: 'Interests · select all',
      step_3_label_message: 'Anything else? (optional)',
      step_3_message_placeholder: '',
      submit_label: 'Request Investor Access →',
      submit_footnote: '',
      trust_signals: [{ t: '', d: '' }],
      submitted_title: 'Application received.',
      submitted_paragraph: '',
      submitted_cta_browse_label: 'Browse Properties',
      submitted_cta_market_label: 'See Market Data',
    },
  },
  {
    key: 'insights_copy',
    label: 'Insights page prose',
    usedBy: '/insights — hero, subscribe form, gated download CTA',
    template: {
      hero_eyebrow: 'Field Notes',
      hero_headline_pre: 'Insights',
      hero_headline_italic: 'from the field.',
      hero_paragraph: '',
      subscribe_placeholder: 'your@email.com',
      subscribe_label: 'Subscribe →',
      featured_label: 'Featured this week',
      empty_state: '',
      gated_eyebrow: 'Gated · Free',
      gated_title_pre: 'The 52-page Q1',
      gated_title_italic: 'SMA Market Report.',
      gated_paragraph: '',
      gated_cta_label: 'Download Free →',
    },
  },
  {
    key: 'memo_copy',
    label: 'Property memo prose',
    usedBy: '/properties/[slug] — section titles, subtitles, CTA copy, gated/shown lists',
    template: {
      topbar_back_label: '← All Properties',
      topbar_center_label: 'Underwriting Package · By Request',
      deal_terms_eyebrow: 'Deal terms',
      deal_cta_label: 'Request full underwriting →',
      deal_cta_footnote: '',
      thesis_title: 'Investment thesis',
      thesis_subtitle: '',
      revenue_title: 'Revenue assumptions',
      revenue_subtitle: '',
      seasonal_title: 'Seasonal revenue opportunity',
      seasonal_subtitle: '',
      seasonal_cols: ['Window', 'Dates', 'Peak ADR', 'Occupancy', 'Notes'],
      upgrades_title: 'Recommended upgrades',
      upgrades_summary_label: 'Upgrade summary',
      upgrades_summary_caption: 'Total recommended capex',
      upgrades_lift_label: 'ADR uplift (Y2)',
      upgrades_lift_value: '+$88 / night',
      upgrades_payback_label: 'Blended payback',
      upgrades_payback_value: '1.8 years',
      management_title: 'LRM management strategy',
      management_subtitle: '',
      risks_title: 'Risks & considerations',
      risks_subtitle: '',
      comps_title: 'Comparable transactions',
      comps_subtitle: '',
      comps_gated_label: 'Gated · 2 of 5 trades',
      comps_gated_caption: '',
      comps_unlock_label: 'Unlock comp set →',
      cta_topbar_label: '§ Request the full underwriting package',
      cta_topbar_response: 'Avg response · 36 hrs',
      cta_headline_pre: "You've seen the\nsummary.\n",
      cta_headline_italic: 'Now see the model.',
      cta_paragraph: '',
      cta_steps: [{ n: '', t: '', d: '' }],
      cta_compare_label: 'Compare other listings',
      cta_footnote: '',
      cta_shown_label: 'Public preview',
      cta_gated_label: 'Gated',
      cta_shown: [''],
      cta_gated: [''],
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
