'use client';

import { useEffect, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design's admin/analytics.jsx — GA4 connection card +
// dashboard with stat cards, a traffic chart, top-pages / sources tables,
// conversions, and geo / devices breakdowns. Settings persist to
// localStorage; all metrics below the connection card are demo data
// until a real GA4 Data API integration lands.

const ANALYTICS_KEY = 'investsma_ga4_settings';

type Settings = {
  measurementId: string;
  propertyId: string;
  serviceAccount: string;
  connected: boolean;
  autoInject: boolean;
  anonymizeIp: boolean;
  lastSync: string | null;
};

const DEFAULT_SETTINGS: Settings = {
  measurementId: '',
  propertyId: '',
  serviceAccount: '',
  connected: false,
  autoInject: true,
  anonymizeIp: true,
  lastSync: null,
};

type Stat = {
  v: number | string;
  prev: number | string;
  label: string;
  invert?: boolean;
};

const GA_OVERVIEW: Record<string, Stat> = {
  visitors:    { v: 14823, prev: 11240, label: 'Users' },
  sessions:    { v: 21567, prev: 16890, label: 'Sessions' },
  pageviews:   { v: 68420, prev: 52310, label: 'Page views' },
  avgDuration: { v: '3:48', prev: '3:12', label: 'Avg. engagement' },
  bounce:      { v: '38%', prev: '44%', label: 'Bounce rate', invert: true },
  conversions: { v: 312, prev: 187, label: 'Conversions' },
};

const GA_TRAFFIC = [
  { day: 'Jan 1', users: 412 },  { day: 'Jan 2', users: 488 },  { day: 'Jan 3', users: 521 },
  { day: 'Jan 4', users: 602 },  { day: 'Jan 5', users: 489 },  { day: 'Jan 6', users: 644 },
  { day: 'Jan 7', users: 712 },  { day: 'Jan 8', users: 698 },  { day: 'Jan 9', users: 720 },
  { day: 'Jan 10', users: 815 }, { day: 'Jan 11', users: 690 }, { day: 'Jan 12', users: 748 },
  { day: 'Jan 13', users: 802 }, { day: 'Jan 14', users: 870 }, { day: 'Jan 15', users: 921 },
  { day: 'Jan 16', users: 1012 },{ day: 'Jan 17', users: 880 }, { day: 'Jan 18', users: 945 },
  { day: 'Jan 19', users: 1088 },{ day: 'Jan 20', users: 1150 },{ day: 'Jan 21', users: 1224 },
  { day: 'Jan 22', users: 1244 },
];

const GA_TOP_PAGES = [
  { path: '/',                title: 'Homepage',             views: 18420, users: 9220, avgTime: '2:14', exits: '32%' },
  { path: '/properties.html', title: 'Featured Properties',  views: 11240, users: 7180, avgTime: '4:02', exits: '28%' },
  { path: '/market.html',     title: 'Market Data',          views: 8920,  users: 5680, avgTime: '5:18', exits: '22%' },
  { path: '/roi.html',        title: 'ROI Calculator',       views: 7842,  users: 4810, avgTime: '6:48', exits: '41%' },
  { path: '/property.html',   title: 'Investment Memo',      views: 6231,  users: 3920, avgTime: '7:22', exits: '24%' },
  { path: '/insights.html',   title: 'Insights Hub',         views: 4180,  users: 2940, avgTime: '3:08', exits: '38%' },
  { path: '/contact.html',    title: 'Contact',              views: 2840,  users: 2210, avgTime: '1:42', exits: '52%' },
  { path: '/guide.html',      title: "Buyer's Guide",        views: 2120,  users: 1680, avgTime: '8:14', exits: '18%' },
];

const GA_SOURCES = [
  { source: 'google / organic',    users: 6420, sessions: 8910, pct: 41.3, conv: 4.2 },
  { source: '(direct) / (none)',   users: 3180, sessions: 4220, pct: 19.6, conv: 6.8 },
  { source: 'google / cpc',        users: 2240, sessions: 3110, pct: 14.4, conv: 5.1 },
  { source: 'instagram / social',  users: 1480, sessions: 1820, pct: 8.4,  conv: 1.8 },
  { source: 'newsletter / email',  users: 820,  sessions: 1240, pct: 5.7,  conv: 12.4 },
  { source: 'linkedin / social',   users: 410,  sessions: 580,  pct: 2.7,  conv: 3.6 },
  { source: 'youtube / referral',  users: 280,  sessions: 360,  pct: 1.7,  conv: 2.1 },
  { source: 'other',               users: 1003, sessions: 1287, pct: 6.2,  conv: 2.4 },
];

const GA_CONVERSIONS = [
  { event: 'lead_form_submit',    label: 'Lead form (Contact)',         count: 84,   value: '$840K est. pipeline',    trend: '+38%' },
  { event: 'roi_calc_complete',   label: 'ROI calc completed',          count: 142,  value: '47% conv. to lead',      trend: '+62%' },
  { event: 'memo_request',        label: 'Memo / underwriting request', count: 38,   value: '$2.1M avg budget',       trend: '+24%' },
  { event: 'video_play',          label: 'Hero video plays',            count: 1820, value: '4:12 avg watch',         trend: '+18%' },
  { event: 'newsletter_signup',   label: 'Newsletter signup',           count: 218,  value: 'List size: 2,840',       trend: '+12%' },
  { event: 'whatsapp_click',      label: 'WhatsApp / call CTA',         count: 96,   value: '—',                       trend: '+8%'  },
];

const GA_GEO = [
  { country: 'United States',  users: 8420, pct: 56.8, flag: '🇺🇸' },
  { country: 'Mexico',         users: 2240, pct: 15.1, flag: '🇲🇽' },
  { country: 'Canada',         users: 1180, pct: 8.0,  flag: '🇨🇦' },
  { country: 'United Kingdom', users: 720,  pct: 4.9,  flag: '🇬🇧' },
  { country: 'Germany',        users: 480,  pct: 3.2,  flag: '🇩🇪' },
  { country: 'Spain',          users: 410,  pct: 2.8,  flag: '🇪🇸' },
  { country: 'France',         users: 320,  pct: 2.2,  flag: '🇫🇷' },
  { country: 'Australia',      users: 280,  pct: 1.9,  flag: '🇦🇺' },
  { country: 'Other',          users: 773,  pct: 5.1,  flag: '🌐' },
];

const GA_DEVICES = [
  { device: 'Desktop', users: 8910, pct: 60.1 },
  { device: 'Mobile',  users: 5240, pct: 35.4 },
  { device: 'Tablet',  users: 673,  pct: 4.5  },
];

function pctChange(curr: number | string, prev: number | string): number | null {
  if (typeof curr === 'string' || typeof prev === 'string') return null;
  return ((curr - prev) / prev) * 100;
}

function StatCard({ stat }: { stat: Stat }) {
  const pct = pctChange(stat.v, stat.prev);
  const up = pct !== null && (stat.invert ? pct < 0 : pct > 0);
  return (
    <div className='card'>
      <div className='card-body'>
        <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
          {stat.label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6, fontFamily: 'var(--f-mono)' }}>
          {typeof stat.v === 'number' ? stat.v.toLocaleString() : stat.v}
        </div>
        {pct !== null && (
          <div style={{ fontSize: 12, marginTop: 6, color: up ? 'var(--status-success)' : 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name={up ? 'arrowUp' : 'arrowDown'} style={{ width: 12, height: 12 }} />
            {Math.abs(pct).toFixed(1)}% vs prior period
          </div>
        )}
      </div>
    </div>
  );
}

function TrafficChart({ data }: { data: typeof GA_TRAFFIC }) {
  const max = Math.max(...data.map(d => d.users));
  const W = 720, H = 200, P = 24;
  const xStep = (W - P * 2) / (data.length - 1);
  const points = data.map((d, i) => [P + i * xStep, H - P - ((d.users / max) * (H - P * 2))] as const);
  const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${path} L ${last[0]},${H - P} L ${first[0]},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id='ga-grad' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor='#2563EB' stopOpacity='0.18' />
          <stop offset='100%' stopColor='#2563EB' stopOpacity='0' />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={P} x2={W - P} y1={P + (H - P * 2) * p} y2={P + (H - P * 2) * p} stroke='#E4E4E7' strokeDasharray='2 3' />
      ))}
      <path d={area} fill='url(#ga-grad)' />
      <path d={path} stroke='#2563EB' strokeWidth='2' fill='none' />
      {points.map((p, i) => i % 3 === 0 && (
        <text key={i} x={p[0]} y={H - 6} fontSize='10' fill='#71717A' textAnchor='middle'>{data[i].day}</text>
      ))}
    </svg>
  );
}

