'use client';

import { useMemo, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/leads.jsx — full table with search,
// 5-axis filters, multi-select with bulk actions, and a 5-tab detail
// drawer. Persists what the schema currently has (name, email, phone,
// budget, timeline, buyer_type, neighborhoods, message, source_page,
// created_at). Status, source classification, assignee, and notes
// don't exist as columns yet — they're rendered for design fidelity
// and tracked in-memory only, with TODO_SCHEMA where a migration is
// required to make them persist.

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  buyer_type: string | null;
  neighborhoods: string[] | null;
  message: string | null;
  source_page: string | null;
  created_at: string;
};

type Status = 'new' | 'contacted' | 'qualified' | 'meeting' | 'won' | 'lost';
type Source = 'organic' | 'paid' | 'roi' | 'memo' | 'referral' | 'direct';

const STATUS_OPTIONS: Array<[Status, string]> = [
  ['new',       'New'],
  ['contacted', 'Contacted'],
  ['qualified', 'Qualified'],
  ['meeting',   'Meeting set'],
  ['won',       'Won'],
  ['lost',      'Lost'],
];

const SOURCE_OPTIONS: Array<[Source, string]> = [
  ['organic',  'Organic'],
  ['paid',     'Paid Ad'],
  ['roi',      'ROI Calc'],
  ['memo',     'Memo'],
  ['referral', 'Referral'],
  ['direct',   'Direct'],
];

const STATUS_BADGE: Record<Status, 'success' | 'warn' | 'info' | 'purple' | 'outline' | 'danger'> = {
  new:       'info',
  contacted: 'purple',
  qualified: 'info',
  meeting:   'warn',
  won:       'success',
  lost:      'danger',
};

const SOURCE_DOT_COLOR: Record<Source, string> = {
  organic:  '#16A34A',
  paid:     '#2563EB',
  roi:      '#7C3AED',
  memo:     '#CA8A04',
  referral: '#0EA5E9',
  direct:   '#71717A',
};

// TODO_SCHEMA: leads.status column. Until then, derive a default ("new").
function statusOf(_lead: Lead): Status {
  return 'new';
}

// TODO_SCHEMA: leads.source classification column. Until then, derive a
// coarse bucket from source_page so filtering still does something
// meaningful for inbound.
function sourceOf(lead: Lead): Source {
  const p = (lead.source_page ?? '').toLowerCase();
  if (p.includes('roi')) return 'roi';
  if (p.includes('memo') || p.includes('properties')) return 'memo';
  if (p.includes('utm_source=google') || p.includes('paid') || p.includes('ad')) return 'paid';
  if (p.includes('referral') || p.includes('ref=')) return 'referral';
  if (p === '/' || p === '/contact' || p === '') return 'direct';
  return 'organic';
}

// TODO_SCHEMA: leads.assigned_to column. Placeholder list cycles through
// reasonable defaults for visual fidelity.
function assignedOf(_lead: Lead): string { return 'Unassigned'; }

// Coarse budget bucket for the Budget filter pill, derived from the
// free-text budget column.
function budgetBucketOf(lead: Lead): '1M-2M' | '2M-3M' | '3M-5M' | '5M+' | null {
  const raw = (lead.budget ?? '').toLowerCase();
  if (!raw) return null;
  // tolerate "$2.5m", "2-3M", "5m+" etc.
  const m = raw.match(/(\d+(?:\.\d+)?)\s*m/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n >= 5) return '5M+';
  if (n >= 3) return '3M-5M';
  if (n >= 2) return '2M-3M';
  return '1M-2M';
}

const TIMELINE_OPTIONS: Array<['0-3mo' | '3-6mo' | '6-12mo' | '12mo+', string]> = [
  ['0-3mo',  '0–3 mo'],
  ['3-6mo',  '3–6 mo'],
  ['6-12mo', '6–12 mo'],
  ['12mo+',  '12 mo+'],
];

function StatusBadge({ status }: { status: string }) {
  const safe = (STATUS_OPTIONS.find(s => s[0] === status)?.[0] as Status | undefined) ?? 'new';
  const label = STATUS_OPTIONS.find(s => s[0] === safe)?.[1] ?? status;
  return <span className={`badge badge-${STATUS_BADGE[safe]}`}>{label}</span>;
}

