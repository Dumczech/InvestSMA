'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/reports.jsx — table with quarter/year
// filters, per-row gated/active toggles, an upload modal, and a
// replace-PDF confirmation. Persists title, period, summary, pdf_path,
// published, gated, and download_count. Quarter+year are joined into
// the existing free-text `period` column on save.

export type ReportRow = {
  id: string;
  title: string;
  period: string;
  summary: string | null;
  pdf_path: string | null;
  published: boolean;
  gated: boolean;
  download_count: number;
  created_at: string;
};

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Reference'] as const;
type Quarter = typeof QUARTERS[number];

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

// Parse a free-form period back into quarter + year for display.
function parsePeriod(period: string): { quarter: Quarter | string; year: string } {
  const trimmed = period.trim();
  const yearMatch = trimmed.match(/(20\d{2})/);
  const year = yearMatch?.[1] ?? '';
  const quarterMatch = trimmed.match(/\b(Q[1-4]|Annual|Reference)\b/i);
  const quarter = quarterMatch ? quarterMatch[1].toUpperCase().replace('ANNUAL', 'Annual').replace('REFERENCE', 'Reference') : trimmed.replace(year, '').trim() || '—';
  return { quarter: quarter || '—', year };
}

// ---------------------------------------------------------------------------

export default function MarketReportsClient({ initialRows }: { initialRows: ReportRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [filterYear, setFilterYear]       = useState<'all' | string>('all');
  const [filterQuarter, setFilterQuarter] = useState<'all' | string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [showReplace, setShowReplace] = useState<ReportRow | null>(null);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const years = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => { const y = parsePeriod(r.period).year; if (y) set.add(y); });
    return Array.from(set).sort().reverse();
  }, [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    const p = parsePeriod(r.period);
    if (filterYear !== 'all' && p.year !== filterYear) return false;
    if (filterQuarter !== 'all' && p.quarter !== filterQuarter) return false;
    return true;
  }), [rows, filterYear, filterQuarter]);

  const counts = useMemo(() => ({
    active: rows.filter(r => r.published).length,
    gated:  rows.filter(r => r.gated).length,
  }), [rows]);

  const toggleField = async (row: ReportRow, field: 'published' | 'gated') => {
    setBusyRowId(row.id);
    try {
      const next: ReportRow = { ...row, [field]: !row[field] };
      const r = await fetch('/api/admin/market-reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: row.id,
          title: row.title,
          period: row.period,
          summary: row.summary,
          pdf_path: row.pdf_path,
          published: next.published,
          gated: next.gated,
        }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Update failed');
      setRows(prev => prev.map(p => p.id === row.id ? next : p));
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusyRowId(null);
    }
  };

  const onCreated = (saved: ReportRow) => {
    setRows(prev => {
      const next = prev.filter(p => p.id !== saved.id);
      return [saved, ...next];
    });
    setToast({ tone: 'ok', msg: `Saved "${saved.title}".` });
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Reports']}>
        <button className='btn btn-sm btn-primary' onClick={() => setShowUpload(true)}>
          <Icon name='upload' /> Upload report
        </button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Reports</h1>
            <p className='page-subtitle'>
              PDFs gated behind lead capture. {counts.active} active · {counts.gated} gated
            </p>
          </div>
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <select className='select' style={{ width: 140 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value='all'>All years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className='select' style={{ width: 160 }} value={filterQuarter} onChange={e => setFilterQuarter(e.target.value)}>
                <option value='all'>All quarters</option>
                {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div className='right'>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Sorted by upload date</span>
            </div>
          </div>

          <div className='table-scroll'>
            <table>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Quarter / Year</th>
                  <th className='num'>Downloads</th>
                  <th>Gated</th>
                  <th>Active</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const p = parsePeriod(r.period);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className='row gap-8' style={{ alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 40, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 3, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <span className='mono' style={{ fontSize: 9, color: '#B91C1C', fontWeight: 600 }}>PDF</span>
                          </div>
                          <div>
                            <span className='row-link'>{r.title}</span>
                            <div className='row-sub' style={{ maxWidth: 360 }}>{r.summary ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className='mono'>{p.quarter} · {p.year || '—'}</td>
                      <td className='num mono'>{r.download_count.toLocaleString()}</td>
                      <td>
                        <label className='switch'>
                          <input type='checkbox' checked={r.gated} onChange={() => toggleField(r, 'gated')} disabled={busyRowId === r.id} />
                          <span className='switch-track' />
                        </label>
                      </td>
                      <td>
                        <label className='switch'>
                          <input type='checkbox' checked={r.published} onChange={() => toggleField(r, 'published')} disabled={busyRowId === r.id} />
                          <span className='switch-track' />
                        </label>
                      </td>
                      <td className='mono' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{fmtDate(r.created_at)}</td>
                      <td>
                        <div className='row gap-4'>
                          <button className='btn btn-icon btn-ghost btn-sm' title='Replace PDF' onClick={() => setShowReplace(r)}>
                            <Icon name='refresh' />
                          </button>
                          <button className='btn btn-icon btn-ghost btn-sm' title='Edit'><Icon name='edit' /></button>
                          <button className='btn btn-icon btn-ghost btn-sm' title='More'><Icon name='more' /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className='empty'>
                <div className='empty-icon'><Icon name='file' /></div>
                <h3>No reports match</h3>
                <p>Try changing the filters or upload a new report.</p>
                <button className='btn btn-sm btn-primary' onClick={() => setShowUpload(true)}>Upload report</button>
              </div>
            )}
          </div>
        </div>

        {toast && (
          <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
            {toast.msg}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onCreated={(saved) => { onCreated(saved); setShowUpload(false); }} />}
      {showReplace && <ReplaceModal report={showReplace} onClose={() => setShowReplace(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload modal
// ---------------------------------------------------------------------------

function UploadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (row: ReportRow) => void }) {
  const [title, setTitle]       = useState('');
  const [quarter, setQuarter]   = useState<Quarter>('Q1');
  const [year, setYear]         = useState(new Date().getFullYear().toString());
  const [summary, setSummary]   = useState('');
  const [gated, setGated]       = useState(true);
  const [active, setActive]     = useState(true);
  const [pdfPath, setPdfPath]   = useState('');
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const period = `${quarter} ${year}`.trim();
      const payload = {
        title: title.trim(),
        period,
        summary: summary.trim() || null,
        pdf_path: pdfPath.trim() || null,
        published: active,
        gated,
      };
      const r = await fetch('/api/admin/market-reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      const saved: ReportRow = {
        id: j.id ?? `tmp-${Date.now()}`,
        title: payload.title,
        period: payload.period,
        summary: payload.summary,
        pdf_path: payload.pdf_path,
        published: payload.published,
        gated: payload.gated,
        download_count: 0,
        created_at: new Date().toISOString(),
      };
      onCreated(saved);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()} style={{ width: 'min(560px, calc(100vw - 32px))' }}>
        <div className='modal-head'>
          <h3 className='modal-title'>Upload report</h3>
          <p className='modal-desc'>Adds a new entry to <code>market_reports</code>. Drop the PDF into the <code>investsma-reports</code> bucket and reference its path below.</p>
        </div>
        <form onSubmit={submit}>
          <div className='modal-body' style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: 24, textAlign: 'center', color: 'var(--fg-muted)' }}>
              <Icon name='file' style={{ width: 28, height: 28, color: 'var(--fg-subtle)', marginBottom: 6 }} />
              <div style={{ fontSize: 13 }}>Drop PDF here or browse</div>
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Direct upload requires a storage endpoint · TODO</div>
            </div>
            <div className='field'>
              <label className='label'>Title <span className='req'>*</span></label>
              <input className='input' value={title} onChange={e => setTitle(e.target.value)} placeholder='Q1 2026 San Miguel Market Report' required />
            </div>
            <div className='grid-2' style={{ gap: 12 }}>
              <div className='field'>
                <label className='label'>Quarter</label>
                <select className='select' value={quarter} onChange={e => setQuarter(e.target.value as Quarter)}>
                  {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div className='field'>
                <label className='label'>Year</label>
                <input type='number' className='input' value={year} onChange={e => setYear(e.target.value)} />
              </div>
            </div>
            <div className='field'>
              <label className='label'>PDF path <span className='help'>within the investsma-reports bucket</span></label>
              <input className='input' value={pdfPath} onChange={e => setPdfPath(e.target.value)} placeholder='reports/sma-q1-2026.pdf' />
            </div>
            <div className='field'>
              <label className='label'>Summary</label>
              <textarea className='textarea' rows={2} value={summary} onChange={e => setSummary(e.target.value)} />
            </div>
            <div className='row gap-16'>
              <label className='row gap-8' style={{ fontSize: 13 }}>
                <input type='checkbox' checked={gated} onChange={e => setGated(e.target.checked)} /> Gate behind lead capture
              </label>
              <label className='row gap-8' style={{ fontSize: 13 }}>
                <input type='checkbox' checked={active} onChange={e => setActive(e.target.checked)} /> Active immediately
              </label>
            </div>
            {err && <div className='badge badge-danger' style={{ padding: '8px 12px' }}>{err}</div>}
          </div>
          <div className='modal-foot'>
            <button type='button' className='btn' onClick={onClose}>Cancel</button>
            <button type='submit' className='btn btn-primary' disabled={busy}>
              <Icon name='upload' /> {busy ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Replace PDF modal
// ---------------------------------------------------------------------------

function ReplaceModal({ report, onClose }: { report: ReportRow; onClose: () => void }) {
  return (
    <div className='overlay' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <div className='modal-head'>
          <h3 className='modal-title'>Replace PDF for &ldquo;{report.title}&rdquo;?</h3>
          <p className='modal-desc'>
            The current PDF will be archived. The download URL stays the same — anyone with a link will get the new file.
          </p>
        </div>
        <div className='modal-body'>
          <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 8, padding: 24, textAlign: 'center', color: 'var(--fg-muted)' }}>
            <Icon name='upload' style={{ width: 24, height: 24, color: 'var(--fg-subtle)' }} />
            <div style={{ fontSize: 13, marginTop: 6 }}>Drop new PDF</div>
            <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 4 }}>
              Direct upload requires a storage endpoint · TODO
            </div>
          </div>
        </div>
        <div className='modal-foot'>
          <button className='btn' onClick={onClose}>Cancel</button>
          <button className='btn btn-primary' disabled title='Replace flow not yet wired'>Replace</button>
        </div>
      </div>
    </div>
  );
}
