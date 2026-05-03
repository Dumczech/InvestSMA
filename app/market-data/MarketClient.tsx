'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MonthlyPerformance, BedroomPerformance, NeighborhoodPerformance, MarketMetric } from '@/types/market';
import MarketDashboard from '@/components/market/dashboard';

// Faithful port of design5/.../market.jsx — but the chart cluster reuses
// the existing MarketDashboard recharts component (already wired to live
// market_*_performance tables). Hero + view toggle + view-aware KPI
// strip + gated CTA match the design.

type View = 'lrm' | 'market' | 'compare';

const KPI_SETS: Record<View, Array<{ l: string; v: string; d: string; up: boolean; sub?: string }>> = {
  lrm: [
    { l: 'Avg ADR', v: '$418', d: '+6.4% YoY', up: true },
    { l: 'Occupancy', v: '68.2%', d: '+3.1pp YoY', up: true },
    { l: 'RevPAR', v: '$285', d: '+9.8% YoY', up: true },
    { l: 'Avg stay', v: '4.4 nt', d: '+0.3 YoY', up: true },
    { l: 'Active inv.', v: '−4.2%', d: 'Tightening', up: false },
  ],
  market: [
    { l: 'Avg ADR', v: '$372', d: '+5.1% YoY', up: true },
    { l: 'Occupancy', v: '58.6%', d: '+1.4pp YoY', up: true },
    { l: 'RevPAR', v: '$218', d: '+7.2% YoY', up: true },
    { l: 'Avg stay', v: '3.8 nt', d: '+0.1 YoY', up: true },
    { l: 'Active inv.', v: '−4.2%', d: 'Tightening', up: false },
  ],
  compare: [
    { l: 'Avg ADR', v: '+$46', d: 'LRM outperform', up: true, sub: '$418 vs $372' },
    { l: 'Occupancy', v: '+9.6pp', d: 'LRM outperform', up: true, sub: '68.2% vs 58.6%' },
    { l: 'RevPAR', v: '+$67', d: 'LRM outperform', up: true, sub: '$285 vs $218' },
    { l: 'Avg stay', v: '+0.6 nt', d: 'LRM outperform', up: true, sub: '4.4 vs 3.8' },
    { l: 'Δ vs market', v: '+30.7%', d: 'RevPAR delta', up: true, sub: 'Same Q1 window' },
  ],
};

const SOURCE_TEXT: Record<View, string> = {
  lrm: 'SOURCE · LRM property management system · n=312 active rentals · period: Q1 2026 (Jan 1 – Mar 31) · updated 2026-03-31',
  market: 'SOURCE · AirDNA MX-SMA market panel · n=2,847 active STR listings · period: Q1 2026 (Jan 1 – Mar 31) · updated 2026-03-28',
  compare: 'COMPARISON · LRM portfolio (n=312) vs AirDNA market panel (n=2,847) · same Q1 2026 window · positive Δ = LRM outperforms market',
};

const VIEWS: Array<{ id: View; l: string; s: string }> = [
  { id: 'lrm', l: 'LRM Portfolio', s: '312 props' },
  { id: 'market', l: 'AirDNA Market', s: '2,847 listings' },
  { id: 'compare', l: 'Side-by-side', s: 'Δ vs benchmark' },
];

