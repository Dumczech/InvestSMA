import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedProperties } from '@/lib/data/cms';
import { getPublishedPosts } from '@/lib/data/posts';
import {
  Disclaimer,
  StickyCTA,
  PropertyArt,
  ScoreBadge,
} from '@/components/site';
import type { Property } from '@/types/property';

export const metadata: Metadata = {
  title: 'InvestSMA | San Miguel de Allende Real Estate Investment',
  description:
    'San Miguel de Allende real estate investment platform — real ADR data, turnkey LRM management, income-producing second homes underwritten with institutional rigor.',
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=2400&q=80';

// Faithful port of design5/.../home.jsx. Every section pulls from the data
// layer where possible — Featured properties from getPublishedProperties,
// the InsightStrip from getPublishedPosts (PR #14). Editorial copy
// (credibility stats, video tiles, lead-capture access list) lives inline;
// can move to site_content if/when admin needs to edit without code changes.

export default async function HomePage() {
  const [properties, posts] = await Promise.all([
    getPublishedProperties(),
    getPublishedPosts(),
  ]);

  return (
    <div className='doc-page' data-screen-label='Home'>
      <Hero />
      <Credibility />
      <FeaturedPreview properties={properties.slice(0, 3)} />
      <MarketPreview />
      <VideoSection />
      <InsightStrip posts={posts.slice(0, 3)} />
      <LeadCapture />
      <Disclaimer />
      <StickyCTA />
    </div>
  );
}

// ===========================================================================
// Hero — cinematic Ken Burns with data card
// ===========================================================================

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 720,
        overflow: 'hidden',
        background: '#14130F',
      }}
    >
      <div
        className='kenburns'
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(20,19,15,0.5) 0%, rgba(20,19,15,0.2) 30%, rgba(20,19,15,0.4) 60%, rgba(20,19,15,0.92) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(20,19,15,0.5) 100%)',
        }}
      />

      <CrosshairFrame />

      <div
        className='container'
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 80,
          zIndex: 3,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 64,
            alignItems: 'end',
          }}
          className='hero-grid'
        >
          <div className='fade-up'>
            <div
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A55A',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ display: 'inline-block', width: 24, height: 1, background: '#C9A55A' }} />
              <span>San Miguel de Allende · Vol. 04 · Q1 2026</span>
            </div>
            <h1
              className='display'
              style={{
                fontSize: 'clamp(48px, 7vw, 104px)',
                color: '#F5EFE2',
                margin: 0,
                maxWidth: 1100,
              }}
            >
              Invest in San Miguel&apos;s most
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>desirable luxury rental</span> market.
            </h1>
            <p
              style={{
                maxWidth: 540,
                marginTop: 28,
                fontSize: 17,
                lineHeight: 1.6,
                color: 'rgba(245,239,226,0.78)',
              }}
            >
              Real ADR data. Turnkey LRM management. Income-producing second homes underwritten
              with the rigor of an institutional fund — not a brokerage pitch.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              <Link href='/properties' className='btn btn-gold'>See Featured Opportunities →</Link>
              <Link
                href='/roi-calculator'
                className='btn btn-ghost'
                style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.4)' }}
              >
                Calculate Your ROI
              </Link>
            </div>
          </div>

          <HeroDataCard />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 32,
          zIndex: 3,
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245,239,226,0.5)',
        }}
      >
        ↓ Scroll · 01 of 06
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 32,
          zIndex: 3,
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245,239,226,0.5)',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span>20°54′53″N · 100°44′40″W</span>
        <span style={{ color: '#C9A55A' }}>● LIVE DATA</span>
      </div>
    </section>
  );
}

function CrosshairFrame() {
  const arm = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    position: 'absolute',
    background: 'rgba(201,165,90,0.5)',
    ...extra,
  });
  const Corner = ({ wrap }: { wrap: React.CSSProperties }) => (
    <div style={{ ...wrap, width: 28, height: 28 }}>
      <div style={arm({ top: 0, left: 0, width: 14, height: 1 })} />
      <div style={arm({ top: 0, left: 0, width: 1, height: 14 })} />
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <div style={{ position: 'absolute', top: 90, left: 32 }}>
        <Corner wrap={{}} />
      </div>
      <div style={{ position: 'absolute', top: 90, right: 32, transform: 'scaleX(-1)' }}>
        <Corner wrap={{}} />
      </div>
      <div style={{ position: 'absolute', bottom: 56, left: 32, transform: 'scaleY(-1)' }}>
        <Corner wrap={{}} />
      </div>
      <div style={{ position: 'absolute', bottom: 56, right: 32, transform: 'scale(-1, -1)' }}>
        <Corner wrap={{}} />
      </div>
    </div>
  );
}

