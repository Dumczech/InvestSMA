'use client';

import { useEffect, useState } from 'react';

// Clickable checklist that persists to localStorage so a buyer can
// resume their progress across sessions. Used for the Buyer Checklist
// in Chapter 30.

export function InteractiveChecklist({
  items, columns = 1, storageKey,
}: {
  items: string[];
  columns?: 1 | 2 | 3;
  storageKey?: string;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!storageKey) { setHydrated(true); return; }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  const toggle = (i: number) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    }
  };

  return (
    <ul className='guide-checklist' style={{
      listStyle: 'none', padding: 0, margin: '24px 0',
      display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 0,
      borderTop: '1px solid rgba(20,19,15,0.12)',
    }}>
      {items.map((it, i) => {
        const isChecked = hydrated && !!checked[i];
        return (
          <li key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '14px 0', borderBottom: '1px solid rgba(20,19,15,0.12)',
              cursor: 'pointer', userSelect: 'none',
            }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 18, height: 18, border: '1.5px solid var(--ink)',
              background: isChecked ? 'var(--ink)' : 'transparent',
              flexShrink: 0, marginTop: 2, transition: 'background 120ms ease',
            }}>
              {isChecked && (
                <svg width='11' height='11' viewBox='0 0 11 11' style={{ display: 'block' }}>
                  <path d='M1.5 5.5 L4.5 8.5 L9.5 2.5' fill='none' stroke='#F5EFE2' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              )}
            </span>
            <span style={{
              fontSize: 15, lineHeight: 1.5,
              color: isChecked ? 'rgba(20,19,15,0.45)' : 'var(--ink-2)',
              textDecoration: isChecked ? 'line-through' : 'none',
              textDecorationColor: 'rgba(20,19,15,0.35)',
            }}>{it}</span>
          </li>
        );
      })}
    </ul>
  );
}
