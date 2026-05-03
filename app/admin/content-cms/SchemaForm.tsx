'use client';

// Schema-driven form renderer. Walks a FieldSpec[] and renders the
// appropriate input per leaf, recursing into nested objects and array
// items. Single value prop is the JSON object being edited; onChange
// receives the new object on every keystroke. Arrays support add /
// remove / reorder via on-row buttons.

import { Field, TextInput, NumberInput, TextArea, Checkbox, Button } from '../_components/forms';
import { FieldSpec, defaultsFromSchema } from './schemas';

type Obj = Record<string, unknown>;

export function SchemaForm({
  fields,
  value,
  onChange,
}: {
  fields: FieldSpec[];
  value: Obj;
  onChange: (next: Obj) => void;
}) {
  const setField = (key: string, v: unknown) => {
    onChange({ ...value, [key]: v });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {fields.map(f => (
        <FieldRenderer key={f.key} field={f} value={value[f.key]} onChange={v => setField(f.key, v)} />
      ))}
    </div>
  );
}

// Per-field renderer.
function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case 'string':
      return (
        <Field label={field.label} hint={field.hint}>
          <TextInput
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </Field>
      );

    case 'text':
      return (
        <Field label={field.label} hint={field.hint}>
          <TextArea
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
          />
        </Field>
      );

    case 'number':
      return (
        <Field label={field.label} hint={field.hint}>
          <NumberInput
            value={typeof value === 'number' ? value : ''}
            onChange={v => onChange(v === '' ? 0 : v)}
          />
        </Field>
      );

    case 'boolean':
      return (
        <div className='field'>
          {field.hint && <span className='help' style={{ display: 'block', marginBottom: 4 }}>{field.hint}</span>}
          <Checkbox
            checked={Boolean(value)}
            onChange={onChange}
            label={field.label}
          />
        </div>
      );

    case 'array<string>':
      return (
        <ArrayPrimitive
          field={field}
          values={Array.isArray(value) ? (value as unknown[]).map(x => String(x ?? '')) : []}
          onChange={onChange}
          empty=''
          render={(v, set) => <TextInput value={v} onChange={set} />}
        />
      );

    case 'array<number>':
      return (
        <ArrayPrimitive
          field={field}
          values={Array.isArray(value) ? (value as unknown[]).map(x => (typeof x === 'number' ? x : 0)) : []}
          onChange={onChange}
          empty={0}
          render={(v, set) => (
            <NumberInput value={v} onChange={n => set(n === '' ? 0 : n)} />
          )}
        />
      );

    case 'array<object>':
      return (
        <ArrayObject
          field={field}
          values={Array.isArray(value) ? (value as Obj[]) : []}
          onChange={onChange}
        />
      );

    case 'object':
      return (
        <fieldset className='card' style={{ padding: 16 }}>
          <legend className='label' style={{ padding: '0 6px' }}>{field.label}</legend>
          <SchemaForm
            fields={field.fields}
            value={(value && typeof value === 'object' ? (value as Obj) : {})}
            onChange={onChange as (v: Obj) => void}
          />
        </fieldset>
      );
  }
}

// Renders an array-of-primitive (string or number).
function ArrayPrimitive<T>({
  field,
  values,
  onChange,
  empty,
  render,
}: {
  field: FieldSpec & { kind: 'array<string>' | 'array<number>' };
  values: T[];
  onChange: (v: T[]) => void;
  empty: T;
  render: (v: T, set: (n: T | '') => void) => React.ReactNode;
}) {
  const setAt = (i: number, v: T) => {
    const next = values.slice();
    next[i] = v;
    onChange(next);
  };
  const removeAt = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, empty]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = values.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <Field label={field.label} hint={field.hint}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className='muted' style={{ fontSize: 11, width: 24, textAlign: 'right' }}>{i + 1}</span>
            <div style={{ flex: 1 }}>{render(v, n => setAt(i, n as T))}</div>
            <Button size='sm' variant='ghost' onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
            <Button size='sm' variant='ghost' onClick={() => move(i, 1)} disabled={i === values.length - 1}>↓</Button>
            <Button size='sm' variant='danger' onClick={() => removeAt(i)}>✕</Button>
          </div>
        ))}
        <div>
          <Button size='sm' variant='ghost' onClick={add}>+ Add {field.itemLabel ?? 'item'}</Button>
        </div>
      </div>
    </Field>
  );
}

// Renders an array-of-objects with nested SchemaForm per item.
function ArrayObject({
  field,
  values,
  onChange,
}: {
  field: FieldSpec & { kind: 'array<object>' };
  values: Obj[];
  onChange: (v: Obj[]) => void;
}) {
  const setAt = (i: number, v: Obj) => {
    const next = values.slice();
    next[i] = v;
    onChange(next);
  };
  const removeAt = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, defaultsFromSchema(field.itemFields)]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = values.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const titleOf = (item: Obj, idx: number) => {
    if (field.itemTitleKey && typeof item[field.itemTitleKey] === 'string') {
      const t = (item[field.itemTitleKey] as string).trim();
      if (t) return t;
    }
    return `${field.label.replace(/s$/, '')} ${idx + 1}`;
  };
  return (
    <Field label={field.label} hint={field.hint}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {values.map((item, i) => (
          <div
            key={i}
            className='card'
            style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {i + 1}. {titleOf(item, i)}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size='sm' variant='ghost' onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
                <Button size='sm' variant='ghost' onClick={() => move(i, 1)} disabled={i === values.length - 1}>↓</Button>
                <Button size='sm' variant='danger' onClick={() => removeAt(i)}>✕ Remove</Button>
              </div>
            </div>
            <SchemaForm
              fields={field.itemFields}
              value={item}
              onChange={v => setAt(i, v)}
            />
          </div>
        ))}
        <div>
          <Button size='sm' variant='ghost' onClick={add}>+ Add {field.itemLabel ?? 'item'}</Button>
        </div>
      </div>
    </Field>
  );
}