function Bar({ pct, color = '#18181B' }: { pct: number; color?: string }) {
  return (
    <div style={{ width: 120, height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 3 }} />
    </div>
  );
}

function ConnectionCard({
  settings, onChange, onConnect, onDisconnect,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const [expanded, setExpanded] = useState(!settings.connected);
  return (
    <div className='card' style={{ marginBottom: 20 }}>
      <div className='card-head' style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: settings.connected ? 'var(--status-success-bg)' : 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: settings.connected ? 'var(--status-success)' : 'var(--fg-subtle)' }}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M22.84 2.998a3.5 3.5 0 0 0-3.484 3.142v11.812a3.5 3.5 0 0 0 .516 1.823 3.5 3.5 0 1 0 6.468-1.823V6.498A3.5 3.5 0 0 0 22.84 2.998Zm0 0M12 8.5a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 1 0 7 0v-6A3.5 3.5 0 0 0 12 8.5Zm0 0M3.5 14a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 0' />
            </svg>
          </div>
          <div>
            <h3 className='card-title' style={{ marginBottom: 2 }}>Google Analytics 4</h3>
            <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
              {settings.connected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, background: 'var(--status-success)', borderRadius: 3 }}></span>
                  Connected · {settings.measurementId} · Last sync {settings.lastSync || 'just now'}
                </span>
              ) : 'Not connected — paste a Measurement ID below to wire up tracking'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {settings.connected && (
            <>
              <button className='btn btn-sm btn-ghost' onClick={onDisconnect}>Disconnect</button>
              <button className='btn btn-sm' onClick={() => setExpanded(e => !e)}>{expanded ? 'Hide' : 'Edit'} settings</button>
            </>
          )}
        </div>
      </div>
      {expanded && (
        <div className='card-body' style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className='label'>Measurement ID <span style={{ color: 'var(--status-danger)' }}>*</span></label>
              <input className='input' placeholder='G-XXXXXXXXXX' value={settings.measurementId} onChange={e => onChange({ ...settings, measurementId: e.target.value })} />
              <div className='input-help'>Found in GA4 → Admin → Data Streams. Required to inject the tracking script on the public site.</div>
            </div>
            <div>
              <label className='label'>Property ID <span className='muted'>(optional)</span></label>
              <input className='input' placeholder='123456789' value={settings.propertyId} onChange={e => onChange({ ...settings, propertyId: e.target.value })} />
              <div className='input-help'>Required to pull live data via the GA4 Data API.</div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className='label'>Service Account JSON <span className='muted'>(optional — for live data)</span></label>
            <textarea className='input' style={{ minHeight: 88, fontFamily: 'var(--f-mono)', fontSize: 12 }} placeholder='{ "type": "service_account", ... }' value={settings.serviceAccount} onChange={e => onChange({ ...settings, serviceAccount: e.target.value })} />
            <div className='input-help'>Paste the JSON key for a GCP service account with <span className='mono'>analyticsdata.viewer</span> on this property. Stored encrypted server-side. Without it, the dashboard shows demo data.</div>
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 13, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type='checkbox' checked={settings.autoInject} onChange={e => onChange({ ...settings, autoInject: e.target.checked })} />
              Auto-inject gtag script on public site
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type='checkbox' checked={settings.anonymizeIp} onChange={e => onChange({ ...settings, anonymizeIp: e.target.checked })} />
              Anonymize IP addresses
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className='btn' onClick={() => setExpanded(false)}>Cancel</button>
            <button className='btn btn-primary' onClick={onConnect} disabled={!settings.measurementId}>
              <Icon name='link' /> {settings.connected ? 'Save changes' : 'Connect GA4'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [range, setRange] = useState('30d');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANALYTICS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (next: Settings) => {
    setSettings(next);
    try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next)); } catch {}
  };

  const onConnect = () => {
    persist({ ...settings, connected: true, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') });
  };
  const onDisconnect = () => {
    if (!confirm('Disconnect Google Analytics? The tracking script will be removed from the public site.')) return;
    persist({ ...settings, connected: false });
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Integrations', 'Site Analytics']}>
        <button className='btn btn-sm btn-ghost' onClick={() => setShowCodeSnippet(true)}><Icon name='copy' /> View tracking code</button>
        <button className='btn btn-sm'><Icon name='refresh' /> Sync now</button>
        <button className='btn btn-sm btn-primary'><Icon name='external' /> Open GA4</button>
      </Topbar>
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Site Analytics</h1>
            <p className='page-subtitle'>Traffic, conversions, and visitor behavior — Google Analytics 4</p>
          </div>
          <div className='row gap-8'>
            <select className='select' style={{ width: 140 }} value={range} onChange={e => setRange(e.target.value)}>
              <option value='7d'>Last 7 days</option>
              <option value='30d'>Last 30 days</option>
              <option value='90d'>Last 90 days</option>
              <option value='ytd'>Year to date</option>
              <option value='custom'>Custom…</option>
            </select>
          </div>
        </div>

        <ConnectionCard
          settings={settings}
          onChange={setSettings}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />

        {hydrated && !settings.connected && (
          <div className='card' style={{ marginBottom: 20, background: '#FEFCE8', borderColor: 'rgba(202,138,4,0.25)' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <Icon name='warning' style={{ color: 'var(--status-warn)', width: 18, height: 18 }} />
              <div style={{ flex: 1 }}>
                <strong>Demo data shown below.</strong>
                <span className='muted'> Connect GA4 above to pull real numbers from your property.</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {Object.entries(GA_OVERVIEW).map(([k, stat]) => <StatCard key={k} stat={stat} />)}
        </div>

        <div className='card' style={{ marginBottom: 20 }}>
          <div className='card-head'>
            <h3 className='card-title'>Users over time</h3>
            <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>Daily · last 22 days</div>
          </div>
          <div className='card-body'>
            <TrafficChart data={GA_TRAFFIC} />
          </div>
        </div>

        <div className='grid-2' style={{ marginBottom: 20 }}>
          <div className='card'>
            <div className='card-head'>
              <h3 className='card-title'>Top pages</h3>
              <button className='btn btn-sm btn-ghost'><Icon name='external' /></button>
            </div>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr><th>Page</th><th className='num'>Views</th><th className='num'>Users</th><th className='num'>Avg. time</th><th className='num'>Exit %</th></tr>
                </thead>
                <tbody>
                  {GA_TOP_PAGES.map(p => (
                    <tr key={p.path}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.title}</div>
                        <div className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{p.path}</div>
                      </td>
                      <td className='num mono'>{p.views.toLocaleString()}</td>
                      <td className='num mono'>{p.users.toLocaleString()}</td>
                      <td className='num mono'>{p.avgTime}</td>
                      <td className='num mono'>{p.exits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='card'>
            <div className='card-head'>
              <h3 className='card-title'>Traffic sources</h3>
              <button className='btn btn-sm btn-ghost'><Icon name='external' /></button>
            </div>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr><th>Source / medium</th><th></th><th className='num'>Users</th><th className='num'>Conv. rate</th></tr>
                </thead>
                <tbody>
                  {GA_SOURCES.map(s => (
                    <tr key={s.source}>
                      <td className='mono' style={{ fontSize: 12 }}>{s.source}</td>
                      <td><Bar pct={s.pct * 2.4} /></td>
                      <td className='num mono'>{s.users.toLocaleString()}</td>
                      <td className='num mono'>{s.conv}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className='card' style={{ marginBottom: 20 }}>
          <div className='card-head'>
            <h3 className='card-title'>Key conversions</h3>
            <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>Custom GA4 events configured for this site</div>
          </div>
          <div className='table-scroll'>
            <table>
              <thead>
                <tr><th>Event</th><th>Description</th><th className='num'>Count</th><th>Notes</th><th className='num'>Trend</th></tr>
              </thead>
              <tbody>
                {GA_CONVERSIONS.map(c => (
                  <tr key={c.event}>
                    <td className='mono' style={{ fontSize: 12 }}>{c.event}</td>
                    <td>{c.label}</td>
                    <td className='num mono' style={{ fontWeight: 600 }}>{c.count.toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{c.value}</td>
                    <td className='num'><span className='badge badge-success'>{c.trend}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='grid-2'>
          <div className='card'>
            <div className='card-head'><h3 className='card-title'>Top countries</h3></div>
            <div className='card-body' style={{ padding: 0 }}>
              <table>
                <tbody>
                  {GA_GEO.map(g => (
                    <tr key={g.country}>
                      <td style={{ width: 32, fontSize: 18 }}>{g.flag}</td>
                      <td>{g.country}</td>
                      <td><Bar pct={g.pct * 1.6} color='#7C3AED' /></td>
                      <td className='num mono'>{g.users.toLocaleString()}</td>
                      <td className='num mono' style={{ color: 'var(--fg-subtle)' }}>{g.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='card'>
            <div className='card-head'><h3 className='card-title'>Devices</h3></div>
            <div className='card-body'>
              {GA_DEVICES.map(d => (
                <div key={d.device} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>{d.device}</span>
                    <span className='mono'>{d.users.toLocaleString()} <span style={{ color: 'var(--fg-subtle)' }}>· {d.pct}%</span></span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: d.pct + '%', height: '100%', background: '#18181B', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--fg-subtle)' }}>
                <strong style={{ color: 'var(--fg)' }}>Mobile-first audience.</strong> 35% of visitors browse on phones — ensure the ROI calculator and memo request flow are tested at 375px width.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCodeSnippet && (
        <div className='overlay' onClick={() => setShowCodeSnippet(false)}>
          <div className='modal' onClick={e => e.stopPropagation()} style={{ width: 'min(640px, calc(100vw - 32px))' }}>
            <div className='modal-head'>
              <h3 className='modal-title'>Tracking code</h3>
              <p className='modal-desc'>This snippet is injected automatically when GA4 is connected. Shown here for reference or manual installation.</p>
            </div>
            <div className='modal-body'>
              <pre style={{ background: '#18181B', color: '#FAFAFA', padding: 16, borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-mono)', overflow: 'auto', margin: 0 }}>
{`<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.measurementId || 'G-XXXXXXXXXX'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${settings.measurementId || 'G-XXXXXXXXXX'}'${settings.anonymizeIp ? ", { anonymize_ip: true }" : ''});
</script>`}
              </pre>
            </div>
            <div className='modal-foot'>
              <button className='btn' onClick={() => setShowCodeSnippet(false)}>Close</button>
              <button className='btn btn-primary'><Icon name='copy' /> Copy snippet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
