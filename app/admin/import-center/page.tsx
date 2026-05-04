'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/import.jsx — 5-step wizard
// (Upload → Map → Validate → Fix → Publish) with the recent-imports
// table below. The Upload + Publish steps wire to the existing
// /api/admin/import-csv endpoint; the Map / Validate / Fix steps
// are interactive UI on top of mock auto-detection + mock validation
// results until the API exposes the corresponding pipeline data
// (TODO_API_VALIDATION).

const STEPS = [
  { id: 'upload',   label: 'Upload',       n: 1 },
  { id: 'map',      label: 'Map columns',  n: 2 },
  { id: 'validate', label: 'Validate',     n: 3 },
  { id: 'fix',      label: 'Fix issues',   n: 4 },
  { id: 'publish',  label: 'Publish',      n: 5 },
] as const;
type StepId = typeof STEPS[number]['id'];

const SOURCES = [
  { id: 'airdna',  label: 'AirDNA Market Panel',  desc: 'External STR market benchmarks',         table: 'airdna_benchmark_data' },
  { id: 'lrm-pms', label: 'LRM PMS Export',       desc: 'Internal occupancy + ADR per property',  table: 'market_monthly_performance' },
  { id: 'comps',   label: 'Transaction Comps',    desc: 'MLS / broker-sourced sale comps',        table: 'sale_comps' },
  { id: 'inegi',   label: 'INEGI Macro',          desc: 'Mexican demographic / economic series',  table: 'macro_series' },
] as const;
type SourceId = typeof SOURCES[number]['id'];

const TARGET_SCHEMAS: Record<string, Array<{ field: string; type: string; required: boolean; sample: string }>> = {
  airdna_benchmark_data: [
    { field: 'period',          type: 'YYYY-Qn',    required: true,  sample: '2026-Q1' },
    { field: 'neighborhood',    type: 'string',     required: true,  sample: 'Centro Histórico' },
    { field: 'bedrooms',        type: 'int 1–8',    required: true,  sample: '3' },
    { field: 'avg_adr_usd',     type: 'currency',   required: true,  sample: '418.00' },
    { field: 'occupancy_pct',   type: 'pct 0–100',  required: true,  sample: '68.2' },
    { field: 'revpar_usd',      type: 'currency',   required: true,  sample: '285.00' },
    { field: 'avg_los_nights',  type: 'float',      required: false, sample: '4.1' },
    { field: 'active_listings', type: 'int',        required: true,  sample: '247' },
    { field: 'demand_index',    type: 'float',      required: false, sample: '112.4' },
    { field: 'comp_qoq_pct',    type: 'pct -100–100', required: false, sample: '+3.1' },
  ],
  market_monthly_performance: [
    { field: 'period',     type: 'YYYY',       required: true,  sample: '2026' },
    { field: 'month',      type: 'int 1–12',   required: true,  sample: '4' },
    { field: 'year',       type: 'int',        required: true,  sample: '2026' },
    { field: 'lrm_occupancy', type: 'pct',     required: true,  sample: '68' },
    { field: 'lrm_adr',    type: 'currency',   required: true,  sample: '520' },
    { field: 'lrm_revpar', type: 'currency',   required: false, sample: '354' },
  ],
  sale_comps: [
    { field: 'closed_date',    type: 'YYYY-MM-DD', required: true,  sample: '2026-02-14' },
    { field: 'address',        type: 'string',     required: true,  sample: 'Calle Hidalgo 42' },
    { field: 'neighborhood',   type: 'string',     required: true,  sample: 'Centro Histórico' },
    { field: 'sale_price_usd', type: 'currency',   required: true,  sample: '1850000.00' },
    { field: 'bedrooms',       type: 'int',        required: true,  sample: '4' },
    { field: 'sqm',            type: 'int',        required: true,  sample: '380' },
  ],
  macro_series: [
    { field: 'series_id', type: 'string', required: true, sample: 'INPC_NACIONAL' },
    { field: 'period',    type: 'YYYY-MM', required: true, sample: '2026-03' },
    { field: 'value',     type: 'float',  required: true, sample: '128.42' },
  ],
};

const MOCK_RAW_HEADERS = [
  'qtr', 'area_name', 'beds', 'avg_daily_rate', 'occ_rate', 'revpar', 'los', 'supply', 'demand_idx', 'qoq_change', 'notes',
];
const MOCK_SAMPLE_ROW = ['2026-Q1', 'Centro Histórico', '3', '$418.00', '0.682', '$285.08', '4.1', '127', '112.4', '+3.1%', ''];

