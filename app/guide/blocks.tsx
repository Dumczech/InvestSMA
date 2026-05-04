import type { ReactNode } from 'react';

// Reusable editorial building blocks for the Buyer's Guide. All
// server-safe (no state, no client APIs). Faithful port of the
// design's guide-blocks.jsx.

// ---------------------------------------------------------------------------

const PALETTES = {
  sand:  { bg1: '#ECE3CD', bg2: '#D9CFB8', stripe: 'rgba(20,19,15,0.05)',   text: '#3A362F' },
  green: { bg1: '#1F3A2E', bg2: '#2C5240', stripe: 'rgba(245,239,226,0.06)', text: '#D9CFB8' },
  ink:   { bg1: '#1F1D18', bg2: '#14130F', stripe: 'rgba(245,239,226,0.05)', text: '#C9A55A' },
  gold:  { bg1: '#C9A55A', bg2: '#B08A3E', stripe: 'rgba(20,19,15,0.07)',   text: '#14130F' },
} as const;
type Tone = keyof typeof PALETTES;

export function ImagePlaceholder({
  label, ratio = '16/10', tone = 'sand', caption, src, credit,
}: {
  label: string;
  ratio?: string;
  tone?: Tone;
  caption?: string;
  src?: string;
  credit?: string;
}) {
  const p = PALETTES[tone];
  return (
    <figure style={{ margin: 0 }}>
      <div style={{
        aspectRatio: ratio,
        background: src
          ? '#1F1D18'
          : `repeating-linear-gradient(135deg, ${p.bg1} 0 14px, ${p.bg2} 14px 28px), linear-gradient(180deg, ${p.bg1}, ${p.bg2})`,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: 20,
        overflow: 'hidden',
      }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} loading='lazy'
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent 0 13px, ${p.stripe} 13px 14px)` }} />
        )}
        {!src && (
          <>
            <div style={{ position: 'relative', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.text }}>
              [photo] {label}
            </div>
            <div style={{ position: 'relative', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.14em', color: p.text, opacity: 0.7 }}>
              ◇ placeholder
            </div>
          </>
        )}
        {src && credit && (
          <div style={{
            position: 'absolute', bottom: 12, right: 14,
            fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)', background: 'rgba(20,19,15,0.4)',
            padding: '4px 8px', backdropFilter: 'blur(4px)',
          }}>{credit}</div>
        )}
      </div>
      {caption && (
        <figcaption style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ---------------------------------------------------------------------------

export function Pullquote({ children, attribution }: { children: ReactNode; attribution?: string }) {
  return (
    <blockquote style={{
      margin: '40px 0', padding: '32px 0',
      borderTop: '1px solid rgba(20,19,15,0.2)', borderBottom: '1px solid rgba(20,19,15,0.2)',
      fontFamily: 'var(--f-display)', fontSize: 'clamp(24px, 2.4vw, 34px)',
      lineHeight: 1.25, letterSpacing: '-0.015em', color: 'var(--ink)', fontStyle: 'italic',
    }}>
      <span style={{ color: 'var(--gold)', marginRight: 4 }}>&ldquo;</span>
      {children}
      <span style={{ color: 'var(--gold)', marginLeft: 4 }}>&rdquo;</span>
      {attribution && (
        <div style={{ marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 11, fontStyle: 'normal', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          — {attribution}
        </div>
      )}
    </blockquote>
  );
}

// ---------------------------------------------------------------------------

const CALLOUT_STYLES = {
  note: { bg: '#FAF6EC', border: '#D9CFB8', label: 'Note',         labelColor: '#8E6F2D', text: undefined as string | undefined },
  warn: { bg: '#F4E8E2', border: '#C46A57', label: 'Caution',      labelColor: '#9B4A3A', text: undefined },
  rule: { bg: '#14130F', border: '#C9A55A', label: 'The rule',     labelColor: '#C9A55A', text: '#F5EFE2' },
  tip:  { bg: '#E8EFEA', border: '#3F6B55', label: 'Operator tip', labelColor: '#1F3A2E', text: undefined },
} as const;
type CalloutKind = keyof typeof CALLOUT_STYLES;

export function Callout({ kind = 'note', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const s = CALLOUT_STYLES[kind];
  return (
    <aside style={{
      background: s.bg,
      borderLeft: `3px solid ${s.border}`,
      padding: '24px 28px', margin: '32px 0',
      color: s.text ?? 'var(--ink)',
    }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: s.labelColor, marginBottom: 8 }}>
        {s.label}{title ? ` · ${title}` : ''}
      </div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 17, lineHeight: 1.6 }}>
        {children}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------

export function Checklist({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 | 3 }) {
  return (
    <ul className='guide-checklist' style={{
      listStyle: 'none', padding: 0, margin: '24px 0',
      display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 0,
      borderTop: '1px solid rgba(20,19,15,0.12)',
    }}>
      {items.map((it, i) => (
        <li key={i} style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          padding: '14px 0', borderBottom: '1px solid rgba(20,19,15,0.12)',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, border: '1.5px solid var(--ink)',
            flexShrink: 0, marginTop: 2,
          }}>
            <svg width='11' height='11' viewBox='0 0 11 11' style={{ display: 'block' }}>
              <path d='M1.5 5.5 L4.5 8.5 L9.5 2.5' fill='none' stroke='var(--ink)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </span>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)' }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

const COMPARE_TONES = {
  pos:     { color: '#1F3A2E', mark: '✓' },
  neg:     { color: '#9B4A3A', mark: '×' },
  neutral: { color: '#3A362F', mark: '·' },
} as const;
type CompareTone = keyof typeof COMPARE_TONES;

export function ComparisonGrid({
  leftLabel, rightLabel, leftItems, rightItems, leftTone = 'pos', rightTone = 'neg',
}: {
  leftLabel: string;
  rightLabel: string;
  leftItems: string[];
  rightItems: string[];
  leftTone?: CompareTone;
  rightTone?: CompareTone;
}) {
  const L = COMPARE_TONES[leftTone];
  const R = COMPARE_TONES[rightTone];
  return (
    <div className='guide-compare-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, margin: '32px 0', border: '1px solid rgba(20,19,15,0.12)' }}>
      <div style={{ padding: '24px 28px', borderRight: '1px solid rgba(20,19,15,0.12)', background: '#F5EFE2' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: L.color, marginBottom: 16 }}>{leftLabel}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {leftItems.map((it, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ color: L.color, fontFamily: 'var(--f-mono)', fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>{L.mark}</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: '24px 28px', background: '#FAF6EC' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: R.color, marginBottom: 16 }}>{rightLabel}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {rightItems.map((it, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ color: R.color, fontFamily: 'var(--f-mono)', fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>{R.mark}</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StatStrip({ items, dark }: { items: Array<{ v: string; l: string; s?: string }>; dark?: boolean }) {
  return (
    <div className='guide-stat-strip' style={{
      display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 0,
      borderTop: dark ? '1px solid rgba(245,239,226,0.18)' : '1px solid rgba(20,19,15,0.18)',
      borderBottom: dark ? '1px solid rgba(245,239,226,0.18)' : '1px solid rgba(20,19,15,0.18)',
      margin: '32px 0',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          padding: '24px 20px',
          borderRight: i < items.length - 1 ? (dark ? '1px solid rgba(245,239,226,0.1)' : '1px solid rgba(20,19,15,0.08)') : 'none',
        }}>
          <div className='display tnum' style={{ fontSize: 40, color: dark ? '#C9A55A' : '#B08A3E', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {it.v}
          </div>
          <div className='mono' style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: dark ? 'rgba(245,239,226,0.65)' : 'var(--ink-3)', marginTop: 10, lineHeight: 1.4 }}>
            {it.l}
          </div>
          {it.s && (
            <div style={{ fontSize: 13, lineHeight: 1.5, color: dark ? 'rgba(245,239,226,0.55)' : 'var(--ink-3)', marginTop: 6 }}>
              {it.s}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ChapterHead({ num, title, dek, part }: { num: string; title: string; dek?: string; part: string }) {
  return (
    <header className='guide-chapter-head' id={`ch-${num}`} style={{
      display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32,
      padding: '64px 0 36px', borderTop: '1px solid rgba(20,19,15,0.18)',
      alignItems: 'start', scrollMarginTop: 80,
    }}>
      <div>
        <div className='mono' style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
          Part {part}
        </div>
        <div className='display tnum' style={{ fontSize: 88, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 0.85 }}>
          {num}
        </div>
      </div>
      <div>
        <h2 className='display' style={{ fontSize: 'clamp(34px, 4.2vw, 56px)', margin: 0, lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          {title}
        </h2>
        {dek && (
          <p style={{ marginTop: 20, fontSize: 19, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: 720, fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
            {dek}
          </p>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------

export function P({ children, lead = false }: { children: ReactNode; lead?: boolean }) {
  return (
    <p style={{
      fontFamily: 'var(--f-display)',
      fontSize: lead ? 21 : 18,
      lineHeight: 1.65, color: 'var(--ink-2)',
      margin: '16px 0', fontWeight: 400, letterSpacing: '0.001em',
    }}>{children}</p>
  );
}

export function H3({ children, num }: { children: ReactNode; num?: string }) {
  return (
    <h3 className='display' style={{
      fontSize: 28, margin: '40px 0 12px', lineHeight: 1.15, letterSpacing: '-0.015em',
      color: 'var(--ink)', display: 'flex', gap: 16, alignItems: 'baseline',
    }}>
      {num && <span className='mono' style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.14em' }}>§ {num}</span>}
      <span>{children}</span>
    </h3>
  );
}

export function Prose({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div style={{ maxWidth: narrow ? 720 : 820, marginLeft: 'auto', marginRight: 'auto' }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------

type DataRow = string[] | { __highlight: true; cells: string[] };

export function DataTable({ headers, rows, caption }: { headers: string[]; rows: DataRow[]; caption?: string }) {
  const cols = `1.4fr ${headers.slice(1).map(() => '1fr').join(' ')}`;
  return (
    <div className='guide-data-table' style={{ margin: '32px 0', overflowX: 'auto' }}>
      <div style={{ minWidth: 720 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: cols, gap: 0,
          borderBottom: '2px solid var(--ink)', paddingBottom: 12, marginBottom: 4,
        }}>
          {headers.map((h, i) => (
            <div key={i} className='mono' style={{
              fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)',
              textAlign: i === 0 ? 'left' : 'right', padding: '0 8px',
            }}>{h}</div>
          ))}
        </div>
        {rows.map((row, ri) => {
          const isHighlight = !Array.isArray(row);
          const cells = Array.isArray(row) ? row : row.cells;
          return (
            <div key={ri} style={{
              display: 'grid', gridTemplateColumns: cols, gap: 0,
              padding: isHighlight ? '18px 12px' : '14px 0',
              borderBottom: '1px solid rgba(20,19,15,0.1)',
              borderTop: isHighlight ? '2px solid #B08A3E' : 'none',
              alignItems: 'baseline',
              background: isHighlight ? 'rgba(176,138,62,0.10)' : 'transparent',
              marginLeft: isHighlight ? -12 : 0,
              marginRight: isHighlight ? -12 : 0,
              position: 'relative',
            }}>
              {isHighlight && (
                <div style={{
                  position: 'absolute', top: -2, left: 12,
                  background: '#B08A3E', color: '#FAF6EC',
                  fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                  padding: '3px 8px', fontWeight: 600,
                }}>LRM Portfolio</div>
              )}
              {cells.map((cell, ci) => (
                <div key={ci} style={{
                  fontFamily: ci === 0 ? 'var(--f-display)' : 'var(--f-mono)',
                  fontSize: ci === 0 ? (isHighlight ? 20 : 18) : (isHighlight ? 15 : 14),
                  color: isHighlight && ci === 0 ? '#B08A3E' : (ci === 0 ? 'var(--ink)' : 'var(--ink-2)'),
                  fontWeight: isHighlight ? 600 : 400,
                  textAlign: ci === 0 ? 'left' : 'right',
                  padding: '0 8px',
                  fontFeatureSettings: '"tnum" 1',
                }}>{cell}</div>
              ))}
            </div>
          );
        })}
        {caption && (
          <div className='mono' style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 14, letterSpacing: '0.04em', lineHeight: 1.5 }}>
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function PartDivider({ num, title, summary }: { num: string; title: string; summary?: string }) {
  return (
    <div className='surface-dark' style={{
      background: '#14130F', color: '#F5EFE2',
      padding: '120px 0', borderTop: '1px solid rgba(245,239,226,0.08)',
    }}>
      <div className='container-narrow'>
        <div className='guide-part-divider-grid' style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 48, alignItems: 'center' }}>
          <div className='display' style={{ fontSize: 120, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 0.85, fontStyle: 'italic' }}>
            {num}
          </div>
          <div>
            <div className='mono' style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A55A', marginBottom: 14 }}>
              Part {num}
            </div>
            <h2 className='display' style={{ fontSize: 'clamp(40px, 4.8vw, 68px)', margin: 0, lineHeight: 1, letterSpacing: '-0.025em' }}>
              {title}
            </h2>
            {summary && (
              <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.55, color: 'rgba(245,239,226,0.75)', maxWidth: 640, fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
                {summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
