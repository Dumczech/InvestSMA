'use client';

import { useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/market.jsx — LRM internal market data
// browser with period/source/status filters, 5 per-tab tables, and
// import + publish modals. Mock data for now; the real fetch hooks
// to market_monthly_performance / market_bedroom_performance / etc.
// once the import pipeline is populating those tables (TODO_SCHEMA).

type Tab = 'monthly' | 'bedroom' | 'hood' | 'channel' | 'season';

const TABS: Array<[Tab, string]> = [
  ['monthly', 'Monthly performance'],
  ['bedroom', 'By bedroom'],
  ['hood',    'By neighborhood'],
  ['channel', 'Channel mix'],
  ['season',  'Seasonality'],
];

function StatusBadge({ status }: { status: string }) {
  const kind =
    status === 'verified' || status === 'published' ? 'success' :
    status === 'review' || status === 'draft' ? 'warn' :
    status === 'rejected' ? 'danger' : 'outline';
  return <span className={`badge badge-${kind}`}>{status}</span>;
}

const MONTHLY: Array<[string, number, number, number, number, string]> = [
  ['Dec 2025', 1980, 71, 1406, 412, 'verified'],
  ['Nov 2025', 1820, 64, 1165, 386, 'verified'],
  ['Oct 2025', 2210, 68, 1503, 398, 'verified'],
  ['Sep 2025', 1740, 58, 1009, 354, 'verified'],
  ['Aug 2025', 1690, 55,  930, 341, 'verified'],
  ['Jul 2025', 1810, 60, 1086, 362, 'verified'],
  ['Jun 2025', 1640, 53,  869, 328, 'review'],
  ['May 2025', 1750, 57,  998, 345, 'verified'],
  ['Apr 2025', 1880, 62, 1166, 372, 'verified'],
  ['Mar 2025', 2090, 66, 1379, 389, 'verified'],
  ['Feb 2025', 2240, 72, 1613, 401, 'verified'],
  ['Jan 2025', 2080, 69, 1435, 392, 'verified'],
];

const BEDROOM: Array<[number, number, number, number, number]> = [
  [3, 1240, 58,  719, 18],
  [4, 1480, 60,  888, 24],
  [5, 1680, 62, 1042, 31],
  [6, 1980, 67, 1327, 28],
  [7, 2380, 69, 1642, 16],
  [8, 2880, 71, 2045,  9],
];

const HOOD: Array<[string, number, number, number, number, string]> = [
  ['Centro',      2140, 69, 1477, 42, 'verified'],
  ['Atascadero',  2320, 66, 1531, 28, 'review'],
  ['Guadiana',    1880, 63, 1184, 19, 'verified'],
  ['Los Frailes', 1620, 58,  940, 24, 'verified'],
  ['San Antonio', 1480, 55,  814, 16, 'verified'],
];

const CHANNEL: Array<[string, number, number, number, number, string]> = [
  ['Direct (LRM)',  412, 38, 5.2, 2180, 'verified'],
  ['Airbnb',        289, 27, 4.1, 1820, 'verified'],
  ['VRBO',          201, 19, 5.8, 1980, 'verified'],
  ['Booking.com',    98,  9, 3.6, 1740, 'verified'],
  ['Travel agents',  74,  7, 6.4, 2240, 'verified'],
];

const SEASON: Array<[string, number, number, number, string, string]> = [
  ['Q1 (Jan–Mar)', 2137, 69, 1474, '+12%', 'verified'],
  ['Q2 (Apr–Jun)', 1757, 57, 1001, '-24%', 'verified'],
  ['Q3 (Jul–Sep)', 1747, 58, 1008, '-23%', 'verified'],
  ['Q4 (Oct–Dec)', 2003, 68, 1358,  '+3%', 'verified'],
];

export default function Page() {
  const [period, setPeriod] = useState('2025-Q4');
  const [source, setSource] = useState('lrm');
  const [tab, setTab] = useState<Tab>('monthly');
  const [showImport, setShowImport] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  return (
    <div className='main'>
      <Topbar crumbs={['Market Data']}>
        <button className='btn btn-sm' onClick={() => setShowImport(true)}><Icon name='upload' /> Import CSV</button>
        <button className='btn btn-sm'><Icon name='plus' /> Manual entry</button>
        <button className='btn btn-sm btn-primary' onClick={() => setShowPublish(true)}><Icon name='check' /> Publish to site</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Market Data</h1>
            <p className='page-subtitle'>
              LRM internal performance data · Last imported Jan 21, 2026 from <span className='mono'>lrm_dec2025.csv</span>
            </p>
          </div>
        </div>

        <div className='card' style={{ marginBottom: 20, borderColor: 'rgba(202,138,4,0.3)', background: '#FEFCE8' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name='warning' style={{ color: 'var(--status-warn)', width: 18, height: 18 }} />
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>3 rows need review</strong>
              <span className='muted'> · Atascadero 8BR row missing channel mix · 2 occupancy values exceed 100%</span>
            </div>
            <button className='btn btn-sm'>Review</button>
          </div>
        </div>

        <div className='row gap-8' style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <div className='field' style={{ flex: '0 0 auto' }}>
            <label className='label' style={{ marginBottom: 4 }}>Period</label>
            <select className='select' style={{ width: 160 }} value={period} onChange={e => setPeriod(e.target.value)}>
              {['2025-Q4', '2025-Q3', '2025-Q2', '2025-Q1', '2024-Q4', '2024-Q3'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className='field' style={{ flex: '0 0 auto' }}>
            <label className='label' style={{ marginBottom: 4 }}>Source</label>
            <select className='select' style={{ width: 200 }} value={source} onChange={e => setSource(e.target.value)}>
              <option value='lrm'>LRM internal</option>
              <option value='airdna'>AirDNA benchmark</option>
              <option value='manual'>Manual entry</option>
              <option value='csv'>CSV import</option>
            </select>
          </div>
          <div className='field' style={{ flex: '0 0 auto' }}>
            <label className='label' style={{ marginBottom: 4 }}>Status</label>
            <select className='select' style={{ width: 160 }}>
              <option>All statuses</option>
              <option>Draft</option>
              <option>Verified</option>
              <option>Published</option>
              <option>Needs review</option>
            </select>
          </div>
        </div>

        <div className='tabs'>
          {TABS.map(([k, l]) => (
            <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
          ))}
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{period} · LRM internal · 24 rows</span>
            </div>
            <div className='right'>
              <button className='btn btn-sm btn-ghost'><Icon name='download' /> Export</button>
              <button className='btn btn-sm btn-ghost'><Icon name='edit' /> Bulk edit</button>
            </div>
          </div>
          <div className='table-scroll'>
            {tab === 'monthly' && (
              <table>
                <thead><tr><th>Month</th><th className='num'>ADR</th><th className='num'>Occupancy</th><th className='num'>RevPAR</th><th className='num'>RevPAN</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {MONTHLY.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td className='num mono'>${r[1]}</td>
                      <td className='num mono'>{r[2]}%</td>
                      <td className='num mono'>${r[3]}</td>
                      <td className='num mono'>{r[4]}</td>
                      <td><StatusBadge status={r[5]} /></td>
                      <td><button className='btn btn-icon btn-ghost btn-sm'><Icon name='edit' /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'bedroom' && (
              <table>
                <thead><tr><th>Bedrooms</th><th className='num'>ADR</th><th className='num'>Occupancy</th><th className='num'>RevPAR</th><th className='num'>Sample size</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {BEDROOM.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]} BR</td>
                      <td className='num mono'>${r[1]}</td>
                      <td className='num mono'>{r[2]}%</td>
                      <td className='num mono'>${r[3]}</td>
                      <td className='num mono'>{r[4]}</td>
                      <td><StatusBadge status='verified' /></td>
                      <td><button className='btn btn-icon btn-ghost btn-sm'><Icon name='edit' /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'hood' && (
              <table>
                <thead><tr><th>Neighborhood</th><th className='num'>ADR</th><th className='num'>Occupancy</th><th className='num'>RevPAR</th><th className='num'>Active units</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {HOOD.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td className='num mono'>${r[1]}</td>
                      <td className='num mono'>{r[2]}%</td>
                      <td className='num mono'>${r[3]}</td>
                      <td className='num mono'>{r[4]}</td>
                      <td><StatusBadge status={r[5]} /></td>
                      <td><button className='btn btn-icon btn-ghost btn-sm'><Icon name='edit' /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'channel' && (
              <table>
                <thead><tr><th>Channel</th><th className='num'>Bookings</th><th className='num'>Share</th><th className='num'>Avg LOS</th><th className='num'>Avg ADR</th><th>Status</th></tr></thead>
                <tbody>
                  {CHANNEL.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td className='num mono'>{r[1]}</td>
                      <td className='num mono'>{r[2]}%</td>
                      <td className='num mono'>{r[3]}</td>
                      <td className='num mono'>${r[4]}</td>
                      <td><StatusBadge status={r[5]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'season' && (
              <table>
                <thead><tr><th>Quarter</th><th className='num'>Avg ADR</th><th className='num'>Occupancy</th><th className='num'>RevPAR</th><th className='num'>vs annual</th><th>Status</th></tr></thead>
                <tbody>
                  {SEASON.map(r => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td className='num mono'>${r[1]}</td>
                      <td className='num mono'>{r[2]}%</td>
                      <td className='num mono'>${r[3]}</td>
                      <td className='num mono'>{r[4]}</td>
                      <td><StatusBadge status={r[5]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p className='muted' style={{ fontSize: 12, marginTop: 16 }}>
          Mock data · TODO_SCHEMA: query <code>market_monthly_performance</code> / <code>market_bedroom_performance</code> / <code>market_neighborhood_performance</code> / <code>market_channel_mix</code> / <code>market_seasonality</code>.
        </p>
      </div>

      {showImport && (
        <div className='overlay' onClick={() => setShowImport(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-head'>
              <h3 className='modal-title'>Import market data CSV</h3>
              <p className='modal-desc'>Drag a CSV file or paste URL. We&apos;ll validate columns before import.</p>
            </div>
            <div className='modal-body'>
              <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 12 }}>
                <Icon name='upload' style={{ width: 32, height: 32, color: 'var(--fg-subtle)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, marginBottom: 4 }}>Drop CSV here or browse</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Required columns: month, neighborhood, bedrooms, adr, occupancy, revpar</div>
              </div>
              <label className='row gap-8' style={{ fontSize: 13 }}>
                <input type='checkbox' defaultChecked /> Replace existing rows for this period (otherwise merge)
              </label>
            </div>
            <div className='modal-foot'>
              <button className='btn' onClick={() => setShowImport(false)}>Cancel</button>
              <button className='btn btn-primary' disabled title='Use the CSV Import wizard for actual upload'>
                <Icon name='upload' /> Validate &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}

      {showPublish && (
        <div className='overlay' onClick={() => setShowPublish(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-head'>
              <h3 className='modal-title'>Publish market data to public site?</h3>
              <p className='modal-desc'>The Market Data dashboard on investsma.com will update with these figures within 60 seconds.</p>
            </div>
            <div className='modal-body'>
              <div className='col gap-8' style={{ fontSize: 13 }}>
                <div className='stat-row'><span className='k'>Period</span><span className='v'>{period}</span></div>
                <div className='stat-row'><span className='k'>Source</span><span className='v'>LRM internal</span></div>
                <div className='stat-row'><span className='k'>Rows</span><span className='v'>24 (3 with warnings)</span></div>
                <div className='stat-row'><span className='k'>Visible to</span><span className='v'>Public + gated reports</span></div>
              </div>
            </div>
            <div className='modal-foot'>
              <button className='btn' onClick={() => setShowPublish(false)}>Cancel</button>
              <button className='btn btn-primary' disabled title='Publish flow requires the publish-batch endpoint to be wired through to public surfaces'>
                <Icon name='check' /> Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
