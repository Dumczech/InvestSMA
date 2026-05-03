'use client';

import { useMemo, useState } from 'react';
import { Button, Field, Select, StatusPill, TextArea, TextInput, Toast } from '../_components/forms';
import { KEY_SCHEMAS, KNOWN_KEY_META, defaultsFromSchema } from './schemas';
import { SchemaForm } from './SchemaForm';

type Row = { key: string; value: unknown; status: string; updated_at: string };
type Status = 'published' | 'draft';
type Mode = 'form' | 'json';

// Renders a schema-aware form for known keys (every site_content row
// the public site reads from) and falls back to a raw-JSON textarea
// for anything not yet in the schema map. A "Raw JSON" toggle lets
// power users switch even when a schema is available.
export default function ContentCmsClient({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [selectedKey, setSelectedKey] = useState<string | null>(initialRows[0]?.key ?? null);
  const [draftKey, setDraftKey] = useState(initialRows[0]?.key ?? '');
  const [draftValue, setDraftValue] = useState<Record<string, unknown>>(() => {
    const first = initialRows[0];
    return first && first.value && typeof first.value === 'object' ? (first.value as Record<string, unknown>) : {};
  });
  const [draftJson, setDraftJson] = useState(
    initialRows[0] ? JSON.stringify(initialRows[0].value, null, 2) : '',
  );
  const [draftStatus, setDraftStatus] = useState<Status>(
    (initialRows[0]?.status as Status) === 'draft' ? 'draft' : 'published',
  );
  const [mode, setMode] = useState<Mode>('form');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const selected = useMemo(
    () => rows.find(r => r.key === selectedKey) ?? null,
    [rows, selectedKey],
  );

  const schema = useMemo(() => KEY_SCHEMAS[draftKey.trim()] ?? null, [draftKey]);
  // If the active key has no schema, force JSON mode so the editor
  // never gets stuck on an empty form.
  const effectiveMode: Mode = schema ? mode : 'json';

  const selectKey = (k: string) => {
    setSelectedKey(k);
    setToast(null);
    const row = rows.find(r => r.key === k);
    if (row) {
      setDraftKey(row.key);
      const obj = row.value && typeof row.value === 'object' ? (row.value as Record<string, unknown>) : {};
      setDraftValue(obj);
      setDraftJson(JSON.stringify(row.value, null, 2));
      setDraftStatus(row.status === 'draft' ? 'draft' : 'published');
      setMode(KEY_SCHEMAS[row.key] ? 'form' : 'json');
    }
  };

  const startNew = (key?: string) => {
    setSelectedKey(null);
    setToast(null);
    setDraftKey(key ?? '');
    if (key && KEY_SCHEMAS[key]) {
      const def = defaultsFromSchema(KEY_SCHEMAS[key]);
      setDraftValue(def);
      setDraftJson(JSON.stringify(def, null, 2));
      setMode('form');
    } else {
      setDraftValue({});
      setDraftJson('{\n  \n}');
      setMode('json');
    }
    setDraftStatus('published');
  };

  // Switching modes — keep both sides in sync on toggle.
  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (next === 'json') {
      setDraftJson(JSON.stringify(draftValue, null, 2));
    } else {
      try {
        const parsed = JSON.parse(draftJson);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setDraftValue(parsed as Record<string, unknown>);
        } else {
          setToast({ tone: 'err', msg: 'JSON must be an object to switch to form view.' });
          return;
        }
      } catch (e) {
        setToast({ tone: 'err', msg: `Invalid JSON: ${(e as Error).message}` });
        return;
      }
    }
    setMode(next);
  };

  const save = async () => {
    setToast(null);
    const k = draftKey.trim();
    if (!k) {
      setToast({ tone: 'err', msg: 'Key is required.' });
      return;
    }
    let parsed: unknown;
    if (effectiveMode === 'form') {
      parsed = draftValue;
    } else {
      try {
        parsed = JSON.parse(draftJson);
      } catch (e) {
        setToast({ tone: 'err', msg: `Invalid JSON: ${(e as Error).message}` });
        return;
      }
    }
    setBusy(true);
    try {
      const r = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: k, value: parsed, status: draftStatus }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      setToast({ tone: 'ok', msg: `Saved ${k}.` });

      setRows(prev => {
        const next = prev.filter(p => p.key !== k);
        return [
          ...next,
          { key: k, value: parsed, status: draftStatus, updated_at: new Date().toISOString() },
        ].sort((a, b) => a.key.localeCompare(b.key));
      });
      setSelectedKey(k);
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const meta = useMemo(() => KNOWN_KEY_META.find(m => m.key === draftKey.trim()), [draftKey]);

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
            {KNOWN_KEY_META.map(t => {
              const exists = rows.some(r => r.key === t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => startNew(t.key)}
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

        {meta && (
          <div className='muted' style={{ fontSize: 12, marginTop: -6 }}>
            <strong style={{ color: 'var(--text)' }}>Used by:</strong> {meta.usedBy}
          </div>
        )}

        {/* Form / JSON toggle */}
        {schema && (
          <div className='row' style={{ gap: 6 }}>
            <Button
              size='sm'
              variant={effectiveMode === 'form' ? 'primary' : 'ghost'}
              onClick={() => switchMode('form')}
            >
              Form
            </Button>
            <Button
              size='sm'
              variant={effectiveMode === 'json' ? 'primary' : 'ghost'}
              onClick={() => switchMode('json')}
            >
              Raw JSON
            </Button>
          </div>
        )}

        {effectiveMode === 'form' && schema ? (
          <SchemaForm
            fields={schema}
            value={draftValue}
            onChange={setDraftValue}
          />
        ) : (
          <Field label='Value (JSON)' hint='Free-form; structure varies per key'>
            <TextArea value={draftJson} onChange={setDraftJson} rows={20} mono />
          </Field>
        )}

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
