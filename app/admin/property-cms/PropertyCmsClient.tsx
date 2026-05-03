'use client';

import { useMemo, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/properties.jsx — table + 7-tab property
// editor. Persists the fields the `properties` table already has
// (slug, name, neighborhood, price_usd, bedrooms, adr_low/high,
// annual_gross_low/high, upgrade_potential, investment_thesis,
// occupancy_assumption, strategy, seasonality, risks[], images[],
// status). The design also includes UI for a handful of fields that
// don't yet exist in the schema (sqm, bathrooms, headline, position
// in market, per-line operating costs, separate SEO title/description,
// publish toggles); those render as UI placeholders so the design is
// complete, with TODO_SCHEMA comments where a migration is required.

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

type Status = 'draft' | 'review' | 'published' | 'archived';

const NEIGHBORHOODS = ['Centro', 'Atascadero', 'San Antonio', 'Guadiana', 'Los Frailes', 'Other'];

const STATUS_OPTIONS: Array<[Status, string, string]> = [
  ['draft',     'Draft',         'Only visible to admins'],
  ['review',    'Needs review',  'Flagged for editor approval'],
  ['published', 'Published',     'Live on the public site'],
  ['archived',  'Archived',      'Removed from public, kept for records'],
];

const STATUS_BADGE: Record<string, 'success' | 'warn' | 'info' | 'outline'> = {
  draft: 'warn',
  review: 'info',
  published: 'success',
  archived: 'outline',
};

function StatusBadge({ status }: { status: string }) {
  const kind = STATUS_BADGE[status] ?? 'outline';
  const label = STATUS_OPTIONS.find(s => s[0] === status)?.[1] ?? status;
  return <span className={`badge badge-${kind}`}>{label}</span>;
}

function FilterPill<V extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: V;
  options: ReadonlyArray<[V, string]>;
  onChange: (v: V) => void;
}) {
  const active = value !== 'all';
  return (
    <div style={{ position: 'relative' }}>
      <select
        className={`filter-pill ${active ? 'active' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value as V)}
        style={{ appearance: 'none', paddingRight: 24, cursor: 'pointer' }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{label}: {l}</option>)}
      </select>
      <Icon
        name='chevronDown'
        style={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          pointerEvents: 'none',
          color: 'var(--fg-subtle)',
        }}
      />
    </div>
  );
}

function fmtMoney(n: number | null): string {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function fmtRange(low: number | null, high: number | null, fmt: (n: number) => string): string {
  if (low === null && high === null) return '—';
  return `${low !== null ? fmt(low) : '—'}–${high !== null ? fmt(high) : '—'}`;
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

// ---------------------------------------------------------------------------
// Editor draft state
// ---------------------------------------------------------------------------

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
  risks: string[];
  images: string[];
  status: Status;
};

const EMPTY_DRAFT: Draft = {
  slug: '', name: '', neighborhood: 'Centro',
  price_usd: '', bedrooms: '',
  adr_low: '', adr_high: '',
  annual_gross_low: '', annual_gross_high: '',
  upgrade_potential: '', investment_thesis: '',
  occupancy_assumption: '', strategy: '', seasonality: '',
  risks: [], images: [],
  status: 'draft',
};

function rowToDraft(r: PropertyRow): Draft {
  const status: Status = (['draft', 'review', 'published', 'archived'] as Status[]).includes(r.status as Status)
    ? (r.status as Status) : 'draft';
  return {
    slug: r.slug,
    name: r.name,
    neighborhood: r.neighborhood || 'Centro',
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
    risks: r.risks ?? [],
    images: r.images ?? [],
    status,
  };
}

function draftToPayload(d: Draft) {
  const numOrNull = (n: number | '') => (n === '' ? null : n);
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
    risks: d.risks.map(r => r.trim()).filter(Boolean),
    images: d.images.map(i => i.trim()).filter(Boolean),
    status: d.status,
  };
}

// ---------------------------------------------------------------------------
// Top-level component
// ---------------------------------------------------------------------------

type View = { kind: 'table' } | { kind: 'edit'; slug: string | null }; // null = new

export default function PropertyCmsClient({ initialRows }: { initialRows: PropertyRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [view, setView] = useState<View>({ kind: 'table' });

  if (view.kind === 'edit') {
    const editing = view.slug ? rows.find(r => r.slug === view.slug) ?? null : null;
    return (
      <PropertyEditPage
        editing={editing}
        onClose={() => setView({ kind: 'table' })}
        onSaved={(saved) => {
          setRows(prev => {
            const next = prev.filter(p => p.slug !== saved.slug);
            return [saved, ...next];
          });
          setView({ kind: 'edit', slug: saved.slug });
        }}
        onDeleted={(slug) => {
          setRows(prev => prev.filter(p => p.slug !== slug));
          setView({ kind: 'table' });
        }}
      />
    );
  }

  return (
    <PropertyTablePage
      rows={rows}
      onNew={() => setView({ kind: 'edit', slug: null })}
      onEdit={(slug) => setView({ kind: 'edit', slug })}
    />
  );
}

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------

function PropertyTablePage({
  rows, onNew, onEdit,
}: {
  rows: PropertyRow[];
  onNew: () => void;
  onEdit: (slug: string) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [filterHood, setFilterHood] = useState<'all' | string>('all');
  const [confirmDelete, setConfirmDelete] = useState<PropertyRow | null>(null);

  const filtered = useMemo(() => rows.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterHood !== 'all' && p.neighborhood !== filterHood) return false;
    return true;
  }), [rows, filterStatus, filterHood]);

  return (
    <div className='main'>
      <Topbar crumbs={['Properties']}>
        <button className='btn btn-sm'><Icon name='download' /> Export</button>
        <button className='btn btn-sm btn-primary' onClick={onNew}>
          <Icon name='plus' /> New property
        </button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Properties</h1>
            <p className='page-subtitle'>
              {filtered.length} of {rows.length} listings · Investment memos managed here are published to the public site
            </p>
          </div>
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <FilterPill<'all' | Status>
                label='Status'
                value={filterStatus}
                options={[
                  ['all', 'All'], ['draft', 'Draft'], ['review', 'Needs review'],
                  ['published', 'Published'], ['archived', 'Archived'],
                ]}
                onChange={setFilterStatus}
              />
              <FilterPill<'all' | string>
                label='Neighborhood'
                value={filterHood}
                options={[['all', 'All'], ...NEIGHBORHOODS.map(h => [h, h] as ['all' | string, string])]}
                onChange={setFilterHood}
              />
            </div>
            <div className='right'>
              <button className='btn btn-sm btn-ghost' title='Grid view'><Icon name='grid' /></button>
              <button className='btn btn-sm btn-ghost' title='List view'><Icon name='list' /></button>
            </div>
          </div>

          <div className='table-scroll'>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Neighborhood</th>
                  <th className='num'>Beds</th>
                  <th className='num'>Asking price</th>
                  <th className='num'>ADR range</th>
                  <th className='num'>Gross revenue</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <button
                        className='row-link'
                        onClick={() => onEdit(p.slug)}
                        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
                      >
                        {p.name}
                      </button>
                      <div className='row-sub mono'>{p.slug}</div>
                    </td>
                    <td>{p.neighborhood}</td>
                    <td className='num mono'>{p.bedrooms ?? '—'}</td>
                    <td className='num mono'>{fmtMoney(p.price_usd)}</td>
                    <td className='num mono'>{fmtRange(p.adr_low, p.adr_high, n => `$${n}`)}</td>
                    <td className='num mono'>{fmtRange(p.annual_gross_low, p.annual_gross_high, n => fmtMoney(n))}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className='mono' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{fmtDate(p.created_at)}</td>
                    <td>
                      <div className='row gap-4'>
                        <button className='btn btn-icon btn-ghost btn-sm' title='Edit' onClick={() => onEdit(p.slug)}><Icon name='edit' /></button>
                        <button className='btn btn-icon btn-ghost btn-sm' title='Delete' onClick={() => setConfirmDelete(p)}><Icon name='trash' /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className='empty'>
                <div className='empty-icon'><Icon name='home' /></div>
                <h3>No properties match</h3>
                <p>Try changing the filters or add a new property.</p>
                <button className='btn btn-sm btn-primary' onClick={onNew}>New property</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteModal
          row={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          // Delete-from-table is a soft no-op for now (the existing
          // /api/admin/properties route doesn't expose DELETE); the
          // editor page handles real archival via the Publish tab.
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({ row, onClose }: { row: PropertyRow; onClose: () => void }) {
  return (
    <div className='overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <div className='modal-head'>
          <h3 className='modal-title'>Delete {row.name}?</h3>
          <p className='modal-desc'>
            This will remove the property from the public site immediately. Memo, media, and SEO settings will be archived for 30 days.
          </p>
        </div>
        <div className='modal-body'>
          <div style={{ background: 'var(--status-danger-bg)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 6, padding: 12, fontSize: 13 }}>
            <strong>{row.slug}</strong> · {row.neighborhood} · {fmtMoney(row.price_usd)}
          </div>
          <p className='muted' style={{ fontSize: 12, marginTop: 12 }}>
            Direct deletion is not yet wired — set the status to <strong>Archived</strong> from the Publish tab to remove from public.
          </p>
        </div>
        <div className='modal-foot'>
          <button className='btn' onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit view (7 tabs)
// ---------------------------------------------------------------------------

type Tab = 'overview' | 'financial' | 'media' | 'memo' | 'risks' | 'seo' | 'publish';

const TABS: Array<[Tab, string]> = [
  ['overview',  'Overview'],
  ['financial', 'Financial assumptions'],
  ['media',     'Media'],
  ['memo',      'Investment memo'],
  ['risks',     'Risks & disclaimers'],
  ['seo',       'SEO'],
  ['publish',   'Publish settings'],
];

function PropertyEditPage({
  editing, onClose, onSaved, onDeleted,
}: {
  editing: PropertyRow | null;
  onClose: () => void;
  onSaved: (row: PropertyRow) => void;
  onDeleted: (slug: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [draft, setDraft] = useState<Draft>(editing ? rowToDraft(editing) : EMPTY_DRAFT);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string; adr?: string; rev?: string }>({});
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft(d => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!draft.name.trim()) e.name = 'Property name is required';
    if (!draft.slug.trim()) e.slug = 'Slug is required';
    if (typeof draft.adr_low === 'number' && typeof draft.adr_high === 'number' && draft.adr_low > draft.adr_high) {
      e.adr = 'ADR low cannot exceed ADR high';
    }
    if (typeof draft.annual_gross_low === 'number' && typeof draft.annual_gross_high === 'number' && draft.annual_gross_low > draft.annual_gross_high) {
      e.rev = 'Gross revenue low cannot exceed high';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    setToast(null);
    if (!validate()) {
      setToast({ tone: 'err', msg: 'Fix the highlighted errors and try again.' });
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
      const saved: PropertyRow = {
        id: editing?.id ?? `tmp-${payload.slug}`,
        created_at: editing?.created_at ?? new Date().toISOString(),
        ...payload,
      };
      onSaved(saved);
      setDirty(false);
      setToast({ tone: 'ok', msg: `Saved ${payload.name}.` });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setDraft(editing ? rowToDraft(editing) : EMPTY_DRAFT);
    setDirty(false);
    setErrors({});
    setToast(null);
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Properties', editing ? editing.name : 'New property']}>
        <button className='btn btn-sm btn-ghost' onClick={onClose}><Icon name='close' /> Close</button>
        <button className='btn btn-sm'><Icon name='eye' /> Preview</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <div className='row gap-8' style={{ marginBottom: 4 }}>
              <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{editing?.slug ?? draft.slug ?? 'NEW'}</span>
              <StatusBadge status={draft.status} />
            </div>
            <h1 className='page-title'>{draft.name || 'New property'}</h1>
            <p className='page-subtitle'>Edits to this property will be saved as a draft until you publish.</p>
          </div>
          <div className='page-actions'>
            <button className='btn'><Icon name='copy' /> Duplicate</button>
            <button
              className='btn btn-danger'
              onClick={() => editing && onDeleted(editing.slug)}
              disabled={!editing}
              title={editing ? 'Delete property' : 'Save before deleting'}
            >
              <Icon name='trash' /> Delete
            </button>
          </div>
        </div>

        <div className='tabs'>
          {TABS.map(([k, l]) => (
            <div
              key={k}
              className={`tab ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              {l}
            </div>
          ))}
        </div>

        {tab === 'overview'  && <OverviewTab draft={draft} update={update} errors={errors} />}
        {tab === 'financial' && <FinancialTab draft={draft} update={update} errors={errors} />}
        {tab === 'media'     && <MediaTab draft={draft} update={update} />}
        {tab === 'memo'      && <MemoTab draft={draft} update={update} />}
        {tab === 'risks'     && <RisksTab draft={draft} update={update} />}
        {tab === 'seo'       && <SeoTab draft={draft} />}
        {tab === 'publish'   && <PublishTab draft={draft} update={update} />}

        {toast && (
          <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
            {toast.msg}
          </div>
        )}
      </div>

      <SaveBar
        dirty={dirty}
        busy={busy}
        onSave={save}
        onDiscard={discard}
        savedLabel={editing ? `Saved ${fmtDate(editing.created_at)}` : 'Not saved yet'}
      />
    </div>
  );
}