const AUTO_MAP_AIRDNA: Record<string, string> = {
  qtr: 'period',
  area_name: 'neighborhood',
  beds: 'bedrooms',
  avg_daily_rate: 'avg_adr_usd',
  occ_rate: 'occupancy_pct',
  revpar: 'revpar_usd',
  los: 'avg_los_nights',
  supply: 'active_listings',
  demand_idx: 'demand_index',
  qoq_change: 'comp_qoq_pct',
  notes: '__skip__',
};

const VALIDATION_RESULTS: Array<{ row: number; col: string; value: string; rule: string; severity: 'error' | 'warning' | 'info' }> = [
  { row: 12, col: 'avg_adr_usd',   value: 'N/A',     rule: 'Required field cannot be null',                                  severity: 'error'   },
  { row: 12, col: 'revpar_usd',    value: '#REF!',   rule: 'Invalid currency format',                                        severity: 'error'   },
  { row: 15, col: 'neighborhood',  value: '(empty)', rule: 'Required field cannot be empty',                                 severity: 'error'   },
  { row: 13, col: 'avg_adr_usd',   value: '$324',    rule: 'Currency missing decimals — auto-normalized to $324.00',         severity: 'warning' },
  { row: 14, col: 'comp_qoq_pct',  value: '(empty)', rule: 'Optional field — left null',                                     severity: 'info'    },
  { row: 8,  col: 'occupancy_pct', value: '0.658',   rule: 'Detected as decimal — auto-converted to 65.8%',                  severity: 'warning' },
];

const FIXABLE = [
  { row: 12, col: 'avg_adr_usd',  original: 'N/A',     suggestion: '$285.00',         reason: 'Median for Allende · 2BD' },
  { row: 12, col: 'revpar_usd',   original: '#REF!',   suggestion: '$168.15',         reason: 'Auto-compute from ADR × occ' },
  { row: 15, col: 'neighborhood', original: '(empty)', suggestion: 'Centro Histórico', reason: 'Inferred from prior rows' },
];

// Mock recent-imports list. TODO_SCHEMA: import_jobs query.
const HISTORY = [
  { file: 'airdna_sma_q4_2025.csv',  source: 'AirDNA',   user: 'Justin', date: '2026-01-18 09:14', rows: 1247, errors: 0, status: 'published' },
  { file: 'lrm_pms_q4_export.csv',   source: 'LRM PMS',  user: 'Maria',  date: '2026-01-15 16:32', rows: 312,  errors: 0, status: 'published' },
  { file: 'airdna_sma_q3_2025.csv',  source: 'AirDNA',   user: 'Justin', date: '2025-10-14 11:08', rows: 1198, errors: 2, status: 'published' },
  { file: 'sale_comps_jan26.csv',    source: 'Manual',   user: 'Justin', date: '2026-02-04 14:22', rows: 18,   errors: 1, status: 'published' },
  { file: 'airdna_partial.csv',      source: 'AirDNA',   user: 'Justin', date: '2025-07-02 10:45', rows: 12,   errors: 8, status: 'rejected' },
];

// ---------------------------------------------------------------------------

