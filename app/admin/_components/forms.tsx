'use client';

// Admin form primitives — re-skinned to use admin.css classes
// (.input, .select, .textarea, .btn, .badge, .field, .label) so the
// editor pages render natively in the operations dashboard.

import { ChangeEvent } from 'react';

export function Field({
  label, hint, children, required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className='field'>
      <label className='label'>
        {label}
        {required && <span className='req'>*</span>}
        {hint && <span className='help'>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

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
      className='input'
      value={value}
      placeholder={placeholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({
  value, onChange, placeholder,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  placeholder?: string;
}) {
  return (
    <input
      type='number'
      className='input'
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
  value, onChange, rows = 4, placeholder, mono,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <textarea
      className='textarea'
      rows={rows}
      value={value}
      placeholder={placeholder}
      style={mono ? { fontFamily: 'var(--f-mono)', fontSize: 12 } : undefined}
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
      className='select'
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as T)}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className='row' style={{ cursor: 'pointer', userSelect: 'none' }}>
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );
}

export function Button({
  children, onClick, type = 'button', variant = 'primary', size = 'md', disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger' | 'default';
  size?: 'sm' | 'md';
  disabled?: boolean;
}) {
  const variantClass =
    variant === 'primary' ? 'btn-primary' :
    variant === 'ghost'   ? 'btn-ghost' :
    variant === 'danger'  ? 'btn-danger' : '';
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const kind =
    status === 'published' ? 'success' :
    status === 'draft'     ? 'warn' :
                             'outline';
  return <span className={`badge badge-${kind}`}>{status}</span>;
}

export function Toast({ tone, children }: { tone: 'ok' | 'err'; children: React.ReactNode }) {
  const kind = tone === 'ok' ? 'success' : 'danger';
  return (
    <div
      className={`badge badge-${kind}`}
      style={{ marginTop: 12, padding: '8px 12px', fontSize: 13, display: 'block' }}
    >
      {children}
    </div>
  );
}