function SaveBar({
  dirty, busy, onSave, onDiscard, savedLabel,
}: {
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
  onDiscard: () => void;
  savedLabel: string;
}) {
  return (
    <div className='save-bar'>
      <div className={`status ${dirty ? '' : 'saved'}`}>
        <span className='dot' />
        <span>{dirty ? 'Unsaved changes' : savedLabel}</span>
      </div>
      <div className='actions'>
        <button className='btn btn-sm' onClick={onDiscard} disabled={!dirty || busy}>Discard</button>
        <button className='btn btn-sm btn-primary' onClick={onSave} disabled={!dirty || busy}>
          <Icon name='save' /> {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type TabProps = { draft: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void; errors?: Record<string, string | undefined> };

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className='input-error'>
      <Icon name='warning' style={{ width: 12, height: 12 }} /> {msg}
    </div>
  );
}

function OverviewTab({ draft, update, errors }: TabProps) {
  return (
    <div className='grid-2'>
      <div className='card'>
        <div className='card-head'><h3 className='card-title'>Basic information</h3></div>
        <div className='card-body col gap-16'>
          <div className='field'>
            <label className='label'>Property name <span className='req'>*</span></label>
            <input
              className={`input ${errors?.name ? 'error' : ''}`}
              value={draft.name}
              onChange={e => update('name', e.target.value)}
              placeholder='Casa de los Olivos'
            />
            <FieldError msg={errors?.name} />
          </div>

          <div className='field'>
            <label className='label'>Slug <span className='req'>*</span><span className='help'>URL-safe; do not change after publish</span></label>
            <input
              className={`input ${errors?.slug ? 'error' : ''}`}
              value={draft.slug}
              onChange={e => update('slug', e.target.value)}
              placeholder='casa-de-los-olivos'
            />
            <FieldError msg={errors?.slug} />
          </div>

          <div className='grid-2' style={{ gap: 12 }}>
            <div className='field'>
              <label className='label'>Neighborhood <span className='req'>*</span></label>
              <select className='select' value={draft.neighborhood} onChange={e => update('neighborhood', e.target.value)}>
                {NEIGHBORHOODS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className='field'>
              <label className='label'>Bedrooms <span className='req'>*</span></label>
              <input
                type='number'
                className='input'
                value={draft.bedrooms}
                onChange={e => update('bedrooms', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          <div className='field'>
            <label className='label'>Asking price <span className='req'>*</span><span className='help'>USD</span></label>
            <div className='input-group'>
              <div className='addon'>$</div>
              <input
                type='number'
                className='input'
                value={draft.price_usd}
                onChange={e => update('price_usd', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder='3850000'
              />
            </div>
          </div>

          {/* TODO_SCHEMA: properties.sqm + bathrooms columns. */}
          <div className='grid-2' style={{ gap: 12 }}>
            <div className='field'>
              <label className='label'>Sq meters <span className='help'>not yet stored</span></label>
              <input type='number' className='input' placeholder='650' />
            </div>
            <div className='field'>
              <label className='label'>Bathrooms <span className='help'>not yet stored</span></label>
              <input type='number' className='input' placeholder='6.5' step='0.5' />
            </div>
          </div>
        </div>
      </div>

      <div className='card'>
        <div className='card-head'>
          <h3 className='card-title'>Investment summary</h3>
          <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }} className='mono'>Public-facing</span>
        </div>
        <div className='card-body col gap-16'>
          {/* TODO_SCHEMA: properties.headline column. */}
          <div className='field'>
            <label className='label'>Headline <span className='help'>not yet stored</span></label>
            <input className='input' placeholder='Editorial-grade Centro estate with 6 suites and rooftop terrace' />
            <div className='input-help'>Shown on the property card and at the top of the memo. Max 90 characters.</div>
          </div>

          <div className='field'>
            <label className='label'>Investment thesis</label>
            <textarea
              className='textarea'
              rows={5}
              value={draft.investment_thesis}
              onChange={e => update('investment_thesis', e.target.value)}
              placeholder='Why this property, in 2–3 sentences. Avoid hype. Reference comparable LRM data or AirDNA where possible.'
            />
          </div>

          <div className='field'>
            <label className='label'>Upgrade potential</label>
            <select
              className='select'
              value={draft.upgrade_potential}
              onChange={e => update('upgrade_potential', e.target.value)}
            >
              <option value=''>—</option>
              <option>None — turnkey</option>
              <option>Light refresh</option>
              <option>Moderate renovation</option>
              <option>Full repositioning</option>
            </select>
          </div>

          {/* TODO_SCHEMA: properties.position_in_market column. */}
          <div className='field'>
            <label className='label'>Position in market <span className='help'>not yet stored</span></label>
            <div className='row gap-6' style={{ flexWrap: 'wrap' }}>
              {['Entry', 'Premium', 'Editorial', 'Trophy'].map((p, i) => (
                <label key={p} className='row gap-6' style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type='radio' name='pos' defaultChecked={i === 1} /> {p}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialTab({ draft, update, errors }: TabProps) {
  return (
    <div className='col gap-16'>
      <div className='card'>
        <div className='card-head'>
          <div>
            <h3 className='card-title'>Revenue assumptions</h3>
            <p className='card-subtitle'>
              Used to populate the public investment memo. All figures should be defensible against LRM internal data or AirDNA benchmarks.
            </p>
          </div>
          <span className='badge badge-info'>Auto-syncs to memo</span>
        </div>
        <div className='card-body'>
          <FieldError msg={errors?.adr} />
          <FieldError msg={errors?.rev} />
          <div className='grid-2' style={{ gap: 16 }}>
            <NumField label='ADR — low' help='USD/night' value={draft.adr_low} addon='$' onChange={v => update('adr_low', v)} error={!!errors?.adr} />
            <NumField label='ADR — high' help='USD/night' value={draft.adr_high} addon='$' onChange={v => update('adr_high', v)} error={!!errors?.adr} />
            {/* TODO_SCHEMA: separate occupancy_low/high columns; for now the
                free-text occupancy_assumption captures both. */}
            <div className='field'>
              <label className='label'>Occupancy assumption</label>
              <input
                className='input'
                value={draft.occupancy_assumption}
                onChange={e => update('occupancy_assumption', e.target.value)}
                placeholder='~62%'
              />
            </div>
            <div />
            <NumField label='Gross revenue — low'  value={draft.annual_gross_low}  addon='$' onChange={v => update('annual_gross_low', v)}  error={!!errors?.rev} />
            <NumField label='Gross revenue — high' value={draft.annual_gross_high} addon='$' onChange={v => update('annual_gross_high', v)} error={!!errors?.rev} />
          </div>
          <div className='divider' />
          <div className='field'>
            <label className='label'>Methodology note</label>
            <textarea
              className='textarea'
              rows={3}
              value={draft.strategy}
              onChange={e => update('strategy', e.target.value)}
              placeholder='e.g. ADR derived from comparable 6BR Centro homes managed by LRM in 2025; occupancy reflects post-upgrade target with editorial positioning.'
            />
            <div className='input-help'>Internal-only. Auditable trail for how figures were derived. Stored in the <code>strategy</code> column.</div>
          </div>
        </div>
      </div>

      {/* TODO_SCHEMA: per-line operating cost columns. UI is rendered for
          design fidelity; values are not yet persisted. */}
      <div className='card'>
        <div className='card-head'>
          <h3 className='card-title'>Operating assumptions</h3>
          <span className='card-subtitle'>not yet stored</span>
        </div>
        <div className='card-body grid-3' style={{ gap: 16 }}>
          <PlaceholderField label='LRM management fee' addon='%' defaultValue='20' />
          <PlaceholderField label='Cleaning per stay'  addon='$' defaultValue='280' addonLeft />
          <PlaceholderField label='Property tax'        addon='$' defaultValue='2400' addonLeft />
          <PlaceholderField label='Utilities/yr'        addon='$' defaultValue='14000' addonLeft />
          <PlaceholderField label='Insurance/yr'        addon='$' defaultValue='6800' addonLeft />
          <PlaceholderField label='Maintenance reserve' addon='%' defaultValue='3' />
        </div>
      </div>
    </div>
  );
}

function NumField({
  label, help, value, addon, onChange, error,
}: {
  label: string;
  help?: string;
  value: number | '';
  addon: string;
  onChange: (v: number | '') => void;
  error?: boolean;
}) {
  return (
    <div className='field'>
      <label className='label'>{label}{help && <span className='help'>{help}</span>}</label>
      <div className='input-group'>
        <div className='addon'>{addon}</div>
        <input
          type='number'
          className={`input ${error ? 'error' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function PlaceholderField({
  label, addon, defaultValue, addonLeft = false,
}: {
  label: string;
  addon: string;
  defaultValue: string;
  addonLeft?: boolean;
}) {
  return (
    <div className='field'>
      <label className='label'>{label}</label>
      <div className='input-group'>
        {addonLeft && <div className='addon'>{addon}</div>}
        <input type='number' className='input' defaultValue={defaultValue} />
        {!addonLeft && <div className='addon'>{addon}</div>}
      </div>
    </div>
  );
}

function MediaTab({ draft, update }: TabProps) {
  const [newUrl, setNewUrl] = useState('');

  const addUrl = () => {
    const v = newUrl.trim();
    if (!v) return;
    update('images', [...draft.images, v]);
    setNewUrl('');
  };
  const remove = (idx: number) => update('images', draft.images.filter((_, i) => i !== idx));
  const setHero = (idx: number) => {
    if (idx === 0) return;
    const next = [...draft.images];
    const [hero] = next.splice(idx, 1);
    next.unshift(hero);
    update('images', next);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.images.length) return;
    const next = [...draft.images];
    [next[idx], next[target]] = [next[target], next[idx]];
    update('images', next);
  };

  return (
    <div className='col gap-16'>
      <div className='card'>
        <div className='card-head'>
          <div>
            <h3 className='card-title'>Property gallery · {draft.images.length} image{draft.images.length !== 1 ? 's' : ''}</h3>
            <p className='card-subtitle'>First image is the hero · use ↑/↓ to reorder · paste an image URL below</p>
          </div>
        </div>
        <div className='card-body col gap-12'>
          <div className='input-group'>
            <input
              className='input'
              placeholder='https://example.com/photo.jpg'
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            />
            <button type='button' className='btn' onClick={addUrl}><Icon name='plus' /> Add</button>
          </div>

          {draft.images.length === 0 ? (
            <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: '32px 24px', textAlign: 'center', color: 'var(--fg-muted)' }}>
              <Icon name='upload' style={{ width: 32, height: 32, opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>No photos yet</div>
              <div className='muted' style={{ fontSize: 13, marginTop: 4 }}>Paste a URL above or upload to the Media Library and reference here.</div>
            </div>
          ) : (
            <div className='grid-4' style={{ gap: 14 }}>
              {draft.images.map((src, idx) => (
                <div key={src + idx} style={{ border: '1px solid ' + (idx === 0 ? 'var(--accent, #18181B)' : 'var(--border)'), borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg-subtle)', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {idx === 0 && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--fg)', color: 'var(--surface)', fontSize: 10, padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--f-mono)', letterSpacing: '0.05em' }}>HERO</span>
                    )}
                    <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(20,19,15,0.85)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--f-mono)' }}>#{idx + 1}</span>
                  </div>
                  <div style={{ padding: 8, display: 'flex', gap: 4 }}>
                    {idx !== 0 && (
                      <button className='btn btn-sm btn-ghost' onClick={() => setHero(idx)} title='Set as hero'>★</button>
                    )}
                    <button className='btn btn-sm btn-ghost' onClick={() => move(idx, -1)} disabled={idx === 0} title='Move up'>↑</button>
                    <button className='btn btn-sm btn-ghost' onClick={() => move(idx, 1)} disabled={idx === draft.images.length - 1} title='Move down'>↓</button>
                    <button className='btn btn-sm btn-ghost' onClick={() => remove(idx)} title='Remove'><Icon name='trash' /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TODO_SCHEMA: walkthrough_video_url + floor_plans[] columns. */}
      <div className='card'>
        <div className='card-head'>
          <div>
            <h3 className='card-title'>Walkthrough video</h3>
            <p className='card-subtitle'>not yet stored · paste a YouTube/Vimeo URL — appears in the property memo</p>
          </div>
        </div>
        <div className='card-body'>
          <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: '24px 16px', textAlign: 'center', color: 'var(--fg-muted)' }}>
            <Icon name='play' style={{ width: 28, height: 28, opacity: 0.4, marginBottom: 6 }} />
            <div style={{ fontSize: 13 }}>No video attached</div>
            <div className='muted' style={{ fontSize: 11, marginTop: 4 }}>Drone aerial or interior walkthrough recommended · 60–180 seconds · 1080p+</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MEMO_SECTIONS: Array<{ key: 'investment_thesis' | 'strategy' | 'seasonality'; title: string; sub: string }> = [
  { key: 'investment_thesis', title: 'Investment thesis',     sub: 'Why this property is positioned for outperformance.' },
  { key: 'strategy',          title: 'Operating strategy',    sub: 'Channel mix, pricing strategy, on-site team.' },
  { key: 'seasonality',       title: 'Seasonality & demand',  sub: 'Year-round revenue pattern and peak/trough months.' },
];

function MemoTab({ draft, update }: TabProps) {
  return (
    <div className='col gap-16'>
      {MEMO_SECTIONS.map(({ key, title, sub }) => (
        <div className='card' key={key}>
          <div className='card-head'>
            <div>
              <h3 className='card-title'>{title}</h3>
              <p className='card-subtitle'>{sub}</p>
            </div>
          </div>
          <div className='card-body'>
            <textarea
              className='textarea'
              rows={4}
              value={draft[key]}
              onChange={e => update(key, e.target.value)}
              placeholder={`Write the ${title.toLowerCase()} section…`}
            />
          </div>
        </div>
      ))}

      {/* TODO_SCHEMA: dedicated columns for upgrade_strategy + key_metrics +
          lrm_operating_plan to fully match the design's 5 memo subsections. */}
      <div className='card' style={{ background: 'var(--bg-subtle)', borderStyle: 'dashed' }}>
        <div className='card-body' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          Two more memo sections — <em>upgrade strategy</em> and <em>LRM operating plan</em> — are wireframed in the design but require new schema columns to persist. The three sections above already round-trip to the database.
        </div>
      </div>
    </div>
  );
}

const RISK_AREAS = [
  'Regulatory / short-term-rental policy',
  'Currency (MXN/USD) exposure',
  'Seasonality and weather',
  'Local supply growth',
  'Property-specific risk',
];

function RisksTab({ draft, update }: TabProps) {
  // The schema stores risks[] as a flat string array; we render an editable
  // row per design risk area, filling from existing entries by index.
  const setIdx = (idx: number, val: string) => {
    const next = [...draft.risks];
    while (next.length <= idx) next.push('');
    next[idx] = val;
    update('risks', next);
  };

  return (
    <div className='card'>
      <div className='card-head'><h3 className='card-title'>Risks &amp; considerations</h3></div>
      <div className='card-body col gap-12'>
        {RISK_AREAS.map((label, i) => (
          <div key={label} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</div>
            <textarea
              className='textarea'
              rows={2}
              value={draft.risks[i] ?? ''}
              onChange={e => setIdx(i, e.target.value)}
              placeholder='Describe specific risk and mitigation…'
            />
          </div>
        ))}
        <div className='card' style={{ background: 'var(--bg-subtle)', borderStyle: 'dashed' }}>
          <div className='card-body' style={{ padding: 14, fontSize: 12, color: 'var(--fg-muted)' }}>
            <strong>Standard disclaimer (auto-appended):</strong> Revenue estimates are directional and not guaranteed. They exclude operating expenses, taxes, financing, commissions, owner usage, and regulatory changes. Past performance does not predict future results.
          </div>
        </div>
      </div>
    </div>
  );
}

function SeoTab({ draft }: { draft: Draft }) {
  // TODO_SCHEMA: properties.seo_title + seo_description + og_image columns.
  // The slug echo below is the canonical slug used to build the public URL.
  return (
    <div className='card'>
      <div className='card-head'>
        <h3 className='card-title'>SEO</h3>
        <p className='card-subtitle'>Used for search engines and social sharing · all fields below are not yet persisted (schema migration required)</p>
      </div>
      <div className='card-body col gap-16'>
        <div className='field'>
          <label className='label'>Public URL</label>
          <div className='input-group'>
            <div className='addon'>/properties/</div>
            <input className='input' value={draft.slug} readOnly />
          </div>
          <div className='input-help'>Edit the slug on the Overview tab.</div>
        </div>
        <div className='field'>
          <label className='label'>SEO title <span className='help'>60 chars max</span></label>
          <input className='input' placeholder='Casa de los Olivos · 6BR Centro Investment Property' />
        </div>
        <div className='field'>
          <label className='label'>Meta description <span className='help'>155 chars max</span></label>
          <textarea className='textarea' rows={2} />
        </div>
        <div className='field'>
          <label className='label'>Open Graph image</label>
          <div style={{ aspectRatio: '1.91/1', maxWidth: 380, background: 'var(--bg-subtle)', border: '1px dashed var(--border-strong)', borderRadius: 6, display: 'grid', placeItems: 'center', color: 'var(--fg-subtle)' }}>
            <Icon name='upload' />
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishTab({ draft, update }: TabProps) {
  return (
    <div className='grid-2'>
      <div className='card'>
        <div className='card-head'><h3 className='card-title'>Visibility</h3></div>
        <div className='card-body col gap-16'>
          <div className='field'>
            <label className='label'>Status</label>
            <div className='col gap-8'>
              {STATUS_OPTIONS.map(([v, l, d]) => (
                <label
                  key={v}
                  className='row gap-12'
                  style={{
                    padding: 12,
                    border: `1px solid ${draft.status === v ? 'var(--fg)' : 'var(--border)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type='radio'
                    name='vis'
                    checked={draft.status === v}
                    onChange={() => update('status', v)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className='row gap-8'>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{l}</span>
                      <StatusBadge status={v} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{d}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TODO_SCHEMA: gate_full_memo + featured_on_homepage + allow_indexing
          + assigned_advisor columns. UI rendered for design fidelity. */}
      <div className='card'>
        <div className='card-head'>
          <h3 className='card-title'>Lead capture</h3>
          <span className='card-subtitle'>not yet stored</span>
        </div>
        <div className='card-body col gap-16'>
          <ToggleRow defaultChecked title='Gate full memo' desc='Require email + phone before showing detailed financials' />
          <ToggleRow                title='Featured on homepage' desc='Surface in the Featured Properties module' />
          <ToggleRow defaultChecked title='Allow indexing' desc='Include in sitemap and search results' />
          <div className='divider' />
          <div className='field'>
            <label className='label'>Assigned advisor</label>
            <select className='select'>
              <option>Justin McCarter</option>
              <option>Maria Santos</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  defaultChecked = false, title, desc,
}: { defaultChecked?: boolean; title: string; desc: string }) {
  return (
    <label className='row gap-12' style={{ padding: 10, cursor: 'pointer' }}>
      <span className='switch'>
        <input type='checkbox' defaultChecked={defaultChecked} />
        <span className='switch-track' />
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{desc}</div>
      </div>
    </label>
  );
}