function HeroDataCard() {
  const stats = [
    { l: 'Avg occupancy', v: '62.4%', d: '+3.1', up: true },
    { l: 'Centro ADR', v: '$418', d: '+8.2%', up: true },
    { l: 'YoY visitors', v: '+11.8%', d: '↑', up: true },
    { l: 'Gross yield', v: '9.2%', d: '+0.4', up: true },
  ];
  return (
    <div
      className='fade-up hero-data-card'
      style={{
        width: 360,
        background: 'rgba(20,19,15,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(245,239,226,0.12)',
        padding: 24,
        animationDelay: '300ms',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: '1px solid rgba(245,239,226,0.12)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A55A',
          }}
        >
          Q1 2026 · Snapshot
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(245,239,226,0.5)' }}>
          Updated 04·28
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(217,207,184,0.7)',
                marginBottom: 6,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 30,
                color: '#F5EFE2',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                marginTop: 4,
                color: s.up ? '#3F6B55' : '#C46A57',
              }}
            >
              {s.d}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid rgba(245,239,226,0.12)',
          fontSize: 12,
          color: 'rgba(245,239,226,0.55)',
          lineHeight: 1.5,
        }}
      >
        Aggregated across 312 LRM-managed and tracked properties in Q1.
      </div>
    </div>
  );
}

// ===========================================================================
// Credibility · Track record stats
// ===========================================================================