export default function Page() {
  const [stepIdx, setStepIdx] = useState(0);
  const [source, setSource] = useState<SourceId>('airdna');
  const [period, setPeriod] = useState('2026-Q1');
  const [file, setFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string; rows: number } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>(AUTO_MAP_AIRDNA);
  const [fixActions, setFixActions] = useState<Record<number, 'apply' | 'drop'>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<{ batchId?: string; valid?: number; errors?: number } | null>(null);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const sourceMeta = SOURCES.find(s => s.id === source)!;

  const restart = () => {
    setStepIdx(0);
    setFile(null);
    setFileMeta(null);
    setMapping(AUTO_MAP_AIRDNA);
    setFixActions({});
    setConfirmed(false);
    setPublished(null);
    setToast(null);
  };

  const goPublish = async () => {
    if (!file) {
      setToast({ tone: 'err', msg: 'No file uploaded.' });
      return;
    }
    setBusy(true); setToast(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      fd.set('table', sourceMeta.table);
      fd.set('sourceType', source);
      const r = await fetch('/api/admin/import-csv', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Import failed');
      setPublished({ batchId: j.batchId, valid: j.valid, errors: j.errors });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Data', 'CSV Import']}>
        <button className='btn btn-sm btn-ghost' onClick={restart}>
          <Icon name='refresh' /> Restart
        </button>
        <button className='btn btn-sm'><Icon name='download' /> Download templates</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>CSV Import</h1>
            <p className='page-subtitle'>Upload market &amp; performance data — validates against schema before publishing</p>
          </div>
          <div className='row gap-8'>
            <span className='badge badge-info'>{sourceMeta.label}</span>
          </div>
        </div>

        <Stepper stepIdx={stepIdx} onStep={setStepIdx} />

        <div style={{ marginTop: 24 }}>
          {stepIdx === 0 && (
            <UploadStep
              source={source}
              setSource={setSource}
              period={period}
              setPeriod={setPeriod}
              file={file}
              setFile={(f, meta) => { setFile(f); setFileMeta(meta); }}
              fileMeta={fileMeta}
              onNext={() => setStepIdx(1)}
            />
          )}
          {stepIdx === 1 && (
            <MapStep
              source={source}
              mapping={mapping}
              setMapping={setMapping}
              onBack={() => setStepIdx(0)}
              onNext={() => setStepIdx(2)}
            />
          )}
          {stepIdx === 2 && (
            <ValidateStep
              onBack={() => setStepIdx(1)}
              onNext={() => setStepIdx(3)}
            />
          )}
          {stepIdx === 3 && (
            <FixStep
              actions={fixActions}
              setActions={setFixActions}
              onBack={() => setStepIdx(2)}
              onNext={() => setStepIdx(4)}
            />
          )}
          {stepIdx === 4 && (
            <PublishStep
              source={source}
              period={period}
              fileMeta={fileMeta}
              fixActions={fixActions}
              confirmed={confirmed}
              setConfirmed={setConfirmed}
              busy={busy}
              published={published}
              onBack={() => setStepIdx(3)}
              onPublish={goPublish}
              onDone={restart}
            />
          )}
        </div>

        {toast && (
          <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
            {toast.msg}
          </div>
        )}

        {/* Recent imports */}
        <div className='card' style={{ marginTop: 32 }}>
          <div className='card-head'>
            <h3 className='card-title'>Recent imports</h3>
            <span className='muted' style={{ fontSize: 12 }}>Last 30 days · {HISTORY.length} runs · TODO_SCHEMA: query import_jobs</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Source</th>
                <th>Imported by</th>
                <th>Date</th>
                <th className='num'>Rows</th>
                <th className='num'>Errors</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i}>
                  <td className='mono' style={{ fontSize: 12 }}>{h.file}</td>
                  <td>{h.source}</td>
                  <td>{h.user}</td>
                  <td className='mono' style={{ fontSize: 11 }}>{h.date}</td>
                  <td className='num mono'>{h.rows.toLocaleString()}</td>
                  <td className='num mono'>
                    <span className={`badge badge-${h.errors === 0 ? 'success' : h.errors > 5 ? 'danger' : 'warn'}`}>{h.errors}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${h.status === 'published' ? 'success' : 'danger'}`}>{h.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className='btn btn-sm btn-ghost' title='View'><Icon name='eye' /></button>
                    <button className='btn btn-sm btn-ghost' title='Re-run'><Icon name='refresh' /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============== STEPPER ==============

function Stepper({ stepIdx, onStep }: { stepIdx: number; onStep: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
      {STEPS.map((s, i) => {
        const done = i < stepIdx, active = i === stepIdx;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <button
              onClick={() => i <= stepIdx && onStep(i)}
              disabled={i > stepIdx}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px',
                background: 'transparent', border: 'none',
                cursor: i <= stepIdx ? 'pointer' : 'default',
                opacity: i <= stepIdx ? 1 : 0.5,
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'var(--status-success)' : active ? 'var(--fg)' : 'var(--bg-subtle)',
                color: done || active ? '#fff' : 'var(--fg-muted)',
                border: '1px solid ' + (active || done ? 'transparent' : 'var(--border)'),
                display: 'grid', placeItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600,
              }}>{done ? '✓' : s.n}</span>
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--fg)' : 'var(--fg-muted)' }}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < stepIdx ? 'var(--status-success)' : 'var(--border)', margin: '0 16px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============== STEP 1: UPLOAD ==============

function UploadStep({
  source, setSource, period, setPeriod, file, setFile, fileMeta, onNext,
}: {
  source: SourceId;
  setSource: (s: SourceId) => void;
  period: string;
  setPeriod: (s: string) => void;
  file: File | null;
  setFile: (f: File | null, meta: { name: string; size: string; rows: number } | null) => void;
  fileMeta: { name: string; size: string; rows: number } | null;
  onNext: () => void;
}) {
  const [drag, setDrag] = useState(false);

  const handleFile = async (f: File | null) => {
    if (!f) { setFile(null, null); return; }
    const sizeKb = (f.size / 1024).toFixed(0);
    const text = await f.text().catch(() => '');
    const rows = text ? text.split('\n').filter(Boolean).length : 0;
    setFile(f, { name: f.name, size: `${sizeKb} KB`, rows });
  };

  return (
    <div className='grid-2' style={{ gap: 24 }}>
      <div className='card'>
        <div className='card-head'><h3 className='card-title'>1 · Choose source</h3></div>
        <div className='card-body' style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SOURCES.map(s => (
            <label
              key={s.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                border: '1px solid ' + (source === s.id ? 'var(--fg)' : 'var(--border)'),
                borderRadius: 6, cursor: 'pointer',
                background: source === s.id ? 'var(--bg-subtle)' : 'var(--surface)',
              }}
            >
              <input type='radio' checked={source === s.id} onChange={() => setSource(s.id)} style={{ marginTop: 3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                <div className='muted' style={{ fontSize: 12, marginTop: 2 }}>{s.desc}</div>
                <div className='mono' style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 4, letterSpacing: '0.05em' }}>→ {s.table}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className='card'>
        <div className='card-head'>
          <h3 className='card-title'>2 · Upload file</h3>
        </div>
        <div className='card-body'>
          <div style={{ marginBottom: 16 }}>
            <label className='label'>Reporting period</label>
            <input className='input' value={period} onChange={e => setPeriod(e.target.value)} placeholder='2026-Q1' />
          </div>

          {!file ? (
            <label
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              style={{
                border: '2px dashed ' + (drag ? 'var(--fg)' : 'var(--border-strong)'),
                borderRadius: 8, padding: '48px 24px', textAlign: 'center',
                background: drag ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer',
                display: 'block',
              }}
            >
              <input type='file' accept='.csv,text/csv' style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
              <Icon name='upload' style={{ width: 32, height: 32, opacity: 0.5, marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: 15 }}>Drop CSV here or click to browse</div>
              <div className='muted' style={{ fontSize: 12, marginTop: 6 }}>Max 25 MB · CSV with header row · UTF-8</div>
            </label>
          ) : (
            <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                  <Icon name='file' />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{fileMeta?.name ?? file.name}</div>
                  <div className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                    {fileMeta?.size ?? `${(file.size / 1024).toFixed(0)} KB`} · {fileMeta?.rows ?? '?'} rows
                  </div>
                </div>
                <button className='btn btn-sm btn-ghost' onClick={() => handleFile(null)}><Icon name='close' /></button>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, fontSize: 12, color: '#166534' }}>
                <Icon name='check' style={{ width: 14, height: 14, verticalAlign: -2, marginRight: 6 }} />
                File loaded — header row will be detected at publish time
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className='btn btn-primary' disabled={!file} onClick={onNext}>Continue → Map columns</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== STEP 2: MAP ==============

function MapStep({
  source, mapping, setMapping, onBack, onNext,
}: {
  source: SourceId;
  mapping: Record<string, string>;
  setMapping: (m: Record<string, string>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const target = SOURCES.find(s => s.id === source)!.table;
  const schema = TARGET_SCHEMAS[target] ?? TARGET_SCHEMAS.airdna_benchmark_data;
  const mapped = MOCK_RAW_HEADERS.filter(h => mapping[h] && mapping[h] !== '__skip__').length;
  const requiredFields = schema.filter(s => s.required);
  const requiredMapped = requiredFields.filter(s => Object.values(mapping).includes(s.field)).length;

  return (
    <div>
      <div className='card' style={{ marginBottom: 16 }}>
        <div className='card-head'>
          <div>
            <h3 className='card-title'>Map source columns → target fields</h3>
            <p className='card-subtitle'>
              {mapped} of {MOCK_RAW_HEADERS.length} columns mapped · {requiredMapped} of {requiredFields.length} required fields covered
            </p>
          </div>
          <button className='btn btn-sm btn-ghost' onClick={() => setMapping(AUTO_MAP_AIRDNA)}>
            <Icon name='refresh' /> Auto-detect again
          </button>
        </div>
        <div className='table-scroll'>
          <table>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Source column</th>
                <th style={{ width: '25%' }}>Sample value</th>
                <th style={{ width: 40 }} />
                <th style={{ width: '25%' }}>Target field</th>
                <th>Type / format</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RAW_HEADERS.map((h, i) => {
                const targetField = mapping[h];
                const targetMeta = schema.find(s => s.field === targetField);
                const skipped = targetField === '__skip__';
                return (
                  <tr key={h} style={{ opacity: skipped ? 0.5 : 1 }}>
                    <td className='mono' style={{ fontSize: 12 }}>{h}</td>
                    <td className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{MOCK_SAMPLE_ROW[i]}</td>
                    <td style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>→</td>
                    <td>
                      <select
                        className='select'
                        style={{ width: '100%' }}
                        value={targetField || '__skip__'}
                        onChange={e => setMapping({ ...mapping, [h]: e.target.value })}
                      >
                        <option value='__skip__'>— skip —</option>
                        {schema.map(s => (
                          <option key={s.field} value={s.field}>{s.field}{s.required ? ' *' : ''}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {targetMeta ? (
                        <span className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{targetMeta.type} · e.g. {targetMeta.sample}</span>
                      ) : (
                        <span className='muted' style={{ fontSize: 12 }}>not imported</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
          <div className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 8 }}>UNMAPPED REQUIRED FIELDS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {requiredFields.filter(s => !Object.values(mapping).includes(s.field)).length === 0 ? (
              <span className='badge badge-success'>All required fields covered ✓</span>
            ) : (
              requiredFields.filter(s => !Object.values(mapping).includes(s.field)).map(s => (
                <span key={s.field} className='badge badge-warn'>{s.field}</span>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='btn' onClick={onBack}>← Back</button>
        <button className='btn btn-primary' onClick={onNext} disabled={requiredMapped < requiredFields.length}>
          Continue → Validate
        </button>
      </div>
    </div>
  );
}

// ============== STEP 3: VALIDATE ==============

function ValidateStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const errors = VALIDATION_RESULTS.filter(r => r.severity === 'error').length;
  const warnings = VALIDATION_RESULTS.filter(r => r.severity === 'warning').length;
  const infos = VALIDATION_RESULTS.filter(r => r.severity === 'info').length;
  const totalRows = 15;
  const validRows = totalRows - new Set(VALIDATION_RESULTS.filter(r => r.severity === 'error').map(r => r.row)).size;

  return (
    <div>
      <div className='grid-3' style={{ gap: 16, marginBottom: 16 }}>
        <SummaryCard label='Rows validated'  value={totalRows}            sub='from uploaded CSV' />
        <SummaryCard label='Will publish'    value={validRows}            sub={`${Math.round(validRows / totalRows * 100)}% pass · clean rows`} kind='success' />
        <SummaryCard label='Need attention'  value={errors + warnings}    sub={`${errors} errors · ${warnings} warnings`} kind={errors > 0 ? 'danger' : 'warn'} />
      </div>

      <div className='card' style={{ marginBottom: 16 }}>
        <div className='card-head'>
          <h3 className='card-title'>Validation results <span className='card-subtitle'>· mock until /api/admin/import-csv returns row-level results</span></h3>
          <div className='row gap-8'>
            <span className='badge badge-danger'>{errors} errors</span>
            <span className='badge badge-warn'>{warnings} warnings</span>
            <span className='badge badge-info'>{infos} info</span>
          </div>
        </div>
        <div className='table-scroll'>
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Row</th>
                <th style={{ width: 160 }}>Column</th>
                <th style={{ width: 120 }}>Value</th>
                <th>Rule</th>
                <th style={{ width: 100 }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {VALIDATION_RESULTS.map((r, i) => (
                <tr key={i}>
                  <td className='mono'>#{r.row}</td>
                  <td className='mono' style={{ fontSize: 12 }}>{r.col}</td>
                  <td className='mono' style={{ fontSize: 12, color: r.severity === 'error' ? 'var(--status-danger)' : 'var(--fg-muted)' }}>{r.value}</td>
                  <td style={{ fontSize: 13 }}>{r.rule}</td>
                  <td><span className={`badge badge-${r.severity === 'error' ? 'danger' : r.severity === 'warning' ? 'warn' : 'info'}`}>{r.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='btn' onClick={onBack}>← Back</button>
        <div className='row gap-8'>
          {errors > 0 && <span className='badge badge-danger'>Fix {errors} error{errors !== 1 ? 's' : ''} before publishing</span>}
          <button className='btn btn-primary' onClick={onNext}>{errors > 0 ? 'Fix issues' : 'Continue → Publish'} →</button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, sub, kind,
}: {
  label: string;
  value: number;
  sub: string;
  kind?: 'success' | 'warn' | 'danger';
}) {
  const colors = {
    success: { bg: '#F0FDF4', bd: 'rgba(34,197,94,0.25)', fg: '#166534' },
    warn:    { bg: '#FEFCE8', bd: 'rgba(234,179,8,0.3)',  fg: '#854D0E' },
    danger:  { bg: '#FEF2F2', bd: 'rgba(239,68,68,0.25)', fg: '#991B1B' },
  } as const;
  const c = kind ? colors[kind] : null;
  return (
    <div className='card' style={c ? { background: c.bg, borderColor: c.bd } : undefined}>
      <div className='card-body'>
        <div className='data-label' style={c ? { color: c.fg } : undefined}>{label}</div>
        <div className='display tnum' style={{ fontSize: 36, marginTop: 6, color: c ? c.fg : 'var(--fg)' }}>{value}</div>
        <div className='muted' style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

// ============== STEP 4: FIX ==============

function FixStep({
  actions, setActions, onBack, onNext,
}: {
  actions: Record<number, 'apply' | 'drop'>;
  setActions: (a: Record<number, 'apply' | 'drop'>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const setAction = (i: number, a: 'apply' | 'drop') => setActions({ ...actions, [i]: a });
  const allHandled = FIXABLE.every((_, i) => actions[i]);
  const dropped = Object.values(actions).filter(a => a === 'drop').length;
  const fixed = Object.values(actions).filter(a => a === 'apply').length;

  return (
    <div>
      <div className='card' style={{ marginBottom: 16 }}>
        <div className='card-head'>
          <div>
            <h3 className='card-title'>Resolve {FIXABLE.length} blocking errors</h3>
            <p className='card-subtitle'>Apply suggestion, edit manually, or drop the row · mock data</p>
          </div>
          <div className='row gap-8'>
            <span className='badge badge-success'>{fixed} fixed</span>
            <span className='badge badge-outline'>{dropped} dropped</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FIXABLE.map((f, i) => {
            const action = actions[i];
            return (
              <div
                key={i}
                style={{
                  padding: 16,
                  borderBottom: i < FIXABLE.length - 1 ? '1px solid var(--border)' : 'none',
                  background: action === 'apply' ? '#F0FDF4' : action === 'drop' ? '#FEF2F2' : 'var(--surface)',
                }}
              >
                <div className='fix-row'>
                  <div>
                    <div className='data-label'>Row</div>
                    <div className='mono' style={{ fontSize: 16, fontWeight: 600 }}>#{f.row}</div>
                  </div>
                  <div>
                    <div className='data-label'>{f.col}</div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, flexWrap: 'wrap' }}>
                      <span className='mono' style={{ color: 'var(--status-danger)', textDecoration: 'line-through' }}>{f.original}</span>
                      <span style={{ color: 'var(--fg-muted)' }}>→</span>
                      <span className='mono' style={{ fontWeight: 600, color: 'var(--status-success)' }}>{f.suggestion}</span>
                    </div>
                    <div className='muted' style={{ fontSize: 11, marginTop: 4 }}>{f.reason}</div>
                  </div>
                  <div>
                    <div className='data-label'>Custom value</div>
                    <input className='input' placeholder='Override suggestion…' defaultValue={f.suggestion} disabled={action === 'drop'} style={{ marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={'btn btn-sm' + (action === 'apply' ? ' btn-primary' : '')} onClick={() => setAction(i, 'apply')}>
                      <Icon name='check' /> Apply fix
                    </button>
                    <button className={'btn btn-sm' + (action === 'drop' ? ' btn-danger' : '')} onClick={() => setAction(i, 'drop')}>
                      <Icon name='trash' /> Drop row
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='btn' onClick={onBack}>← Back</button>
        <button className='btn btn-primary' onClick={onNext} disabled={!allHandled}>Continue → Publish →</button>
      </div>
    </div>
  );
}

// ============== STEP 5: PUBLISH ==============

function PublishStep({
  source, period, fileMeta, fixActions, confirmed, setConfirmed, busy, published, onBack, onPublish, onDone,
}: {
  source: SourceId;
  period: string;
  fileMeta: { name: string; size: string; rows: number } | null;
  fixActions: Record<number, 'apply' | 'drop'>;
  confirmed: boolean;
  setConfirmed: (b: boolean) => void;
  busy: boolean;
  published: { batchId?: string; valid?: number; errors?: number } | null;
  onBack: () => void;
  onPublish: () => void;
  onDone: () => void;
}) {
  const sourceMeta = SOURCES.find(s => s.id === source)!;
  const dropped = Object.values(fixActions).filter(a => a === 'drop').length;
  const willPublish = useMemo(() => Math.max(0, (fileMeta?.rows ?? 15) - dropped - 2), [fileMeta, dropped]);

  if (published) {
    return (
      <div className='card' style={{ background: '#F0FDF4', borderColor: 'rgba(34,197,94,0.3)' }}>
        <div className='card-body' style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-success)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Icon name='check' style={{ color: '#fff', width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: 24, margin: 0 }}>Published successfully</h2>
          <p className='muted' style={{ marginTop: 8, fontSize: 14 }}>
            {published.valid ?? willPublish} rows imported into{' '}
            <span className='mono'>{sourceMeta.table}</span>
            {published.errors != null && published.errors > 0 ? <> · {published.errors} errors</> : null}
            {published.batchId ? <> · batch <span className='mono'>{published.batchId}</span></> : null}
            {' · period '}{period}
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className='btn btn-primary' onClick={onDone}>Import another file</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='grid-2' style={{ gap: 16, marginBottom: 16 }}>
        <div className='card'>
          <div className='card-head'><h3 className='card-title'>Ready to publish</h3></div>
          <div className='card-body'>
            <Stat k='File'              v={fileMeta?.name ?? '—'} mono />
            <Stat k='Target table'      v={sourceMeta.table} mono />
            <Stat k='Reporting period'  v={period} mono />
            <Stat k='Rows to publish'   v={String(willPublish)} mono />
            <Stat k='Rows dropped'      v={String(dropped)} mono />
            <Stat k='Mode'              v='Insert (existing API)' />
          </div>
        </div>
        <div className='card'>
          <div className='card-head'><h3 className='card-title'>Downstream effects</h3></div>
          <div className='card-body'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { t: 'Public Market Dashboard',  d: 'KPI strip + 6 figures will refresh once published',   icon: 'chart' as const },
                { t: 'AirDNA Benchmarks (admin)', d: 'New row appears in import history',                  icon: 'calc' as const },
                { t: 'Q1 2026 Investor Report',   d: 'Auto-regenerates via scheduled job at 02:00 UTC',    icon: 'file' as const },
                { t: 'Email digest',              d: 'Justin + 2 admins notified on publish',              icon: 'bell' as const },
              ].map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--bg-subtle)', borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={x.icon} style={{ width: 16, height: 16, opacity: 0.7 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{x.t}</div>
                    <div className='muted' style={{ fontSize: 12 }}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='card' style={{ background: '#FEFCE8', borderColor: 'rgba(234,179,8,0.3)', marginBottom: 16 }}>
        <div className='card-body' style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name='warning' style={{ color: '#854D0E', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#854D0E' }}>Confirm before publishing</div>
            <p style={{ fontSize: 13, color: '#713F12', marginTop: 4 }}>
              This will append rows to <code>{sourceMeta.table}</code> for {period}. Existing rows are not deleted; deduplication is delegated to the API.
            </p>
            <label style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type='checkbox' checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
              I have reviewed the changes and want to publish
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='btn' onClick={onBack} disabled={busy}>← Back</button>
        <button className='btn btn-primary' disabled={!confirmed || busy} onClick={onPublish}>
          {busy ? 'Publishing…' : `Publish ${willPublish} rows →`}
        </button>
      </div>
    </div>
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
