'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/types/property';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

// ===========================================================================
// Shared chrome — Nav, Ticker, Footer, StickyCTA, Disclaimer.
// Ports of the corresponding components in the design bundle's layout.jsx;
// classes are defined in app/globals.css.
// ===========================================================================

const PAGES: Array<{ id: string; label: string; href: string }> = [
  { id: 'home',       label: 'Home',            href: '/' },
  { id: 'properties', label: 'Properties',      href: '/properties' },
  { id: 'market',     label: 'Market Data',     href: '/market-data' },
  { id: 'roi',        label: 'ROI Calculator',  href: '/roi-calculator' },
  { id: 'insights',   label: 'Insights',        href: '/insights' },
  { id: 'contact',    label: 'Investor Access', href: '/contact' },
];

export const Logo = ({ dark }: { dark?: boolean }) => (
  <Link href='/' className='nav-logo' style={{ color: dark ? '#F5EFE2' : '#14130F' }}>
    <span className='mark' />
    <span>InvestSMA</span>
    <span className='tag'>by Luxury Rental Mgmt</span>
  </Link>
);

export const Nav = ({ active, dark }: { active?: string; dark?: boolean }) => (
  <nav className={`nav ${dark ? 'dark-nav' : ''}`}>
    <div className='nav-inner'>
      <Logo dark={dark} />
      <div className='nav-links'>
        {PAGES.map(p => (
          <Link
            key={p.id}
            href={p.href}
            className={`nav-link ${p.id === active ? 'active' : ''}`}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <Link
        href='/contact'
        className='btn btn-gold'
        style={{ padding: '10px 18px', fontSize: 11 }}
      >
        Request Access →
      </Link>
    </div>
  </nav>
);

// Bloomberg-style marquee. The duplicated <span> set inside .marquee-track
// keeps the animation seamless (translateX -50% wraps cleanly).
const TICKER_ITEMS: Array<{ label: string; val: string; delta: string; up: boolean }> = [
  { label: 'SMA·OCC',          val: '62.4%',     delta: '+3.1%',      up: true  },
  { label: 'CENTRO·ADR',       val: '$418',      delta: '+8.2%',      up: true  },
  { label: 'ATASCADERO·ADR',   val: '$362',      delta: '+5.4%',      up: true  },
  { label: 'SAN ANTONIO·ADR',  val: '$294',      delta: '+2.1%',      up: true  },
  { label: 'YOY·VISITORS',     val: '+11.8%',    delta: '↑',          up: true  },
  { label: 'AVG·STAY',         val: '4.1 nights', delta: '+0.3',      up: true  },
  { label: 'CAP·RATE·LUX',     val: '6.8%',      delta: '−0.2%',      up: false },
  { label: 'GROSS·YIELD',      val: '9.2%',      delta: '+0.4%',      up: true  },
  { label: 'PEAK·NOV-MAR',     val: '78% OCC',   delta: '↑',          up: true  },
  { label: 'INVENTORY',        val: '–4.2%',     delta: 'tightening', up: false },
];

export const Ticker = () => (
  <div className='ticker'>
    <div className='marquee-track'>
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((it, i) => (
        <span key={i} className='ticker-item'>
          <span className='label'>{it.label}</span>
          <span className='val tnum'>{it.val}</span>
          <span className={it.up ? 'delta-up' : 'delta-dn'}>{it.delta}</span>
        </span>
      ))}
    </div>
  </div>
);

export const Disclaimer = () => (
  <div
    style={{
      background: '#0E0D0A',
      color: 'rgba(245,239,226,0.55)',
      padding: '24px 0',
      borderTop: '1px solid rgba(245,239,226,0.08)',
    }}
  >
    <div
      className='container'
      style={{
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        lineHeight: 1.6,
        letterSpacing: '0.04em',
      }}
    >
      <strong
        style={{
          color: 'rgba(245,239,226,0.75)',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          fontSize: 10,
        }}
      >
        Disclaimer ·{' '}
      </strong>
      Revenue estimates and ROI projections shown on this site are directional and not guaranteed.
      They exclude operating expenses, property taxes, financing costs, sales commissions, owner
      personal-use days, and any future regulatory changes. Past performance does not predict
      future results. Information is for educational purposes and is not investment, legal, or tax
      advice. InvestSMA is operated by Luxury Rental Management.
    </div>
  </div>
);

export const Footer = () => (
  <footer className='footer'>
    <div className='container'>
      <div className='footer-grid'>
        <div>
          <Logo dark />
          <p style={{ marginTop: 24, maxWidth: 380, opacity: 0.7, fontSize: 14, lineHeight: 1.7 }}>
            A research and lead-gen platform for investors evaluating turnkey luxury rental
            properties in San Miguel de Allende. Operated by Luxury Rental Management.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <span className='chip' style={{ borderColor: 'rgba(245,239,226,0.25)', color: '#D9CFB8' }}>Operator-led</span>
            <span className='chip' style={{ borderColor: 'rgba(245,239,226,0.25)', color: '#D9CFB8' }}>Real Data</span>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link href='/properties'>Featured Properties</Link></li>
            <li><Link href='/market-data'>Market Data</Link></li>
            <li><Link href='/roi-calculator'>ROI Calculator</Link></li>
            <li><Link href='/insights'>Insights & Reports</Link></li>
          </ul>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><Link href='/insights'>Buyer&apos;s Guide</Link></li>
            <li><Link href='/insights'>Q1 Market Report</Link></li>
            <li><Link href='/insights'>Tax & Ownership</Link></li>
            <li><Link href='/insights'>Case Studies</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><Link href='/contact'>Request Access</Link></li>
            <li><a href='mailto:justin@luxrentalmgmt.com'>justin@luxrentalmgmt.com</a></li>
            <li><a href='tel:+15123662801'>+1 (512) 366-2801</a></li>
            <li style={{ opacity: 0.6 }}>San Miguel de Allende, GTO</li>
          </ul>
        </div>
      </div>
      <div
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(245,239,226,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          fontSize: 12,
          opacity: 0.5,
          fontFamily: 'var(--f-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span>© 2026 Luxury Rental Management · justin@luxrentalmgmt.com · +1 (512) 366-2801</span>
        <span style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href='/legal#disclosures' style={{ color: 'inherit' }}>Disclosures</Link>
          <Link href='/legal#terms' style={{ color: 'inherit' }}>Terms</Link>
          <span>Estimates are directional only — not guaranteed.</span>
        </span>
      </div>
    </div>
  </footer>
);

export const StickyCTA = ({
  label = 'See if you qualify',
  cta = 'Calculate ROI',
  href = '/roi-calculator',
}: {
  label?: string;
  cta?: string;
  href?: string;
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <Link href={href} className={`sticky-cta ${visible ? 'visible' : ''}`}>
      <span className='label'>
        {label} · <span className='strong'>2 min</span>
      </span>
      <span className='btn btn-gold' style={{ padding: '8px 16px', fontSize: 11 }}>
        {cta} →
      </span>
    </Link>
  );
};

// ===========================================================================
// Helpers
// ===========================================================================

export const fmtMoney = (n: number, opts: { compact?: boolean; prefix?: string } = {}) => {
  const { compact = false, prefix = '$' } = opts;
  if (!Number.isFinite(n)) return `${prefix}—`;
  if (compact && Math.abs(n) >= 1_000_000) {
    return `${prefix}${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (compact && Math.abs(n) >= 1_000) {
    return `${prefix}${(n / 1_000).toFixed(0)}K`;
  }
  return `${prefix}${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

// ===========================================================================
// Backwards-compat aliases — the prior chrome lived under these names.
// Existing call sites import { Navbar, Footer } from '@/components/site';
// Keep `Navbar` pointing at the new `Nav` so nothing breaks.
// ===========================================================================

export const Navbar = Nav;

// ===========================================================================
// Property visuals — ScoreBadge, PropertyArt, PropertyCardLarge.
// PropertyCardLarge is the design's editorial 2-column card; the prior simple
// PropertyCard is exported below for any pages still using it.
// ===========================================================================

export const ScoreBadge = ({ score }: { score: number }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'rgba(20,19,15,0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#F5EFE2',
    }}
  >
    <div className='mono tnum' style={{ fontSize: 16, lineHeight: 1, color: '#C9A55A' }}>{score}</div>
    <div style={{ fontSize: 8, letterSpacing: '0.12em', marginTop: 2, fontFamily: 'var(--f-mono)', opacity: 0.6 }}>
      LRM
    </div>
  </div>
);

export const PropertyArt = ({ style }: { style: 'colonial' | 'hacienda' | 'villa' | undefined }) => {
  if (style === 'colonial') {
    return (
      <svg
        viewBox='0 0 400 280'
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        preserveAspectRatio='xMidYMid slice'
      >
        <rect width='400' height='280' fill='#D9CFB8' opacity='0.4' />
        <circle cx='320' cy='80' r='28' fill='#C9A55A' opacity='0.85' />
        <g opacity='0.85' fill='#14130F'>
          <rect x='160' y='120' width='80' height='120' />
          <polygon points='160,120 200,70 240,120' />
          <rect x='190' y='40' width='20' height='80' />
          <polygon points='185,40 200,15 215,40' />
          <rect x='120' y='160' width='40' height='80' />
          <rect x='240' y='160' width='40' height='80' />
          <rect x='0' y='200' width='120' height='80' />
          <rect x='280' y='200' width='120' height='80' />
        </g>
      </svg>
    );
  }
  if (style === 'hacienda') {
    return (
      <svg
        viewBox='0 0 400 280'
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        preserveAspectRatio='xMidYMid slice'
      >
        <rect width='400' height='280' fill='#1F3A2E' opacity='0.5' />
        <polygon points='0,140 80,80 160,130 240,70 320,120 400,90 400,180 0,180' fill='#1F3A2E' opacity='0.6' />
        <g fill='#1F3A2E'>
          <rect x='40' y='160' width='320' height='100' />
          <polygon points='40,160 80,130 360,130 400,160' fill='#14130F' />
        </g>
        <g fill='#C9A55A' opacity='0.6'>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={70 + i * 40} y='190' width='12' height='40' rx='6' />
          ))}
        </g>
      </svg>
    );
  }
  return (
    <svg
      viewBox='0 0 400 280'
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      preserveAspectRatio='xMidYMid slice'
    >
      <rect width='400' height='280' fill='#D9CFB8' opacity='0.5' />
      <g fill='#14130F' opacity='0.85'>
        <rect x='80' y='100' width='180' height='160' />
        <rect x='200' y='60' width='140' height='200' fill='#2A2722' />
      </g>
      <rect x='40' y='240' width='320' height='20' fill='#3F6B55' opacity='0.6' />
    </svg>
  );
};

// Editorial 2-column property card per the design bundle. Renders the
// hero photo if `images[0]` exists; otherwise falls back to PropertyArt
// + accent2 background so the slot is never empty. Wraps in a Next Link
// for slug-based navigation to /properties/[slug].
export const PropertyCardLarge = ({ p }: { p: Property }) => {
  const heroSrc = p.images?.[0];
  const priceLabel = p.priceUsd
    ? `$${(p.priceUsd / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
    : p.price;
  const grossLabel =
    p.annualGrossLow && p.annualGrossHigh
      ? `$${Math.round(p.annualGrossLow / 1000)}–$${Math.round(p.annualGrossHigh / 1000)}K`
      : p.annualGross;
  const adrLabel =
    p.adrLow && p.adrHigh ? `$${p.adrLow}–$${p.adrHigh}` : p.adr;

  return (
    <Link
      href={`/properties/${p.slug}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#FAF6EC',
        border: '1px solid rgba(20,19,15,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 24px 60px rgba(20,19,15,0.12)';
        e.currentTarget.style.borderColor = '#14130F';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'rgba(20,19,15,0.1)';
      }}
    >
      <div
        style={{
          height: 360,
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
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
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
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(245,239,226,0.85)',
          }}
        >
          ▶ Tour available
        </div>
      </div>

      <div style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div className='display' style={{ fontSize: 28, lineHeight: 1.05 }}>{p.name}</div>
          <div className='display tnum' style={{ fontSize: 22 }}>{priceLabel}</div>
        </div>
        <div className='mono' style={{ fontSize: 11, color: '#3A362F', letterSpacing: '0.08em', marginTop: 8 }}>
          {p.bedrooms} BD
          {p.baths ? ` · ${p.baths} BA` : ''}
          {p.sqm ? ` · ${p.sqm} M²` : ''}
          {p.rooftop ? ' · Rooftop' : ''}
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: '#2A2722', lineHeight: 1.6 }}>{p.thesis}</p>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 24,
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
            <div className='mono tnum' style={{ fontSize: 16, marginTop: 4, color: '#1F3A2E' }}>{grossLabel}</div>
          </div>
          <div>
            <div className='data-label'>Upgrade thesis</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{p.upgradePotential}</div>
          </div>
          <div>
            <div className='data-label'>Y2 occupancy</div>
            <div className='mono tnum' style={{ fontSize: 16, marginTop: 4 }}>
              {p.occupancyPercent ? `${p.occupancyPercent}%` : p.occupancy}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <span className='btn btn-primary' style={{ flex: 1 }}>View Investment Memo →</span>
        </div>
      </div>
    </Link>
  );
};