function Credibility() {
  const stats = [
    { num: '312', label: 'Properties\ntracked' },
    { num: '$2.4B', label: 'AUM in San\nMiguel market' },
    { num: '11', label: 'Years operating\nLRM portfolio' },
    { num: '94%', label: 'Investor 2nd-\ntransaction rate' },
  ];
  return (
    <section
      style={{
        background: '#FBF8F0',
        padding: '80px 0',
        borderTop: '1px solid rgba(20,19,15,0.08)',
        borderBottom: '1px solid rgba(20,19,15,0.08)',
      }}
    >
      <div className='container'>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 64,
            alignItems: 'center',
          }}
          className='credibility-grid'
        >
          <div style={{ maxWidth: 360 }}>
            <div className='eyebrow'>02 · Track Record</div>
            <h3 className='display' style={{ fontSize: 32, marginTop: 12, lineHeight: 1.1 }}>
              The data behind <span className='display-italic'>every</span> investment memo.
            </h3>
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}
            className='credibility-stats'
          >
            {stats.map((s, i) => (
              <div key={i} style={{ paddingTop: 20, borderTop: '1px solid rgba(20,19,15,0.2)' }}>
                <div className='display tnum' style={{ fontSize: 56, lineHeight: 0.95 }}>
                  {s.num}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#3A362F',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// FeaturedPreview · 3 properties
// ===========================================================================

function FeaturedPreview({ properties }: { properties: Property[] }) {
  return (
    <section style={{ padding: '40px 0 100px', background: '#FBF8F0' }}>
      <div className='container'>
        <div className='section-head'>
          <div>
            <div className='lead-num'>03 · Active Opportunities</div>
            <h2>
              Underwritten,
              <br />
              <span className='display-italic'>turnkey-ready.</span>
            </h2>
          </div>
          <p className='lede'>
            Off-market and selectively-listed properties with full investment memos, ADR
            projections, and a defined upgrade thesis. We turn down ~40 properties for every one
            we accept onto the platform.
          </p>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 16 }}
          className='featured-grid'
        >
          {properties.map(p => (
            <PropertyCardCompact key={p.slug} p={p} />
          ))}
        </div>
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(20,19,15,0.12)',
            paddingTop: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span
            className='mono'
            style={{ fontSize: 12, color: '#3A362F', letterSpacing: '0.08em' }}
          >
            +3 more on the platform · 14 off-market deals available with investor access
          </span>
          <Link href='/properties' className='btn btn-ghost'>
            All Properties →
          </Link>
        </div>
      </div>
    </section>
  );
}

function PropertyCardCompact({ p }: { p: Property }) {
  const heroSrc = p.images?.[0];
  const priceLabel = p.priceUsd
    ? `$${(p.priceUsd / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
    : p.price;
  const adrLabel = p.adrLow && p.adrHigh ? `$${p.adrLow}–$${p.adrHigh}` : p.adr;
  const grossLabel =
    p.annualGrossLow && p.annualGrossHigh
      ? `$${Math.round(p.annualGrossLow / 1000)}–$${Math.round(p.annualGrossHigh / 1000)}K`
      : p.annualGross;

  return (
    <Link
      href={`/properties/${p.slug}`}
      className='compact-card'
      style={{
        display: 'block',
        overflow: 'hidden',
        background: '#FAF6EC',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        border: '1px solid rgba(20,19,15,0.08)',
      }}
    >
      <div
        style={{
          height: 280,
          background: p.accent2 || '#D9CFB8',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {heroSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroSrc}
            alt={p.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            loading='lazy'
          />
        ) : (
          <PropertyArt style={p.style} />
        )}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6 }}>
          <span
            className='chip'
            style={{
              background: 'rgba(20,19,15,0.7)',
              color: '#F5EFE2',
              borderColor: 'transparent',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {p.neighborhood}
          </span>
        </div>
        {typeof p.score === 'number' && (
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <ScoreBadge score={p.score} />
          </div>
        )}
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <div className='display' style={{ fontSize: 24, lineHeight: 1.1 }}>{p.name}</div>
          <div className='mono tnum' style={{ fontSize: 18, color: '#14130F' }}>{priceLabel}</div>
        </div>
        <div className='mono' style={{ fontSize: 11, color: '#3A362F', letterSpacing: '0.08em', marginTop: 8 }}>
          {p.bedrooms} BD{p.baths ? ` · ${p.baths} BA` : ''}{p.sqm ? ` · ${p.sqm} M²` : ''}
        </div>
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(20,19,15,0.1)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div>
            <div className='data-label'>Est. ADR</div>
            <div className='mono tnum' style={{ fontSize: 16, marginTop: 4 }}>{adrLabel}</div>
          </div>
          <div>
            <div className='data-label'>Gross / yr</div>
            <div className='mono tnum' style={{ fontSize: 16, marginTop: 4, color: '#1F3A2E' }}>
              {grossLabel}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ===========================================================================
// MarketPreview (dark) · OccupancyChart + NbhdComparison
// ===========================================================================

function MarketPreview() {
  return (
    <section
      className='surface-dark'
      style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0' }}
    >
      <div className='container'>
        <div className='section-head' style={{ borderBottom: '1px solid rgba(245,239,226,0.12)', paddingBottom: 56 }}>
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>04 · Market Intelligence</div>
            <h2 style={{ color: '#F5EFE2' }}>
              Proprietary data,
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>not realtor lore.</span>
            </h2>
          </div>
          <p className='lede' style={{ color: 'rgba(245,239,226,0.7)' }}>
            We track ADR, occupancy, and seasonal demand across 312 properties in San Miguel — the
            only dataset of its kind. A summary view below; the full report ships to verified
            investors.
          </p>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginTop: 48 }}
          className='market-grid'
        >
          <OccupancyChart />
          <NbhdComparison />
        </div>

        <div
          style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 32,
            borderTop: '1px solid rgba(245,239,226,0.12)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div className='mono' style={{ fontSize: 12, color: 'rgba(245,239,226,0.6)', letterSpacing: '0.08em' }}>
            Source: LRM proprietary index · n=312 · Q1 2024 — Q1 2026
          </div>
          <Link href='/market-data' className='btn btn-ghost' style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.4)' }}>
            Full Market Dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}

function OccupancyChart() {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const data = [78, 82, 76, 64, 52, 48, 54, 56, 58, 68, 81, 86];
  const max = 100;
  const w = 720;
  const h = 280;
  const pad = 40;
  const bw = (w - pad * 2) / months.length;
  return (
    <div style={{ background: 'rgba(245,239,226,0.03)', border: '1px solid rgba(245,239,226,0.1)', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <div>
          <div className='data-label' style={{ color: '#C9A55A' }}>Fig. 01 · Seasonal Occupancy</div>
          <div className='display' style={{ fontSize: 26, marginTop: 8 }}>2025 average — 4-bedroom SMA</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className='mono tnum' style={{ fontSize: 28, color: '#C9A55A' }}>62.4%</div>
          <div className='data-label' style={{ marginTop: 4 }}>Annual avg</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 25, 50, 75, 100].map(y => (
          <g key={y}>
            <line
              x1={pad}
              y1={h - pad - (y / max) * (h - pad * 2)}
              x2={w - pad}
              y2={h - pad - (y / max) * (h - pad * 2)}
              stroke='rgba(245,239,226,0.08)'
              strokeWidth='1'
            />
            <text
              x={pad - 8}
              y={h - pad - (y / max) * (h - pad * 2) + 3}
              fontSize='9'
              fill='rgba(245,239,226,0.4)'
              textAnchor='end'
              fontFamily='var(--f-mono)'
            >
              {y}
            </text>
          </g>
        ))}
        {data.map((v, i) => {
          const barH = (v / max) * (h - pad * 2);
          const isPeak = v > 70;
          return (
            <g key={i}>
              <rect
                x={pad + i * bw + bw * 0.18}
                y={h - pad - barH}
                width={bw * 0.64}
                height={barH}
                fill={isPeak ? '#C9A55A' : '#3F6B55'}
                opacity={isPeak ? 0.95 : 0.7}
              />
              <text
                x={pad + i * bw + bw / 2}
                y={h - pad + 16}
                fontSize='10'
                fill='rgba(245,239,226,0.5)'
                textAnchor='middle'
                fontFamily='var(--f-mono)'
              >
                {months[i]}
              </text>
              {isPeak && (
                <text
                  x={pad + i * bw + bw / 2}
                  y={h - pad - barH - 6}
                  fontSize='9'
                  fill='#C9A55A'
                  textAnchor='middle'
                  fontFamily='var(--f-mono)'
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 24,
          fontSize: 11,
          fontFamily: 'var(--f-mono)',
          color: 'rgba(245,239,226,0.6)',
          letterSpacing: '0.08em',
        }}
      >
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#C9A55A', marginRight: 6, verticalAlign: 'middle' }} />
          PEAK · NOV–MAR
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#3F6B55', marginRight: 6, verticalAlign: 'middle' }} />
          SHOULDER · APR–OCT
        </span>
      </div>
    </div>
  );
}

function NbhdComparison() {
  const nbhds = [
    { name: 'Centro Histórico', adr: 418, yield: 9.8 },
    { name: 'Atascadero', adr: 362, yield: 8.4 },
    { name: 'San Antonio', adr: 294, yield: 9.2 },
    { name: 'Los Frailes', adr: 312, yield: 7.6 },
    { name: 'El Chorro', adr: 486, yield: 8.9 },
  ];
  return (
    <div style={{ background: 'rgba(245,239,226,0.03)', border: '1px solid rgba(245,239,226,0.1)', padding: 32 }}>
      <div className='data-label' style={{ color: '#C9A55A' }}>Fig. 02 · Neighborhoods</div>
      <div className='display' style={{ fontSize: 22, marginTop: 8, marginBottom: 24 }}>ADR by district</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {nbhds.map(n => {
          const pct = (n.adr / 500) * 100;
          return (
            <div key={n.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{n.name}</span>
                <span className='mono tnum' style={{ fontSize: 13 }}>
                  ${n.adr} <span style={{ color: 'rgba(245,239,226,0.4)' }}>· {n.yield}%</span>
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: 'rgba(245,239,226,0.08)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #3F6B55, #C9A55A)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// Video section
// ===========================================================================

function VideoSection() {
  const videos = [
    {
      id: 'v1',
      title: 'Q1 Market Update — what shifted',
      dur: '8:42',
      img: 'https://images.unsplash.com/photo-1555881400-69d63dca8a91?auto=format&fit=crop&w=1200&q=80',
      cat: 'Market Update',
    },
    {
      id: 'v2',
      title: 'Inside Casa Solana — full property tour',
      dur: '12:18',
      img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      cat: 'Property Tour',
    },
    {
      id: 'v3',
      title: 'How LRM manages a 5-property portfolio',
      dur: '14:05',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      cat: 'Operator Series',
    },
  ];
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <div className='section-head'>
          <div>
            <div className='lead-num'>05 · Video Library</div>
            <h2>
              Watch the
              <br />
              <span className='display-italic'>homework.</span>
            </h2>
          </div>
          <p className='lede'>
            Quarterly market updates, full property tours, and operator-series interviews. We
            publish what we see on the ground — not curated marketing.
          </p>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginTop: 32 }}
          className='video-grid'
        >
          {videos.map((v, i) => (
            <VideoCard key={v.id} v={v} hero={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCard({
  v,
  hero,
}: {
  v: { id: string; title: string; dur: string; img: string; cat: string };
  hero: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        height: 480,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${v.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 600ms ease-out',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(20,19,15,0.1) 30%, rgba(20,19,15,0.85) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(245,239,226,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width='20' height='20' viewBox='0 0 20 20' fill='#14130F'>
          <polygon points='4,2 18,10 4,18' />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <span
          className='chip'
          style={{ background: 'rgba(20,19,15,0.7)', color: '#C9A55A', borderColor: 'transparent' }}
        >
          {v.cat}
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, color: '#F5EFE2' }}>
        <div className='display' style={{ fontSize: hero ? 28 : 18, lineHeight: 1.15 }}>
          {v.title}
        </div>
        <div
          className='mono'
          style={{ fontSize: 11, marginTop: 8, opacity: 0.7, letterSpacing: '0.08em' }}
        >
          {v.dur}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// InsightStrip · 3 latest posts (from articles table)
// ===========================================================================

function InsightStrip({ posts }: { posts: Array<{ slug: string; title: string; category: string; date: string }> }) {
  const fallback = [
    { slug: 'q1-market-report', title: 'Q1 2026: Inventory tightens, ADR climbs 8% YoY', category: 'Market Report', date: '2026-04-18' },
    { slug: 'fideicomiso-vs-corp', title: 'Fideicomiso vs. Mexican corporation: what we recommend', category: 'Buyer Education', date: '2026-04-11' },
    { slug: 'casa-aldama-y1', title: 'How Casa Aldama generated $312K in year one', category: 'Case Study', date: '2026-04-04' },
  ];
  const items = posts.length ? posts : fallback;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

  return (
    <section style={{ padding: '80px 0', background: '#FBF8F0' }}>
      <div className='container'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '1px solid rgba(20,19,15,0.15)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div className='lead-num'>07 · Latest insights</div>
            <h2 className='display' style={{ fontSize: 36, marginTop: 8 }}>
              From the desk.
            </h2>
          </div>
          <Link href='/insights' className='btn-link'>All insights →</Link>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}
          className='insight-grid'
        >
          {items.map(p => (
            <Link
              key={p.slug}
              href={`/insights/${p.slug}`}
              style={{ display: 'block', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className='mono'
                style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#B08A3E',
                }}
              >
                {p.category} · {fmtDate(p.date)}
              </div>
              <div className='display' style={{ fontSize: 22, marginTop: 12, lineHeight: 1.2 }}>
                {p.title}
              </div>
              <div
                className='mono'
                style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 16,
                  color: '#3A362F',
                  paddingBottom: 4,
                  borderBottom: '1px solid #14130F',
                  display: 'inline-block',
                }}
              >
                Read →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Lead capture (dark green section)
// ===========================================================================

function LeadCapture() {
  const benefits = [
    'Q1 2026 SMA Market Report (52pp)',
    '14 off-market property memos',
    'Quarterly investor briefing call',
    'Direct line to LRM acquisitions',
  ];
  return (
    <section
      className='surface-dark'
      style={{
        background: '#1F3A2E',
        color: '#F5EFE2',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
        <svg width='100%' height='100%'>
          <pattern id='dots' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'>
            <circle cx='20' cy='20' r='1' fill='#C9A55A' />
          </pattern>
          <rect width='100%' height='100%' fill='url(#dots)' />
        </svg>
      </div>

      <div className='container' style={{ position: 'relative' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'start' }}
          className='lead-capture-grid'
        >
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>06 · Investor Access</div>
            <h2
              className='display'
              style={{
                fontSize: 'clamp(40px, 5vw, 72px)',
                color: '#F5EFE2',
                margin: '12px 0 32px',
                lineHeight: 1,
                letterSpacing: '-0.025em',
              }}
            >
              The full underwriting
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>is gated.</span>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', maxWidth: 460 }}>
              Verified investors receive: full Q1 2026 market report (52 pages), off-market
              property memos, ROI underwriting models, and a direct line to our acquisition team.
            </p>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span className='mono tnum' style={{ color: '#C9A55A', fontSize: 11, letterSpacing: '0.1em' }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontSize: 15, opacity: 0.9 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(20,19,15,0.4)',
              backdropFilter: 'blur(20px)',
              padding: 40,
              border: '1px solid rgba(245,239,226,0.15)',
            }}
          >
            <div className='data-label' style={{ color: '#C9A55A', marginBottom: 24 }}>
              Request Investor Access
            </div>
            <Link
              href='/contact'
              className='btn btn-gold'
              style={{ width: '100%', marginTop: 8 }}
            >
              Open the full form →
            </Link>
            <div
              className='mono'
              style={{
                fontSize: 10,
                opacity: 0.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: 16,
              }}
            >
              Reviewed within 24h · Not all applicants qualified
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
