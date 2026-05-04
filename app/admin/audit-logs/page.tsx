'use client';

import { useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/airdna.jsx — AirDNA market benchmark
// browser. The nav route is /admin/audit-logs but the page is "AirDNA
// Benchmarks" per the AdminShell sidebar label and design intent.
// Mock data for now; once the airdna_benchmark_data table is populated
// via the import wizard, swap fetches in (TODO_SCHEMA).

const PERIODS = ['2025-Q4', '2025-Q3', '2025-Q2', '2025-Q1'];

const KPI_ROWS: Array<[string, string, string, string]> = [
  ['Avg ADR',                 '$1,980',  '$1,520',  '130'],
  ['Occupancy',               '71%',     '58%',     '122'],
  ['RevPAR',                  '$1,406',  '$881',    '160'],
  ['Supply (units)',          '158',     '1,247',   '13%'],
  ['Demand (booked nights)',  '40,890',  '280,402', '15%'],
];

const HISTORY: Array<[string, string, string, string, number, string]> = [
  ['airdna_sma_q4_2025.csv', 'AirDNA Pro', 'Jan 18, 2026', 'Justin', 1247, 'imported'],
  ['airdna_sma_q3_2025.csv', 'AirDNA Pro', 'Oct 14, 2025', 'Justin', 1198, 'imported'],
  ['airdna_sma_q2_2025.csv', 'AirDNA Pro', 'Jul 12, 2025', 'Maria',  1156, 'imported'],
  ['airdna_partial.csv',     'Manual',     'Jul 02, 2025', 'Justin', 12,   'review'],
  ['airdna_sma_q1_2025.csv', 'AirDNA Pro', 'Apr 15, 2025', 'Justin', 1102, 'imported'],
];

const NEIGHBORHOODS: Array<[string, number, number, number, number, number, string]> = [
  ['Centro',      1740, 62, 1079, 412, 76548, 'imported'],
  ['Atascadero',  1820, 58, 1056, 289, 50012, 'review'],
  ['Guadiana',    1480, 59,  873, 198, 42528, 'imported'],
  ['Los Frailes', 1340, 55,  737, 178, 35624, 'imported'],
  ['San Antonio', 1180, 52,  614, 170, 32156, 'imported'],
];

function StatusBadge({ status }: { status: string }) {
  const kind =
    status === 'imported' || status === 'published' || status === 'verified' ? 'success' :
    status === 'review' || status === 'draft' ? 'warn' :
    status === 'rejected' || status === 'error' ? 'danger' : 'outline';
  return <span className={`badge badge-${kind}`}>{status}</span>;
}

export default function Page() {
  const [period, setPeriod] = useState('2025-Q4');
  const [showImport, setShowImport] = useState(false);

  return (
    <div className='main'>
      <Topbar crumbs={['AirDNA Benchmarks']}>
        <button className='btn btn-sm' onClick={() => setShowImport(true)}>
          <Icon name='upload' /> Import AirDNA CSV
        </button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>AirDNA Benchmarks</h1>
            <p className='page-subtitle'>External market data — kept separate from LRM internal performance</p>
          </div>
        </div>

        <div className='card' style={{ marginBottom: 20, background: '#EFF6FF', borderColor: 'rgba(37,99,235,0.2)' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <Icon name='info' style={{ color: '#2563EB', width: 18, height: 18 }} />
            <div style={{ flex: 1 }}>
              <strong>You are viewing AirDNA market data.</strong>
              <span className='muted'> Edits here will not affect LRM internal performance figures.</span>
            </div>
          </div>
        </div>

        <div className='row gap-8' style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <select className='select' style={{ width: 160 }} value={period} onChange={e => setPeriod(e.target.value)}>
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className='select' style={{ width: 220 }}>
            <option>All neighborhoods</option>
            {NEIGHBORHOODS.map(n => <option key={n[0]}>{n[0]}</option>)}
          </select>
        </div>

        <div className='grid-2' style={{ marginBottom: 20 }}>
          <div className='card'>
            <div className='card-head'><h3 className='card-title'>LRM vs Market — {period}</h3></div>
            <div className='card-body'>
              <div className='table-scroll'>
                <table>
                  <thead>
                    <tr><th>Metric</th><th className='num'>LRM</th><th className='num'>Market</th><th className='num'>Index</th></tr>
                  </thead>
                  <tbody>
                    {KPI_ROWS.map(r => {
                      const idxNum = parseInt(r[3], 10);
                      return (
                        <tr key={r[0]}>
                          <td>{r[0]}</td>
                          <td className='num mono'>{r[1]}</td>
                          <td className='num mono'>{r[2]}</td>
                          <td className='num mono'>
                            <span className={`badge badge-${idxNum > 100 ? 'success' : 'outline'}`}>{r[3]}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className='card'>
            <div className='card-head'>
              <h3 className='card-title'>Import history</h3>
              <button className='btn btn-sm btn-ghost' title='Export'><Icon name='download' /></button>
            </div>
            <div className='table-scroll'>
              <table>
                <thead><tr><th>File</th><th>Source</th><th>Date</th><th>By</th><th className='num'>Rows</th><th>Status</th></tr></thead>
                <tbody>
                  {HISTORY.map(r => (
                    <tr key={r[0]}>
                      <td className='mono' style={{ fontSize: 11 }}>{r[0]}</td>
                      <td style={{ fontSize: 12 }}>{r[1]}</td>
                      <td className='mono' style={{ fontSize: 11 }}>{r[2]}</td>
                      <td style={{ fontSize: 12 }}>{r[3]}</td>
                      <td className='num mono'>{r[4].toLocaleString()}</td>
                      <td><StatusBadge status={r[5]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Market data by neighborhood — {period}</span>
            </div>
            <div className='right'>
              <button className='btn btn-sm btn-ghost'><Icon name='download' /> Export</button>
            </div>
          </div>
          <div className='table-scroll'>
            <table>
              <thead>
                <tr>
                  <th>Neighborhood</th>
                  <th className='num'>Market ADR</th>
                  <th className='num'>Market occupancy</th>
                  <th className='num'>Market RevPAR</th>
                  <th className='num'>Supply</th>
                  <th className='num'>Demand</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {NEIGHBORHOODS.map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className='num mono'>${r[1]}</td>
                    <td className='num mono'>{r[2]}%</td>
                    <td className='num mono'>${r[3]}</td>
                    <td className='num mono'>{r[4]}</td>
                    <td className='num mono'>{r[5].toLocaleString()}</td>
                    <td><StatusBadge status={r[6]} /></td>
                    <td><button className='btn btn-icon btn-ghost btn-sm'><Icon name='edit' /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className='muted' style={{ fontSize: 12, marginTop: 16 }}>
          Mock data · TODO_SCHEMA: query <code>airdna_benchmark_data</code> + <code>import_jobs</code> when populated.
        </p>
      </div>

      {showImport && (
        <div className='overlay' onClick={() => setShowImport(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-head'>
              <h3 className='modal-title'>Import AirDNA CSV</h3>
              <p className='modal-desc'>This will replace existing AirDNA data for the selected period. LRM internal data is not affected.</p>
            </div>
            <div className='modal-body'>
              <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: 28, textAlign: 'center' }}>
                <Icon name='upload' style={{ width: 28, height: 28, color: 'var(--fg-subtle)', marginBottom: 6 }} />
                <div style={{ fontSize: 13 }}>Drop AirDNA export CSV</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 4 }}>Or use the CSV Import wizard for the full validation flow</div>
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