// ===========================================================================
// Legacy components kept for pages that haven't been redesigned yet.
// PropertyCard renders the simple Tailwind-styled card; new pages should use
// PropertyCardLarge instead.
// ===========================================================================

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className='mb-6'>
    <h2 className='text-3xl font-semibold'>{title}</h2>
    <p className='mt-2 text-white/70'>{subtitle}</p>
  </div>
);

export const PropertyCard = ({ p }: { p: Property }) => {
  const heroSrc = p.images?.[0];
  return (
    <motion.div whileHover={{ y: -4 }} className='card p-4'>
      <div className='h-40 rounded-xl overflow-hidden bg-green/40 relative'>
        {heroSrc && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroSrc}
            alt={p.name}
            className='absolute inset-0 h-full w-full object-cover'
            loading='lazy'
          />
        )}
      </div>
      <h3 className='mt-4 text-xl'>{p.name}</h3>
      <p className='text-white/70'>{p.neighborhood} · {p.bedrooms} BR · {p.price}</p>
      <p className='mt-2 text-sm'>ADR {p.adr}</p>
      <p className='text-sm'>Annual Gross {p.annualGross}</p>
      <p className='mt-2 text-sm text-sand'>{p.upgradePotential}</p>
      <Link className='mt-3 inline-block text-gold' href={`/properties/${p.slug}`}>View Investment Memo</Link>
    </motion.div>
  );
};

export const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className='card p-4'>
    <div className='text-2xl text-sand'>{value}</div>
    <div className='text-sm text-white/70'>{label}</div>
  </div>
);

export const DataChartCard = ({
  title, data, x, y, line,
}: {
  title: string;
  data: any[];
  x: string;
  y: string;
  line?: boolean;
}) => (
  <div className='card p-4'>
    <h3 className='mb-3'>{title}</h3>
    <div className='h-56'>
      {line ? (
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333' />
            <XAxis dataKey={x} stroke='#F4F0E6' />
            <YAxis stroke='#F4F0E6' />
            <Tooltip />
            <Line dataKey={y} stroke='#BFA160' />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey={x} stroke='#F4F0E6' />
            <YAxis stroke='#F4F0E6' />
            <Tooltip />
            <Bar dataKey={y} fill='#2B4A3F' />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);
