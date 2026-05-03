'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PropertyCardLarge } from '@/components/site';
import type { Property } from '@/types/property';

// Faithful port of design3/.../properties.jsx. Filter/sort logic
// matches the bundle's reference: neighborhood + bedroom chip filters,
// LRM Score / price asc/desc / yield sort, sticky filter bar.

type SortBy = 'score' | 'price-asc' | 'price-desc' | 'yield';

const BED_OPTIONS = ['All', '3+', '4+', '5+'] as const;
type BedOption = (typeof BED_OPTIONS)[number];

export default function PropertiesClient({ properties }: { properties: Property[] }) {
  const [nbhd, setNbhd] = useState<string>('All');
  const [bedFilter, setBedFilter] = useState<BedOption>('All');
  const [sortBy, setSortBy] = useState<SortBy>('score');

  const nbhds = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => {
      if (p.neighborhood) set.add(p.neighborhood);
    });
    return ['All', ...set];
  }, [properties]);

  const filtered = useMemo(() => {
    const minBeds = bedFilter === 'All' ? 0 : parseInt(bedFilter, 10);
    const out = properties.filter(p => {
      if (nbhd !== 'All' && p.neighborhood !== nbhd) return false;
      if (p.bedrooms < minBeds) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'price-asc') return (a.priceUsd ?? 0) - (b.priceUsd ?? 0);
      if (sortBy === 'price-desc') return (b.priceUsd ?? 0) - (a.priceUsd ?? 0);
      if (sortBy === 'yield') {
        const ya = a.priceUsd ? (a.annualGrossLow ?? 0) / a.priceUsd : 0;
        const yb = b.priceUsd ? (b.annualGrossLow ?? 0) / b.priceUsd : 0;
        return yb - ya;
      }
      return 0;
    });
    return out;
  }, [properties, nbhd, bedFilter, sortBy]);

  const total = properties.length;
  const offMarket = 14; // matches the design's editorial number

  // Compute hero stats from data with sensible fallbacks.
  const minPriceM = Math.min(
    ...properties.map(p => (p.priceUsd ? p.priceUsd / 1_000_000 : Infinity)),
  );
  const maxPriceM = Math.max(
    ...properties.map(p => (p.priceUsd ? p.priceUsd / 1_000_000 : -Infinity)),
  );
  const priceBand =
    Number.isFinite(minPriceM) && Number.isFinite(maxPriceM)
      ? `$${minPriceM.toFixed(1)}–${maxPriceM.toFixed(1)}M`
      : '—';
  const occs = properties.map(p => p.occupancyPercent).filter((n): n is number => typeof n === 'number');
  const occRange = occs.length
    ? `${Math.min(...occs)}–${Math.max(...occs)}%`
    : '—';

  return (
    <>
      {/* ===== HERO ===== */}
      <section
        className='surface-dark'
        style={{ background: '#14130F', color: '#F5EFE2', padding: '64px 0' }}
      >
        <div className='container'>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: 64,
              alignItems: 'end',
            }}
            className='hero-grid'
          >
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Catalog · Q1 2026</div>
              <h1
                className='display'
                style={{
                  fontSize: 'clamp(48px, 6vw, 88px)',
                  margin: '16px 0 0',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.98,
                }}
              >
                Featured
                <br />
                <span className='display-italic' style={{ color: '#D9CFB8' }}>
                  investment opportunities.
                </span>
              </h1>
              <p
                style={{
                  marginTop: 24,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(245,239,226,0.78)',
                  maxWidth: 540,
                }}
              >
                {total} properties currently on the platform. Each underwritten with full ADR,
                occupancy, and upgrade thesis. Verified investors gain access to {offMarket}{' '}
                additional off-market listings.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              <HeroStat value={String(total)} label='Public listings' />
              <HeroStat value={String(offMarket)} label='Off-market' />
              <HeroStat value={priceBand} label='Price band' />
              <HeroStat value={occRange} label='Occ range' />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FILTERS (sticky) ===== */}
      <section
        style={{
          background: '#FAF6EC',
          borderBottom: '1px solid rgba(20,19,15,0.1)',
          position: 'sticky',
          top: 56,
          zIndex: 20,
        }}
      >
        <div
          className='container'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            padding: '20px 32px',
            flexWrap: 'wrap',
          }}
        >
          <FilterChips label='Neighborhood' options={nbhds} value={nbhd} onChange={setNbhd} />
          <FilterChips
            label='Bedrooms'
            options={BED_OPTIONS as readonly string[]}
            value={bedFilter}
            onChange={v => setBedFilter(v as BedOption)}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className='data-label'>Sort</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(20,19,15,0.3)',
                padding: '6px 0',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value='score'>LRM Score</option>
              <option value='price-asc'>Price · Low</option>
              <option value='price-desc'>Price · High</option>
              <option value='yield'>Gross Yield</option>
            </select>
          </div>
        </div>
      </section>

      {/* ===== GRID ===== */}
      <section style={{ background: '#FBF8F0', padding: '48px 0 120px' }}>
        <div className='container'>
          <div
            className='mono'
            style={{
              fontSize: 11,
              color: '#3A362F',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            {filtered.length} of {total} properties · Updated 28 Apr 2026
          </div>
          {filtered.length > 0 ? (
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}
              className='properties-grid'
            >
              {filtered.map(p => (
                <PropertyCardLarge key={p.slug} p={p} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div className='display' style={{ fontSize: 32 }}>No matches in this filter.</div>
              <p style={{ marginTop: 12, color: '#3A362F' }}>
                Adjust your criteria or request access to off-market deals.
              </p>
              <Link
                href='/contact'
                className='btn btn-primary'
                style={{ marginTop: 24, display: 'inline-flex' }}
              >
                See off-market →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className='display tnum' style={{ fontSize: 36, color: '#C9A55A' }}>{value}</div>
      <div className='data-label' style={{ marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FilterChips({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span className='data-label'>{label}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              style={{
                padding: '6px 12px',
                background: active ? '#14130F' : 'transparent',
                color: active ? '#F5EFE2' : '#14130F',
                border: '1px solid ' + (active ? '#14130F' : 'rgba(20,19,15,0.2)'),
                borderRadius: 100,
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
