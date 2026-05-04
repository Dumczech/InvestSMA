'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PostMeta } from '@/lib/data/posts';

// Sticky category pills + filtered post grid. Lives below the Featured
// section on /insights. Matches the design's "Field Notes" filter UI —
// the category list is a fixed editorial set (not derived from posts) so
// empty categories still appear, and the order stays curated.

const CATS = [
  { id: 'all',       label: 'All Insights' },
  { id: 'market',    label: 'Market Reports' },
  { id: 'guide',     label: 'Investment Guides' },
  { id: 'buyer',     label: 'Buyer Education' },
  { id: 'case',      label: 'Case Studies' },
  { id: 'tax',       label: 'Tax & Ownership' },
  { id: 'lifestyle', label: 'Second-Home Living' },
];

const matches = (cat: string, postCategory: string) => {
  if (cat === 'all') return true;
  const target = CATS.find(c => c.id === cat)?.label ?? '';
  return postCategory === target;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export function InsightsFilter({ posts, emptyState }: { posts: PostMeta[]; emptyState: string }) {
  const [cat, setCat] = useState('all');
  const filtered = useMemo(() => posts.filter(p => matches(cat, p.category)), [cat, posts]);

  return (
    <>
      <section
        style={{
          background: '#FBF8F0',
          padding: '32px 0',
          borderBottom: '1px solid rgba(20,19,15,0.1)',
          position: 'sticky',
          top: 56,
          zIndex: 20,
        }}
      >
        <div className='container' style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATS.map(c => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  padding: '8px 16px',
                  background: active ? '#14130F' : 'transparent',
                  color: active ? '#F5EFE2' : '#14130F',
                  border: '1px solid ' + (active ? '#14130F' : 'rgba(20,19,15,0.2)'),
                  borderRadius: 100,
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '48px 0 100px' }}>
        <div className='container'>
          {filtered.length === 0 ? (
            <div className='lede'>{emptyState}</div>
          ) : (
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}
              className='post-grid'
            >
              {filtered.map(p => <PostCard key={p.slug} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PostCard({ p }: { p: PostMeta }) {
  return (
    <Link
      href={`/insights/${p.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        borderTop: '1px solid rgba(20,19,15,0.15)',
        paddingTop: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <span
          className='mono'
          style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B08A3E' }}
        >
          {p.category}
        </span>
        <span className='mono' style={{ fontSize: 10, opacity: 0.5 }}>{p.readMinutes} min</span>
      </div>
      <div className='display' style={{ fontSize: 22, lineHeight: 1.2, minHeight: 80 }}>
        {p.title}
      </div>
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid rgba(20,19,15,0.08)',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#3A362F',
        }}
      >
        <span>{fmtDate(p.date)}</span>
        <span style={{ color: '#14130F' }}>Read →</span>
      </div>
    </Link>
  );
}
