'use client';

// Tiny shared input primitives so the four admin editors all look the same
// without dragging in a UI library. All controlled — pass `value` + `onChange`.

import { ChangeEvent } from 'react';

export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className='block'>
      <div className='text-xs uppercase tracking-wide text-white/50'>{label}</div>
      {hint && <div className='text-xs text-white/40 mt-0.5'>{hint}</div>}
      <div className='mt-1'>{children}</div>
    </label>
  );
}

const inputCls =
  'w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm text-ivory placeholder-white/30 focus:border-gold focus:outline-none';

export function TextInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({
  value, onChange, placeholder,
}: {
  value: number | '' ;
  onChange: (v: number | '') => void;
  placeholder?: string;
}) {
  return (
    <input
      type='number'
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v === '' ? '' : Number(v));
      }}
    />
  );
}

export function TextArea({
  value, onChange, rows = 4, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={inputCls + ' font-mono'}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
    />
  );
}

export function Select<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as T)}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className='bg-charcoal'>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className='inline-flex items-center gap-2 text-sm'>
      <input
        type='checkbox'
        className='h-4 w-4 accent-gold'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Button({
  children, onClick, type = 'button', variant = 'primary', disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  const base = 'rounded px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-gold text-black hover:bg-gold/80',
    ghost:   'border border-white/20 text-ivory hover:bg-white/5',
    danger:  'border border-red-400/40 text-red-300 hover:bg-red-400/10',
  } as const;
  return (
    <button type={type} className={`${base} ${styles[variant]}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'published' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' :
    status === 'draft'     ? 'bg-amber-500/15  text-amber-300  border-amber-400/30' :
                             'bg-white/5       text-white/70   border-white/15';
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs uppercase tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

export function Toast({ tone, children }: { tone: 'ok' | 'err'; children: React.ReactNode }) {
  const cls = tone === 'ok'
    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
    : 'border-red-400/40 bg-red-500/10 text-red-200';
  return <div className={`mt-3 rounded border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
