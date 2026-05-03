'use client';

import { FormEvent, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';
import { Field, Select, TextInput, Button, Toast } from '../_components/forms';

const TABLES = [
  { value: 'market_monthly_performance', label: 'Monthly performance' },
  { value: 'market_bedroom_performance', label: 'Bedroom performance' },
  { value: 'market_neighborhood_performance', label: 'Neighborhood performance' },
  { value: 'market_channel_mix', label: 'Channel mix' },
  { value: 'market_seasonality', label: 'Seasonality' },
  { value: 'airdna_benchmark_data', label: 'AirDNA benchmark' },
] as const;
type Table = (typeof TABLES)[number]['value'];

export default function Page() {
  const [table, setTable] = useState<Table>('market_monthly_performance');
  const [sourceType, setSourceType] = useState('csv');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const upload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setToast(null);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set('table', table);
      fd.set('sourceType', sourceType);
      const r = await fetch('/api/admin/import-csv', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Import failed');
      setToast({ tone: 'ok', msg: `Import OK — batch ${j.batchId}, ${j.valid} valid, ${j.errors} errors.` });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const manualSample = async () => {
    setBusy(true);
    setToast(null);
    try {
      const r = await fetch('/api/admin/manual-entry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          table: 'market_monthly_performance',
          sourceType: 'manual',
          row: {
            period: '2026',
            month: 4,
            year: 2026,
            lrm_occupancy: 68,
            lrm_adr: 520,
            lrm_revpar: 354,
          },
        }),
      });
      const j = await r.json();
      setToast({ tone: j.ok ? 'ok' : 'err', msg: j.ok ? 'Manual sample row inserted.' : (j.error || 'Failed') });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='main'>
      <Topbar crumbs={['CSV Import']} />
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>CSV Import</h1>
            <p className='page-subtitle'>
              Upload AirDNA / portfolio CSV exports into the <code>market_*_performance</code>{' '}
              tables. Validation errors land in <code>data_validation_errors</code>.
            </p>
          </div>
        </div>

        <form onSubmit={upload} className='card' style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label='Target table' required>
            <Select<Table>
              value={table}
              onChange={setTable}
              options={[...TABLES]}
            />
          </Field>
          <Field label='Source type' hint='free-form: csv, airdna, guesty, manual'>
            <TextInput value={sourceType} onChange={setSourceType} placeholder='csv' />
          </Field>
          <Field label='CSV file' required>
            <input type='file' name='file' className='input' required accept='.csv,text/csv' />
          </Field>
          <div className='row'>
            <Button type='submit' disabled={busy}>
              <Icon name='upload' /> {busy ? 'Importing…' : 'Import CSV'}
            </Button>
            <Button type='button' variant='ghost' onClick={manualSample} disabled={busy}>
              <Icon name='plus' /> Insert sample row (manual)
            </Button>
          </div>
          {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
        </form>
      </div>
    </div>
  );
}