function SourceDot({ source }: { source: Source }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: SOURCE_DOT_COLOR[source],
      marginRight: 8,
      verticalAlign: 'middle',
    }} />
  );
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

function FilterPill<V extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: V;
  options: ReadonlyArray<[V, string]>;
  onChange: (v: V) => void;
}) {
  const active = value !== ('all' as V);
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
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          width: 12, height: 12, pointerEvents: 'none', color: 'var(--fg-subtle)',
        }}
      />
    </div>
  );
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return <div className={`checkbox ${checked ? 'checked' : ''}`} onClick={onClick} />;
}

// ---------------------------------------------------------------------------
// Top-level
// ---------------------------------------------------------------------------

type Filters = {
  status: 'all' | Status;
  source: 'all' | Source;
  budget: 'all' | '1M-2M' | '2M-3M' | '3M-5M' | '5M+';
  timeline: 'all' | '0-3mo' | '3-6mo' | '6-12mo' | '12mo+';
  buyerType: 'all' | string;
};

const EMPTY_FILTERS: Filters = { status: 'all', source: 'all', budget: 'all', timeline: 'all', buyerType: 'all' };

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads] = useState(initialLeads);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => leads.filter(l => {
    if (filters.status !== 'all' && statusOf(l) !== filters.status) return false;
    if (filters.source !== 'all' && sourceOf(l) !== filters.source) return false;
    if (filters.budget !== 'all' && budgetBucketOf(l) !== filters.budget) return false;
    if (filters.timeline !== 'all' && (l.timeline ?? '').toLowerCase() !== filters.timeline.replace('-', '–')) {
      // tolerate dash variants
      if ((l.timeline ?? '') !== filters.timeline) return false;
    }
    if (filters.buyerType !== 'all' && l.buyer_type !== filters.buyerType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(`${l.name} ${l.email}`).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [leads, filters, search]);

  const buyerTypeValues = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => { if (l.buyer_type) set.add(l.buyer_type); });
    return Array.from(set);
  }, [leads]);

  const activeFilters = Object.values(filters).filter(v => v !== 'all').length;

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(l => l.id));
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className='main'>
      <Topbar crumbs={['Leads']}>
        <button className='btn btn-sm'><Icon name='download' /> Export CSV</button>
        <button className='btn btn-sm btn-primary'><Icon name='plus' /> New lead</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Leads</h1>
            <p className='page-subtitle'>
              {filtered.length} of {leads.length} leads · {selected.length > 0 ? `${selected.length} selected` : 'Click a row to view details'}
            </p>
          </div>
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <div style={{ position: 'relative' }}>
                <Icon name='search' style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--fg-subtle)' }} />
                <input
                  className='input'
                  style={{ paddingLeft: 28, width: 240 }}
                  placeholder='Search name or email…'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <FilterPill<'all' | Status>
                label='Status'
                value={filters.status}
                options={[['all', 'All'], ...STATUS_OPTIONS]}
                onChange={v => setFilters(f => ({ ...f, status: v }))}
              />
              <FilterPill<'all' | Source>
                label='Source'
                value={filters.source}
                options={[['all', 'All'], ...SOURCE_OPTIONS]}
                onChange={v => setFilters(f => ({ ...f, source: v }))}
              />
              <FilterPill<'all' | '1M-2M' | '2M-3M' | '3M-5M' | '5M+'>
                label='Budget'
                value={filters.budget}
                options={[['all', 'All'], ['1M-2M', '$1M–2M'], ['2M-3M', '$2M–3M'], ['3M-5M', '$3M–5M'], ['5M+', '$5M+']]}
                onChange={v => setFilters(f => ({ ...f, budget: v }))}
              />
              <FilterPill<'all' | '0-3mo' | '3-6mo' | '6-12mo' | '12mo+'>
                label='Timeline'
                value={filters.timeline}
                options={[['all', 'All'], ...TIMELINE_OPTIONS]}
                onChange={v => setFilters(f => ({ ...f, timeline: v }))}
              />
              <FilterPill<'all' | string>
                label='Buyer'
                value={filters.buyerType}
                options={[['all', 'All'], ...buyerTypeValues.map(v => [v, v] as ['all' | string, string])]}
                onChange={v => setFilters(f => ({ ...f, buyerType: v }))}
              />
              {activeFilters > 0 && (
                <button className='btn btn-sm btn-ghost' onClick={() => setFilters(EMPTY_FILTERS)}>Clear</button>
              )}
            </div>
            <div className='right'>
              {selected.length > 0 && (
                <>
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{selected.length} selected</span>
                  <button className='btn btn-sm'>Assign</button>
                  <button className='btn btn-sm'>Update status</button>
                  <button className='btn btn-sm'>Export</button>
                </>
              )}
            </div>
          </div>

          <div className='table-scroll'>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 32 }}>
                    <Checkbox
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onClick={toggleAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Buyer type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Assigned</th>
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const src = sourceOf(lead);
                  return (
                    <tr key={lead.id} className={selected.includes(lead.id) ? 'selected' : ''}>
                      <td onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(lead.id)} onClick={() => toggle(lead.id)} />
                      </td>
                      <td>
                        <button
                          className='row-link'
                          onClick={() => setDrawerLead(lead)}
                          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
                        >
                          {lead.name}
                        </button>
                        <div className='row-sub'>{lead.email}</div>
                      </td>
                      <td>
                        <SourceDot source={src} />
                        <span style={{ fontSize: 12 }}>{SOURCE_OPTIONS.find(s => s[0] === src)?.[1]}</span>
                      </td>
                      <td className='mono'>{lead.budget ?? '—'}</td>
                      <td className='mono'>{lead.timeline ?? '—'}</td>
                      <td style={{ fontSize: 12 }}>{lead.buyer_type ?? '—'}</td>
                      <td><StatusBadge status={statusOf(lead)} /></td>
                      <td className='mono' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{fmtDate(lead.created_at)}</td>
                      <td style={{ fontSize: 12 }}>{assignedOf(lead)}</td>
                      <td>
                        <button className='btn btn-icon btn-ghost btn-sm'><Icon name='more' /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className='empty'>
                <div className='empty-icon'><Icon name='leads' /></div>
                <h3>No leads match your filters</h3>
                <p>Try adjusting filters or clearing them to see all leads.</p>
                <button
                  className='btn btn-sm'
                  onClick={() => { setFilters(EMPTY_FILTERS); setSearch(''); }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-muted)' }}>
            <div>Showing 1–{filtered.length} of {filtered.length}</div>
            <div className='row gap-4'>
              <button className='btn btn-sm' disabled>Previous</button>
              <button className='btn btn-sm' disabled>Next</button>
            </div>
          </div>
        </div>
      </div>

      {drawerLead && <LeadDrawer lead={drawerLead} onClose={() => setDrawerLead(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

type DrawerTab = 'overview' | 'form-data' | 'roi-inputs' | 'reports' | 'notes';

const DRAWER_TABS: Array<[DrawerTab, string]> = [
  ['overview',   'Overview'],
  ['form-data',  'Form data'],
  ['roi-inputs', 'ROI inputs'],
  ['reports',    'Reports'],
  ['notes',      'Notes'],
];

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [tab, setTab] = useState<DrawerTab>('overview');
  const status = statusOf(lead);
  const src = sourceOf(lead);
  return (
    <>
      <div className='overlay' onClick={onClose} style={{ background: 'rgba(9,9,11,0.3)' }} />
      <div className='drawer'>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className='row gap-8' style={{ marginBottom: 4 }}>
              <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{lead.id.slice(0, 8)}</span>
              <StatusBadge status={status} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '4px 0' }}>{lead.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
              {lead.phone && <> · <a href={`tel:${lead.phone}`}>{lead.phone}</a></>}
            </div>
          </div>
          <button className='btn btn-icon btn-ghost' onClick={onClose}><Icon name='close' /></button>
        </div>

        <div style={{ padding: '12px 24px 0' }}>
          <div className='tabs' style={{ marginBottom: 0 }}>
            {DRAWER_TABS.map(([k, l]) => (
              <div
                key={k}
                className={`tab ${tab === k ? 'active' : ''}`}
                onClick={() => setTab(k)}
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {tab === 'overview' && (
            <div className='col gap-16'>
              <div className='card'>
                <div className='card-body' style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 8, letterSpacing: '0.06em' }}>Lead summary</div>
                  <Stat k='Source'      v={<><SourceDot source={src} />{SOURCE_OPTIONS.find(s => s[0] === src)?.[1]}</>} />
                  <Stat k='Budget'      v={lead.budget ?? '—'} mono />
                  <Stat k='Timeline'    v={lead.timeline ?? '—'} mono />
                  <Stat k='Buyer type'  v={lead.buyer_type ?? '—'} />
                  <Stat k='Created'     v={fmtDate(lead.created_at)} mono />
                  <Stat k='Assigned to' v={assignedOf(lead)} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 8, letterSpacing: '0.06em' }}>
                  Update status <span className='muted' style={{ textTransform: 'none', fontWeight: 400 }}>· not yet stored</span>
                </div>
                <div className='row gap-6' style={{ flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(([s]) => (
                    <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : ''}`} title='Status updates require a leads.status column'>
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 8, letterSpacing: '0.06em' }}>Quick actions</div>
                <div className='row gap-6' style={{ flexWrap: 'wrap' }}>
                  <a className='btn btn-sm' href={`mailto:${lead.email}`}><Icon name='leads' /> Email</a>
                  <button className='btn btn-sm'><Icon name='calendar' /> Schedule call</button>
                  <button className='btn btn-sm'><Icon name='file' /> Send memo</button>
                  <button className='btn btn-sm' onClick={() => navigator.clipboard?.writeText(`${lead.name} <${lead.email}>${lead.phone ? ' · ' + lead.phone : ''}`)}><Icon name='copy' /> Copy details</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'form-data' && (
            <div className='card'>
              <div className='card-body' style={{ padding: 14 }}>
                <Stat k='Form'             v='Request Access' />
                <Stat k='Submitted from'   v={lead.source_page ?? '—'} mono />
                <Stat k='Neighborhoods'    v={(lead.neighborhoods ?? []).join(', ') || '—'} />
                <Stat k='Buyer type'       v={lead.buyer_type ?? '—'} />
                <Stat k='Budget'           v={lead.budget ?? '—'} mono />
                <Stat k='Timeline'         v={lead.timeline ?? '—'} mono />
                <Stat k='Phone'            v={lead.phone ?? '—'} mono />
                <Stat k='Email'            v={lead.email} mono />
                {lead.message && (
                  <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 13, lineHeight: 1.5 }}>
                    <div className='muted' style={{ fontSize: 11, marginBottom: 4, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em' }}>MESSAGE</div>
                    {lead.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TODO_SCHEMA: roi_submissions table to back this tab. */}
          {tab === 'roi-inputs' && (
            <div className='card'>
              <div className='card-body' style={{ padding: 14, fontSize: 13, color: 'var(--fg-muted)' }}>
                ROI calculator submissions are not yet linked to leads. Once the <code>roi_submissions</code> table ships, the most-recent submission for this email will appear here.
              </div>
            </div>
          )}

          {/* TODO_SCHEMA: lead_report_downloads join table. */}
          {tab === 'reports' && (
            <div className='card'>
              <div className='card-body' style={{ padding: 14, fontSize: 13, color: 'var(--fg-muted)' }}>
                Gated-report downloads tied to this email will list here once the <code>lead_report_downloads</code> table is added.
              </div>
            </div>
          )}

          {/* TODO_SCHEMA: lead_notes table. */}
          {tab === 'notes' && (
            <div className='col gap-12'>
              <textarea className='textarea' placeholder='Add an internal note…' rows={3} />
              <div className='row' style={{ justifyContent: 'flex-end' }}>
                <button className='btn btn-sm btn-primary' disabled title='Notes require a lead_notes table'>Add note</button>
              </div>
              <div className='card'>
                <div className='card-body' style={{ padding: 14, fontSize: 13, color: 'var(--fg-muted)' }}>
                  Internal notes will appear here once the <code>lead_notes</code> table is added.
                </div>
              </div>
            </div>
          )}
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