export default function MarketClient({
  monthly,
  bedroom,
  neighborhood,
  headlineMetrics,
  usingMock,
}: {
  monthly: MonthlyPerformance[];
  bedroom: BedroomPerformance[];
  neighborhood: NeighborhoodPerformance[];
  headlineMetrics: MarketMetric[];
  usingMock: boolean;
}) {
  const [view, setView] = useState<View>('lrm');
  const kpis = KPI_SETS[view];

  return (
    <>
      {/* HERO */}
      <section
        className='surface-dark'
        style={{ background: '#14130F', color: '#F5EFE2', padding: '64px 0' }}
      >
        <div className='container'>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64, alignItems: 'end' }}
            className='hero-grid'
          >
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Dashboard · Q1 2026</div>
              <h1
                className='display'
                style={{
                  fontSize: 'clamp(48px, 6vw, 88px)',
                  margin: '16px 0 0',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.98,
                }}
              >
                The San Miguel
                <br />
                <span className='display-italic' style={{ color: '#D9CFB8' }}>rental market index.</span>
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
                Tracked across 312 LRM-managed properties, benchmarked against AirDNA&apos;s
                2,847-listing market panel. Updated weekly. The summary view is public — the
                52-page Q1 report is gated to verified investors.
              </p>
            </div>
            <Link
              href='/contact?intent=report'
              className='btn btn-gold'
              style={{ alignSelf: 'end', justifySelf: 'end' }}
            >
              Download Full Report (52 pp) →
            </Link>
          </div>
        </div>
      </section>

      {/* VIEW TOGGLE */}
      <section
        className='surface-dark'
        style={{
          background: '#14130F',
          color: '#F5EFE2',
          borderTop: '1px solid rgba(201,165,90,0.2)',
          paddingBottom: 32,
        }}
      >
        <div className='container'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <div className='data-label' style={{ color: '#C9A55A', marginBottom: 8 }}>Data view</div>
              <div style={{ display: 'inline-flex', border: '1px solid rgba(201,165,90,0.4)', flexWrap: 'wrap' }}>
                {VIEWS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setView(t.id)}
                    style={{
                      padding: '14px 22px',
                      background: view === t.id ? '#C9A55A' : 'transparent',
                      color: view === t.id ? '#14130F' : '#F5EFE2',
                      border: 'none',
                      cursor: 'pointer',
                      borderRight: i < VIEWS.length - 1 ? '1px solid rgba(201,165,90,0.4)' : 'none',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 3,
                    }}
                  >
                    <span>{t.l}</span>
                    <span style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.08em' }}>{t.s}</span>
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--f-mono)',
                color: 'rgba(245,239,226,0.6)',
                letterSpacing: '0.1em',
                textAlign: 'right',
              }}
            >
              <div>SOURCES · LRM PMS · AIRDNA MX-SMA · INEGI</div>
              <div style={{ marginTop: 4 }}>UPDATED · 2026-03-31 · NEXT REFRESH 2026-04-07</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section style={{ background: '#FBF8F0', padding: '32px 0 16px' }}>
        <div className='container'>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}
            className='kpi-strip'
          >
            {kpis.map((k, i) => (
              <div key={i} style={{ paddingTop: 16, borderTop: '1px solid rgba(20,19,15,0.2)' }}>
                <div className='data-label'>{k.l}</div>
                <div
                  className='display tnum'
                  style={{
                    fontSize: 36,
                    marginTop: 8,
                    color: view === 'compare' ? '#1F3A2E' : '#14130F',
                  }}
                >
                  {k.v}
                </div>
                <div
                  className='mono tnum'
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    color: k.up ? '#1F3A2E' : '#9B4A3A',
                  }}
                >
                  {k.up ? '↑' : '↓'} {k.d}
                </div>
                {k.sub && (
                  <div
                    className='mono tnum'
                    style={{ fontSize: 10, marginTop: 4, color: 'rgba(20,19,15,0.55)' }}
                  >
                    {k.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#FBF8F0',
          padding: '0 0 16px',
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'rgba(20,19,15,0.55)',
        }}
      >
        <div className='container'>{SOURCE_TEXT[view]}</div>
      </section>

      {/* CHARTS — reuse existing MarketDashboard wired to live data */}
      <section style={{ background: '#FBF8F0', padding: '64px 0' }}>
        <div className='container'>
          <MarketDashboard
            monthly={monthly}
            bedroom={bedroom}
            neighborhood={neighborhood}
            headlineMetrics={headlineMetrics}
            usingMock={usingMock}
          />
        </div>
      </section>

      {/* GATED CTA */}
      <section
        className='surface-dark'
        style={{ background: '#1F3A2E', color: '#F5EFE2', padding: '120px 0' }}
      >
        <div className='container'>
          <div
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 64, alignItems: 'center' }}
            className='gated-grid'
          >
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Quarterly Report</div>
              <h2
                className='display'
                style={{
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  margin: '12px 0 24px',
                  lineHeight: 0.98,
                }}
              >
                52 pages of
                <br />
                <span className='display-italic' style={{ color: '#D9CFB8' }}>field-tested data.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.78, maxWidth: 520 }}>
                The Q1 2026 SMA Market Report includes ADR by bedroom by neighborhood, transaction
                comps, regulatory outlook, and a 2027 forecast. Free to verified investors.
              </p>
            </div>
            <Link href='/contact?intent=report' className='btn btn-gold' style={{ justifySelf: 'end' }}>
              Get the Q1 Report →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
