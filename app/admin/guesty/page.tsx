'use client';

import { useEffect, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/guesty.jsx — Guesty PMS integration
// page: API connection card, portfolio KPI strip, and 3 inline tables
// (Listings, Reservations, Import history). Connection settings
// persist to localStorage per the design (TODO_AUTH for the real
// Guesty API + a guesty_settings encrypted column).

const SETTINGS_KEY = 'investsma_guesty_settings';

type Settings = {
  apiKey: string;
  accountId: string;
  clientSecret: string;
  connected: boolean;
  syncFreq: 'realtime' | 'hourly' | 'daily' | 'manual';
  autoSync: boolean;
  lastSync: string | null;
};

const DEFAULT_SETTINGS: Settings = {
  apiKey: '', accountId: '', clientSecret: '', connected: false,
  syncFreq: 'hourly', autoSync: true, lastSync: null,
};

const LISTINGS = [
  { id: 'GS-014', name: 'Casa de los Olivos',  nickname: 'Centro 6BR',          neighborhood: 'Centro',      beds: 6, status: 'active',   adr: 1980, occ: 73, revpar: 1445, nights: 248, revenue: 491040, lastSync: '2 min ago',  linked: 'P-014' },
  { id: 'GS-013', name: 'Hacienda Las Cruces', nickname: 'Atascadero Estate',   neighborhood: 'Atascadero',  beds: 8, status: 'active',   adr: 2840, occ: 68, revpar: 1931, nights: 232, revenue: 658880, lastSync: '2 min ago',  linked: 'P-013' },
  { id: 'GS-012', name: 'Villa San Antonio',   nickname: 'San Antonio 5BR',     neighborhood: 'San Antonio', beds: 5, status: 'active',   adr: 1620, occ: 71, revpar: 1150, nights: 244, revenue: 395280, lastSync: '5 min ago',  linked: 'P-012' },
  { id: 'GS-011', name: 'Casa del Mirador',    nickname: 'Guadiana 7BR',        neighborhood: 'Guadiana',    beds: 7, status: 'active',   adr: 2380, occ: 70, revpar: 1666, nights: 240, revenue: 571200, lastSync: '5 min ago',  linked: 'P-011' },
  { id: 'GS-010', name: 'Quinta Los Frailes',  nickname: 'Los Frailes 6BR',     neighborhood: 'Los Frailes', beds: 6, status: 'active',   adr: 1880, occ: 65, revpar: 1222, nights: 222, revenue: 417360, lastSync: '8 min ago',  linked: 'P-010' },
  { id: 'GS-009', name: 'Casa de la Aurora',   nickname: 'Aurora 5BR',          neighborhood: 'Centro',      beds: 5, status: 'active',   adr: 1580, occ: 75, revpar: 1185, nights: 256, revenue: 404480, lastSync: '8 min ago',  linked: 'P-009' },
  { id: 'GS-008', name: 'Hacienda El Recreo',  nickname: 'Atascadero 9BR',      neighborhood: 'Atascadero',  beds: 9, status: 'active',   adr: 3340, occ: 64, revpar: 2138, nights: 218, revenue: 728120, lastSync: '12 min ago', linked: 'P-008' },
  { id: 'GS-007', name: 'Casa Tres Patios',    nickname: 'Tres Patios',         neighborhood: 'Centro',      beds: 6, status: 'inactive', adr: null, occ: null, revpar: null, nights: 0, revenue: 0, lastSync: '2 days ago', linked: null   },
];

const RESERVATIONS = [
  { id: 'R-48201', guest: 'Henderson party',  listing: 'Casa de los Olivos',  checkin: '2026-02-14', nights: 7,  total: 14280, source: 'Airbnb',      status: 'confirmed' },
  { id: 'R-48200', guest: 'Krishnan family',  listing: 'Hacienda Las Cruces', checkin: '2026-02-12', nights: 5,  total: 14600, source: 'Direct',      status: 'confirmed' },
  { id: 'R-48199', guest: 'Mendoza/Vargas',   listing: 'Villa San Antonio',   checkin: '2026-02-08', nights: 4,  total: 6720,  source: 'VRBO',        status: 'confirmed' },
  { id: 'R-48198', guest: 'Whitfield+',       listing: 'Casa del Mirador',    checkin: '2026-02-05', nights: 10, total: 24800, source: 'Airbnb',      status: 'in-house'  },
  { id: 'R-48197', guest: 'Park anniversary', listing: 'Casa de la Aurora',   checkin: '2026-02-01', nights: 6,  total: 9720,  source: 'Direct',      status: 'in-house'  },
  { id: 'R-48196', guest: 'Volkova/Eklund',   listing: 'Hacienda El Recreo',  checkin: '2026-01-28', nights: 4,  total: 13680, source: 'Airbnb',      status: 'in-house'  },
  { id: 'R-48195', guest: 'Reilly group',     listing: 'Quinta Los Frailes',  checkin: '2026-01-24', nights: 5,  total: 9700,  source: 'Booking.com', status: 'in-house'  },
  { id: 'R-48194', guest: 'Tanaka party',     listing: 'Casa de los Olivos',  checkin: '2026-01-18', nights: 7,  total: 13860, source: 'Direct',      status: 'completed' },
];

const HISTORY = [
  { file: 'guesty_owner_statement_dec2025.xlsx', source: 'Owner Statement',      date: 'Jan 8, 2026',  by: 'Justin', rows: 248,  period: 'Dec 2025', status: 'imported' },
  { file: 'guesty_revpar_q4_2025.csv',           source: 'RevPAR Report',         date: 'Jan 5, 2026',  by: 'Justin', rows: 184,  period: 'Q4 2025',  status: 'imported' },
  { file: 'guesty_occupancy_q4_2025.csv',        source: 'Occupancy Report',      date: 'Jan 5, 2026',  by: 'Maria',  rows: 184,  period: 'Q4 2025',  status: 'imported' },
  { file: 'guesty_reservations_2025.csv',        source: 'Reservations Export',   date: 'Jan 3, 2026',  by: 'Justin', rows: 1248, period: 'FY 2025',  status: 'imported' },
  { file: 'guesty_owner_q3_partial.xlsx',        source: 'Owner Statement',      date: 'Oct 12, 2025', by: 'Maria',  rows: 12,   period: 'Sep 2025', status: 'review'   },
];

const PORTFOLIO_STATS = [
  { label: 'Active listings',          v: '7',     sub: '1 inactive · 8 total' },
  { label: 'Trailing 12mo revenue',    v: '$3.67M', sub: 'Across 7 active listings' },
  { label: 'Portfolio ADR',            v: '$2,134', sub: 'LTM weighted average' },
  { label: 'Portfolio occupancy',      v: '69%',    sub: 'LTM weighted average' },
  { label: 'YTD reservations',         v: '184',    sub: '1,648 booked nights' },
  { label: 'In-house tonight',         v: '4',      sub: '12 arrivals this week' },
];

function fmtMoney(n: number | null): string {
  if (n == null) return '—';
  return '$' + n.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const kind =
    status === 'active' || status === 'imported' || status === 'completed' || status === 'confirmed' ? 'success' :
    status === 'in-house' ? 'info' :
    status === 'review' || status === 'cancelled' ? 'warn' :
    status === 'inactive' || status === 'rejected' ? 'outline' : 'outline';
  const label =
    status === 'in-house' ? 'In-house' :
    status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge badge-${kind}`}>{label}</span>;
}

type Tab = 'listings' | 'reservations' | 'imports' | 'mapping';

const TABS: Array<[Tab, string, number | null]> = [
  ['listings',     'Listings',       LISTINGS.length],
  ['reservations', 'Reservations',   RESERVATIONS.length],
  ['imports',      'Import history', HISTORY.length],
  ['mapping',      'Field mapping',  null],
];

export default function Page() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>('listings');
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<'owner-statement' | 'revpar' | 'occupancy' | 'reservations'>('owner-statement');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setS({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (next: Settings) => {
    setS(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
  };

  const onConnect = () => {
    persist({ ...s, connected: true, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') });
  };
  const onDisconnect = () => {
    if (!confirm('Disconnect Guesty? Auto-sync will stop. Imported historical data is preserved.')) return;
    persist({ ...s, connected: false });
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Integrations', 'Guesty']}>
        <button className='btn btn-sm' onClick={() => setShowImport(true)}><Icon name='upload' /> Import report</button>
        {s.connected && <button className='btn btn-sm'><Icon name='refresh' /> Sync now</button>}
        <button className='btn btn-sm btn-primary'><Icon name='external' /> Open Guesty</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Guesty</h1>
            <p className='page-subtitle'>Property management data — listings, reservations, revenue, owner statements</p>
          </div>
        </div>

        <ConnectionCard
          s={s}
          onChange={setS}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />

        {hydrated && !s.connected && (
          <div className='card' style={{ marginBottom: 20, background: '#EFF6FF', borderColor: 'rgba(37,99,235,0.2)' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <Icon name='info' style={{ color: '#2563EB', width: 18, height: 18 }} />
              <div style={{ flex: 1 }}>
                <strong>Two ways to load Guesty data:</strong>
                <span className='muted'> Connect the API above for automatic sync, or use{' '}
                  <button onClick={() => setShowImport(true)} style={{ color: '#2563EB', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Import report</button>{' '}
                  to upload Guesty CSV/Excel exports manually. Both methods feed Properties + Market Data.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {PORTFOLIO_STATS.map((st, i) => (
            <div key={i} className='card'>
              <div className='card-body'>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{st.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6, fontFamily: 'var(--f-mono)' }}>{st.v}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 4 }}>{st.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '10px 16px', background: 'transparent', border: 'none',
                borderBottom: tab === id ? '2px solid var(--fg)' : '2px solid transparent',
                color: tab === id ? 'var(--fg)' : 'var(--fg-muted)',
                fontWeight: tab === id ? 600 : 500, fontSize: 13, cursor: 'pointer',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {label}
              {count != null && <span style={{ fontSize: 11, color: 'var(--fg-subtle)', fontWeight: 500 }}>{count}</span>}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div className='table-wrap'>
            <div className='table-toolbar'>
              <div className='left'><span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Trailing 12-month performance · synced from Guesty</span></div>
              <div className='right'>
                <button className='btn btn-sm btn-ghost'><Icon name='filter' /> Filter</button>
                <button className='btn btn-sm btn-ghost'><Icon name='download' /> Export</button>
              </div>
            </div>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Neighborhood</th>
                    <th className='num'>Beds</th>
                    <th className='num'>ADR</th>
                    <th className='num'>Occ</th>
                    <th className='num'>RevPAR</th>
                    <th className='num'>Nights</th>
                    <th className='num'>Revenue</th>
                    <th>Linked</th>
                    <th>Synced</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {LISTINGS.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{l.name}</div>
                        <div className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{l.id} · {l.nickname}</div>
                      </td>
                      <td>{l.neighborhood}</td>
                      <td className='num mono'>{l.beds}</td>
                      <td className='num mono'>{fmtMoney(l.adr)}</td>
                      <td className='num mono'>{l.occ != null ? l.occ + '%' : '—'}</td>
                      <td className='num mono'>{fmtMoney(l.revpar)}</td>
                      <td className='num mono'>{l.nights}</td>
                      <td className='num mono' style={{ fontWeight: 600 }}>{fmtMoney(l.revenue)}</td>
                      <td className='mono' style={{ fontSize: 12 }}>{l.linked ?? '—'}</td>
                      <td className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{l.lastSync}</td>
                      <td><StatusBadge status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'reservations' && (
          <div className='table-wrap'>
            <div className='table-toolbar'>
              <div className='left'><span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Latest 8 reservations · click to view full detail</span></div>
            </div>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr>
                    <th>Reservation</th>
                    <th>Guest</th>
                    <th>Listing</th>
                    <th>Check-in</th>
                    <th className='num'>Nights</th>
                    <th className='num'>Total</th>
                    <th>Source</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RESERVATIONS.map(r => (
                    <tr key={r.id}>
                      <td className='mono' style={{ fontSize: 12 }}>{r.id}</td>
                      <td>{r.guest}</td>
                      <td>{r.listing}</td>
                      <td className='mono' style={{ fontSize: 12 }}>{r.checkin}</td>
                      <td className='num mono'>{r.nights}</td>
                      <td className='num mono'>{fmtMoney(r.total)}</td>
                      <td style={{ fontSize: 12 }}>{r.source}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'imports' && (
          <div className='table-wrap'>
            <div className='table-toolbar'>
              <div className='left'><span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Manual Guesty exports imported into the warehouse</span></div>
              <div className='right'>
                <button className='btn btn-sm' onClick={() => setShowImport(true)}><Icon name='upload' /> Import report</button>
              </div>
            </div>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>By</th>
                    <th className='num'>Rows</th>
                    <th>Period</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map(h => (
                    <tr key={h.file}>
                      <td className='mono' style={{ fontSize: 11 }}>{h.file}</td>
                      <td style={{ fontSize: 12 }}>{h.source}</td>
                      <td className='mono' style={{ fontSize: 11 }}>{h.date}</td>
                      <td style={{ fontSize: 12 }}>{h.by}</td>
                      <td className='num mono'>{h.rows.toLocaleString()}</td>
                      <td style={{ fontSize: 12 }}>{h.period}</td>
                      <td><StatusBadge status={h.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'mapping' && (
          <div className='card'>
            <div className='card-head'>
              <h3 className='card-title'>Field mapping</h3>
              <p className='card-subtitle'>How Guesty fields map to InvestSMA tables · TODO_SCHEMA: editable when guesty_field_map ships</p>
            </div>
            <div className='card-body'>
              <div className='table-scroll'>
                <table>
                  <thead><tr><th>Guesty field</th><th>InvestSMA target</th><th>Notes</th></tr></thead>
                  <tbody>
                    {[
                      ['listing.id',          'properties.guesty_listing_id', 'Stable identifier · used to link Guesty rows to your property catalog'],
                      ['listing.nickname',    'properties.name (fallback)',   'Used only if name is unset'],
                      ['listing.bedrooms',    'properties.bedrooms',          'Source of truth when both populated'],
                      ['analytics.adr',       'market_monthly_performance.lrm_adr', 'Trailing 12-month weighted average'],
                      ['analytics.occupancy', 'market_monthly_performance.lrm_occupancy', 'Booked / available · excludes blocks'],
                      ['analytics.revenue',   'market_monthly_performance.gross_revenue', 'Auto-computed from ADR × nights'],
                      ['reservation.source',  'lead_sources_lookup',          'Maps Airbnb/VRBO/Direct etc. to lead sources'],
                    ].map(([g, t, n]) => (
                      <tr key={g}>
                        <td className='mono' style={{ fontSize: 12 }}>{g}</td>
                        <td className='mono' style={{ fontSize: 12 }}>{t}</td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <p className='muted' style={{ fontSize: 12, marginTop: 16 }}>
          Mock data · TODO_API: real Guesty REST + webhooks integration on top of the persisted settings above.
        </p>
      </div>

      {showImport && (
        <div className='overlay' onClick={() => setShowImport(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-head'>
              <h3 className='modal-title'>Import Guesty report</h3>
              <p className='modal-desc'>Upload a CSV / Excel export from Guesty. We&apos;ll route the rows to the right warehouse table based on the report type.</p>
            </div>
            <div className='modal-body' style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className='field'>
                <label className='label'>Report type</label>
                <select className='select' value={importType} onChange={e => setImportType(e.target.value as typeof importType)}>
                  <option value='owner-statement'>Owner statement</option>
                  <option value='revpar'>RevPAR report</option>
                  <option value='occupancy'>Occupancy report</option>
                  <option value='reservations'>Reservations export</option>
                </select>
              </div>
              <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: 24, textAlign: 'center', color: 'var(--fg-muted)' }}>
                <Icon name='upload' style={{ width: 28, height: 28, color: 'var(--fg-subtle)', marginBottom: 6 }} />
                <div style={{ fontSize: 13 }}>Drop CSV / Excel here or browse</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 4 }}>
                  Or use the CSV Import wizard for full validation
                </div>
              </div>
            </div>
            <div className='modal-foot'>
              <button className='btn' onClick={() => setShowImport(false)}>Cancel</button>
              <button className='btn btn-primary' disabled title='Use the CSV Import wizard for actual upload'>
                <Icon name='upload' /> Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionCard({
  s, onChange, onConnect, onDisconnect,
}: {
  s: Settings;
  onChange: (s: Settings) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [expanded, setExpanded] = useState(!s.connected);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className='card' style={{ marginBottom: 20 }}>
      <div className='card-head' style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6,
            background: s.connected ? 'var(--status-success-bg)' : 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: s.connected ? 'var(--status-success)' : 'var(--fg-subtle)',
            fontWeight: 700, fontSize: 15, fontFamily: 'var(--f-mono)',
          }}>g</div>
          <div>
            <h3 className='card-title' style={{ marginBottom: 2 }}>Guesty API</h3>
            <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
              {s.connected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, background: 'var(--status-success)', borderRadius: 3 }}></span>
                  Connected · Account {s.accountId} · Syncs {s.syncFreq} · Last sync {s.lastSync || 'just now'}
                </span>
              ) : 'Not connected — connect to auto-sync listings, reservations, and revenue from Guesty'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {s.connected && (
            <>
              <button className='btn btn-sm btn-ghost' onClick={onDisconnect}>Disconnect</button>
              <button className='btn btn-sm' onClick={() => setExpanded(e => !e)}>{expanded ? 'Hide' : 'Edit'} settings</button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className='card-body' style={{ borderTop: '1px solid var(--border)' }}>
          <div className='grid-2' style={{ gap: 16, marginBottom: 16 }}>
            <div className='field'>
              <label className='label'>Account ID <span className='req'>*</span></label>
              <input className='input' placeholder='5f8a1234abcd5678' value={s.accountId} onChange={e => onChange({ ...s, accountId: e.target.value })} />
              <div className='input-help'>Found in Guesty → Settings → Account.</div>
            </div>
            <div className='field'>
              <label className='label'>API Token <span className='req'>*</span></label>
              <input className='input' placeholder='gst_live_xxxxxxxxxxxxx' value={s.apiKey} onChange={e => onChange({ ...s, apiKey: e.target.value })} />
              <div className='input-help'>Generate in Guesty → Settings → API Keys.</div>
            </div>
          </div>
          <div className='field' style={{ marginBottom: 16 }}>
            <label className='label'>Client Secret <span className='muted'>(optional — for Open API v2)</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className='input'
                type={showSecret ? 'text' : 'password'}
                placeholder='••••••••••••••••'
                value={s.clientSecret}
                onChange={e => onChange({ ...s, clientSecret: e.target.value })}
                style={{ paddingRight: 80 }}
              />
              <button
                type='button'
                className='btn btn-sm btn-ghost'
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setShowSecret(v => !v)}
              >
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className='input-help'>Required for v2 endpoints (financial data, owner statements). Stored encrypted server-side.</div>
          </div>
          <div className='grid-2' style={{ gap: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className='field'>
              <label className='label'>Sync frequency</label>
              <select className='select' value={s.syncFreq} onChange={e => onChange({ ...s, syncFreq: e.target.value as Settings['syncFreq'] })}>
                <option value='realtime'>Real-time (webhooks)</option>
                <option value='hourly'>Every hour</option>
                <option value='daily'>Daily at 3:00 AM</option>
                <option value='manual'>Manual only</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type='checkbox' checked={s.autoSync} onChange={e => onChange({ ...s, autoSync: e.target.checked })} />
                Auto-update Properties + Market Data with synced figures
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className='btn' onClick={() => setExpanded(false)}>Cancel</button>
            <button className='btn btn-primary' onClick={onConnect} disabled={!s.accountId || !s.apiKey}>
              <Icon name='link' /> {s.connected ? 'Save changes' : 'Connect Guesty'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
