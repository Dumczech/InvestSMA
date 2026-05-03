import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/data/cms';
import {
  getMemoEditorial,
  getMemoCopy,
  type MemoEditorial,
  type MemoCopy,
} from '@/lib/data/editorial';
import { Disclaimer, StickyCTA, PropertyArt } from '@/components/site';
import type { Property } from '@/types/property';

export const dynamic = 'force-dynamic';

// Faithful port of design5/.../memo.jsx — the Property Investment Memo.
// Numeric figures (cap rate, cash-on-cash, payback) are derived from the
// property's existing numeric columns. Section content (thesis bullets,
// upgrades, management, risks) is editorial copy curated by LRM and lives
// inline; can be moved to site_content if/when admins need to edit per-
// property without code changes.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return { title: 'Property memo not found · InvestSMA' };
  return {
    title: `${p.name} · Investment Memo · InvestSMA`,
    description: p.thesis,
  };
}

export default async function MemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p, memo, copy] = await Promise.all([
    getPropertyBySlug(slug),
    getMemoEditorial(),
    getMemoCopy(),
  ]);
  if (!p) notFound();

  return (
    <div className='doc-page' data-screen-label='Memo'>
      <MemoHero p={p} copy={copy} />
      <Thesis p={p} thesis={memo.thesis} copy={copy} />
      <Revenue p={p} memo={memo} copy={copy} />
      <Seasonal events={memo.seasonal_events} copy={copy} />
      <Upgrades p={p} upgrades={memo.upgrades} copy={copy} />
      <ManagementStrategy management={memo.management} stats={memo.management_stats} copy={copy} />
      <Risks risks={memo.risks} copy={copy} />
      <Comps p={p} copy={copy} />
      <MemoCTA p={p} copy={copy} />
      <Disclaimer />
      <StickyCTA
        label={`Underwriting · ${p.name}`}
        cta='Request Memo'
        href={`/contact?intent=underwriting&property=${slug}`}
      />
    </div>
  );
}

// ===========================================================================
// Hero
// ===========================================================================

function MemoHero({ p, copy }: { p: Property; copy: MemoCopy }) {
  const priceUsd = p.priceUsd ?? 0;
  const grossLow = p.annualGrossLow ?? 0;
  const capRate = priceUsd ? (grossLow * 0.65) / priceUsd * 100 : 0;
  const cashOnCash = priceUsd ? (grossLow * 0.55) / (priceUsd * 0.3) * 100 : 0;
  const memoCode = p.slug.toUpperCase().replace(/[^A-Z0-9]/g, '-');
  const heroImages = p.images.slice(0, 3);

  return (
    <section
      className='surface-dark'
      style={{ background: '#14130F', color: '#F5EFE2', position: 'relative', overflow: 'hidden' }}
    >
      <div className='container' style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: 24,
            borderBottom: '1px solid rgba(245,239,226,0.15)',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(245,239,226,0.6)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Link href='/properties' style={{ color: '#C9A55A' }}>{copy.topbar_back_label}</Link>
          <span>{copy.topbar_center_label}</span>
          <span>Sample · LRM-{memoCode}-26 · Q1 2026</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: 64,
            paddingTop: 56,
            paddingBottom: 24,
          }}
          className='memo-title-grid'
        >
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>
              {p.neighborhood} · {p.bedrooms} BD{p.baths ? ` / ${p.baths} BA` : ''}
            </div>
            <h1
              className='display'
              style={{
                fontSize: 'clamp(56px, 7vw, 96px)',
                margin: '20px 0 0',
                color: '#F5EFE2',
                letterSpacing: '-0.025em',
                lineHeight: 0.95,
              }}
            >
              {p.name}
            </h1>
            <p
              style={{
                marginTop: 24,
                fontSize: 18,
                lineHeight: 1.5,
                color: 'rgba(245,239,226,0.78)',
                maxWidth: 540,
              }}
            >
              {p.thesis}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              {typeof p.score === 'number' && (
                <span className='chip' style={{ borderColor: '#C9A55A', color: '#C9A55A' }}>
                  LRM Score · {p.score}
                </span>
              )}
              <span className='chip' style={{ borderColor: 'rgba(245,239,226,0.25)', color: 'rgba(245,239,226,0.85)' }}>
                Turnkey-eligible
              </span>
              {p.rooftop && (
                <span className='chip' style={{ borderColor: 'rgba(245,239,226,0.25)', color: 'rgba(245,239,226,0.85)' }}>
                  Parroquia view
                </span>
              )}
              <span className='chip chip-green' style={{ borderColor: '#3F6B55', color: '#3F6B55' }}>
                Off-market
              </span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(245,239,226,0.05)',
              border: '1px solid rgba(245,239,226,0.12)',
              padding: 28,
            }}
          >
            <div className='data-label' style={{ color: '#C9A55A' }}>{copy.deal_terms_eyebrow}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
              <div>
                <div className='data-label'>List price</div>
                <div className='display tnum' style={{ fontSize: 36, marginTop: 6 }}>
                  {priceUsd ? `$${(priceUsd / 1_000_000).toFixed(2)}M` : p.price}
                </div>
              </div>
              <div>
                <div className='data-label'>Est. gross / yr</div>
                <div className='display tnum' style={{ fontSize: 36, marginTop: 6, color: '#C9A55A' }}>
                  {grossLow ? `$${Math.round(grossLow / 1000)}K` : p.annualGross}
                </div>
              </div>
              <div>
                <div className='data-label'>Cap rate (yr 2)</div>
                <div className='mono tnum' style={{ fontSize: 22, marginTop: 6 }}>
                  {capRate ? `${capRate.toFixed(1)}%` : '—'}
                </div>
              </div>
              <div>
                <div className='data-label'>Cash-on-cash</div>
                <div className='mono tnum' style={{ fontSize: 22, marginTop: 6 }}>
                  {cashOnCash ? `${cashOnCash.toFixed(1)}%` : '—'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(245,239,226,0.1)' }}>
              <Link
                href={`/contact?intent=underwriting&property=${p.slug}`}
                className='btn btn-gold'
                style={{ width: '100%' }}
              >
                {copy.deal_cta_label}
              </Link>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  color: 'rgba(245,239,226,0.5)',
                  marginTop: 10,
                  textAlign: 'center',
                  letterSpacing: '0.08em',
                }}
              >
                {copy.deal_cta_footnote}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginTop: 24 }}
          className='memo-hero-strip'
        >
          <HeroImage src={heroImages[0]} accent={p.accent2} style={p.style} caption='▶ Hero Tour · 4:32' />
          <HeroImage src={heroImages[1]} accent={p.accent2} style={p.style ?? 'villa'} dim />
          <HeroImage
            src={heroImages[2]}
            accent={p.accent2}
            style={p.style === 'colonial' ? 'hacienda' : (p.style ?? 'colonial')}
            cornerCaption={`+${Math.max(0, p.images.length - 3) || 14} photos`}
          />
        </div>
      </div>
    </section>
  );
}

function HeroImage({
  src,
  accent,
  style,
  caption,
  cornerCaption,
  dim,
}: {
  src: string | undefined;
  accent: string | undefined;
  style: 'colonial' | 'hacienda' | 'villa' | undefined;
  caption?: string;
  cornerCaption?: string;
  dim?: boolean;
}) {
  return (
    <div
      style={{
        height: 480,
        background: accent || '#D9CFB8',
        position: 'relative',
        overflow: 'hidden',
        opacity: dim ? 0.92 : 1,
      }}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=''
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          loading='lazy'
        />
      ) : (
        <PropertyArt style={style} />
      )}
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            color: '#F5EFE2',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'rgba(20,19,15,0.7)',
            padding: '6px 10px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {caption}
        </div>
      )}
      {cornerCaption && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: '#F5EFE2',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {cornerCaption}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Section wrapper
// ===========================================================================

function Section({
  num,
  title,
  subtitle,
  children,
  dark,
}: {
  num: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={dark ? 'surface-dark' : ''}
      style={{
        padding: '96px 0',
        background: dark ? '#14130F' : '#FBF8F0',
        color: dark ? '#F5EFE2' : '#14130F',
      }}
    >
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, marginBottom: 48 }}
          className='memo-section-head'
        >
          <div>
            <div className='lead-num' style={{ color: dark ? '#C9A55A' : undefined }}>§ {num}</div>
            <h2
              className='display'
              style={{ fontSize: 48, lineHeight: 1, marginTop: 12, letterSpacing: '-0.025em' }}
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p
              style={{ alignSelf: 'end', maxWidth: 480, fontSize: 15, lineHeight: 1.6, opacity: 0.75 }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

// ===========================================================================
// Section 01 — Thesis
// ===========================================================================

function Thesis({
  p,
  thesis,
  copy,
}: {
  p: Property;
  thesis: MemoEditorial['thesis'];
  copy: MemoCopy;
}) {
  const points = thesis.map(pt => ({
    t: pt.t,
    d: pt.d.replace(/\{neighborhood\}/g, p.neighborhood ?? 'This neighborhood'),
  }));
  return (
    <Section num='01' title={copy.thesis_title} subtitle={copy.thesis_subtitle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }} className='memo-grid-2'>
        {points.map((pt, i) => (
          <div key={i} style={{ paddingTop: 20, borderTop: '1px solid rgba(20,19,15,0.2)' }}>
            <div className='mono tnum' style={{ fontSize: 11, color: '#B08A3E', letterSpacing: '0.12em' }}>0{i + 1}</div>
            <div className='display' style={{ fontSize: 26, marginTop: 8 }}>{pt.t}</div>
            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: '#2A2722' }}>{pt.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ===========================================================================
// Section 02 — Revenue
// ===========================================================================

function Revenue({ p, memo, copy }: { p: Property; memo: MemoEditorial; copy: MemoCopy }) {
  const adrLow = p.adrLow ?? 0;
  const adrHigh = p.adrHigh ?? 0;
  const grossLow = p.annualGrossLow ?? 0;
  const grossHigh = p.annualGrossHigh ?? 0;
  const occ = p.occupancyPercent ?? 65;
  const baseADR = adrLow && adrHigh ? (adrLow + adrHigh) / 2 : adrLow || adrHigh || 0;
  const ADR_FACTOR = memo.adr_factor;

  return (
    <Section
      num='02'
      title={copy.revenue_title}
      subtitle={copy.revenue_subtitle}
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}
        className='memo-grid-3'
      >
        <DataCard
          label='ADR · Range'
          value={adrLow && adrHigh ? `$${adrLow}–$${adrHigh}` : p.adr}
          sub={baseADR ? `Avg $${Math.round(baseADR)}` : undefined}
        />
        <DataCard label='Occupancy · Year 1' value={occ ? `${occ - 8}%` : '—'} sub='Stabilizing' />
        <DataCard label='Occupancy · Year 2+' value={occ ? `${occ}%` : p.occupancy} sub='Steady-state' />
        <DataCard
          label='Gross revenue · Y1'
          value={grossLow ? `$${Math.round((grossLow * 0.85) / 1000)}K` : '—'}
          sub='Base case'
        />
        <DataCard
          label='Gross revenue · Y2'
          value={grossLow ? `$${Math.round(grossLow / 1000)}K` : '—'}
          sub='Base case'
          highlight
        />
        <DataCard
          label='Gross revenue · Y2 bull'
          value={grossHigh ? `$${Math.round(grossHigh / 1000)}K` : '—'}
          sub='Top quartile'
        />
      </div>

      <div style={{ background: '#FAF6EC', border: '1px solid rgba(20,19,15,0.1)', padding: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div className='data-label'>Fig. M1 · Monthly Revenue Forecast (Y2 base case)</div>
            <div className='display' style={{ fontSize: 22, marginTop: 6 }}>
              ${grossLow ? Math.round((grossLow / 12) / 1000) : '—'}K average · seasonal swing ${Math.round((adrLow || 0) * ADR_FACTOR[5])}–${Math.round((adrHigh || 0) * ADR_FACTOR[11])} ADR
            </div>
          </div>
        </div>
        <RevenueChart baseADR={baseADR} occ={occ} memo={memo} />
      </div>
    </Section>
  );
}

function RevenueChart({
  baseADR,
  occ,
  memo,
}: {
  baseADR: number;
  occ: number;
  memo: MemoEditorial;
}) {
  const MONTHS = memo.monthly_labels;
  const SEASONALITY = memo.seasonality;
  const ADR_FACTOR = memo.adr_factor;
  const w = 1100;
  const h = 280;
  const pad = 50;
  const bw = (w - pad * 2) / MONTHS.length;
  const monthlyRev = MONTHS.map((_, i) => {
    const adr = baseADR * (ADR_FACTOR[i] ?? 1);
    const o = ((SEASONALITY[i] ?? 60) / 100) * (occ / 65);
    return adr * 30 * o;
  });
  const max = Math.max(...monthlyRev) * 1.1 || 1;

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const v = max * f;
        const y = h - pad - f * (h - pad * 2);
        return (
          <g key={i}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke='rgba(20,19,15,0.08)' strokeWidth='0.5' />
            <text x={pad - 8} y={y + 3} fontSize='9' fill='rgba(20,19,15,0.5)' textAnchor='end' fontFamily='var(--f-mono)'>
              ${(v / 1000).toFixed(0)}K
            </text>
          </g>
        );
      })}
      {monthlyRev.map((v, i) => {
        const barH = (v / max) * (h - pad * 2);
        const isPeak = SEASONALITY[i] > 75;
        return (
          <g key={i}>
            <rect
              x={pad + i * bw + bw * 0.2}
              y={h - pad - barH}
              width={bw * 0.6}
              height={barH}
              fill={isPeak ? '#1F3A2E' : '#B08A3E'}
              opacity={isPeak ? 1 : 0.55}
            />
            <text
              x={pad + i * bw + bw / 2}
              y={h - pad + 14}
              fontSize='9'
              fill='rgba(20,19,15,0.6)'
              textAnchor='middle'
              fontFamily='var(--f-mono)'
            >
              {MONTHS[i]}
            </text>
            {isPeak && (
              <text
                x={pad + i * bw + bw / 2}
                y={h - pad - barH - 6}
                fontSize='9'
                fill='#1F3A2E'
                textAnchor='middle'
                fontFamily='var(--f-mono)'
              >
                ${(v / 1000).toFixed(0)}K
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DataCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px',
        background: highlight ? '#1F3A2E' : '#FAF6EC',
        border: '1px solid ' + (highlight ? '#1F3A2E' : 'rgba(20,19,15,0.1)'),
        color: highlight ? '#F5EFE2' : '#14130F',
      }}
    >
      <div className='data-label' style={{ color: highlight ? '#C9A55A' : '#3A362F' }}>{label}</div>
      <div className='display tnum' style={{ fontSize: 32, marginTop: 8 }}>{value}</div>
      {sub && (
        <div className='mono' style={{ fontSize: 11, marginTop: 4, opacity: 0.6, letterSpacing: '0.06em' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Section 03 — Seasonal
// ===========================================================================

function Seasonal({
  events,
  copy,
}: {
  events: MemoEditorial['seasonal_events'];
  copy: MemoCopy;
}) {
  return (
    <Section
      num='03'
      title={copy.seasonal_title}
      subtitle={copy.seasonal_subtitle}
    >
      <div style={{ overflow: 'hidden', border: '1px solid rgba(20,19,15,0.15)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
            padding: '14px 24px',
            background: '#14130F',
            color: '#C9A55A',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {copy.seasonal_cols.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
              padding: '20px 24px',
              borderBottom: i < events.length - 1 ? '1px solid rgba(20,19,15,0.1)' : 'none',
              background: i % 2 === 0 ? '#FBF8F0' : '#F5EFE2',
              alignItems: 'center',
            }}
          >
            <span className='display' style={{ fontSize: 22 }}>{e.period}</span>
            <span className='mono' style={{ fontSize: 13 }}>{e.date}</span>
            <span className='mono tnum' style={{ fontSize: 18, color: '#1F3A2E' }}>{e.adr}</span>
            <span className='mono tnum' style={{ fontSize: 18 }}>{e.occ}</span>
            <span style={{ fontSize: 12, color: '#3A362F' }}>{e.notes}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ===========================================================================
// Section 04 — Upgrades
// ===========================================================================

function Upgrades({
  p,
  upgrades,
  copy,
}: {
  p: Property;
  upgrades: MemoEditorial['upgrades'];
  copy: MemoCopy;
}) {
  const total = upgrades.reduce((s, u) => s + u.cost, 0);
  return (
    <Section
      num='04'
      title={copy.upgrades_title}
      subtitle={`${p.upgradePotential}. Total upgrade budget — $${(total / 1000).toFixed(0)}K — recoverable in 1.8 years on base case.`}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }} className='memo-upgrades-grid'>
        <div>
          {upgrades.map((u, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2fr 1fr 1fr 1fr',
                gap: 20,
                padding: '20px 0',
                alignItems: 'center',
                borderTop: i === 0 ? '1px solid rgba(20,19,15,0.2)' : 'none',
                borderBottom: '1px solid rgba(20,19,15,0.1)',
              }}
            >
              <span className='mono tnum' style={{ color: '#B08A3E', fontSize: 11 }}>0{i + 1}</span>
              <span style={{ fontSize: 16 }}>{u.item}</span>
              <span className='mono tnum' style={{ fontSize: 14 }}>${(u.cost / 1000).toFixed(0)}K</span>
              <span className='mono tnum' style={{ fontSize: 14, color: '#1F3A2E' }}>{u.lift}</span>
              <span className='mono tnum' style={{ fontSize: 14, color: '#B08A3E' }}>{u.payback}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#1F3A2E', color: '#F5EFE2', padding: 32 }}>
          <div className='data-label' style={{ color: '#C9A55A' }}>{copy.upgrades_summary_label}</div>
          <div className='display tnum' style={{ fontSize: 56, marginTop: 16, lineHeight: 1 }}>
            ${(total / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{copy.upgrades_summary_caption}</div>
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(245,239,226,0.15)' }}>
            <div className='data-label' style={{ color: '#C9A55A' }}>{copy.upgrades_lift_label}</div>
            <div className='mono tnum' style={{ fontSize: 24, marginTop: 8, color: '#C9A55A' }}>{copy.upgrades_lift_value}</div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(245,239,226,0.15)' }}>
            <div className='data-label' style={{ color: '#C9A55A' }}>{copy.upgrades_payback_label}</div>
            <div className='mono tnum' style={{ fontSize: 24, marginTop: 8 }}>{copy.upgrades_payback_value}</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ===========================================================================
// Section 05 — Management strategy (dark)
// ===========================================================================

function ManagementStrategy({
  management,
  stats,
  copy,
}: {
  management: MemoEditorial['management'];
  stats: MemoEditorial['management_stats'];
  copy: MemoCopy;
}) {
  const cols = management.map(m => ({ stage: m.phase, items: m.items }));
  return (
    <Section
      num='05'
      title={copy.management_title}
      subtitle={copy.management_subtitle}
      dark
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className='memo-strategy-grid'>
        {cols.map((c, i) => (
          <div key={i} style={{ borderTop: '1px solid #C9A55A', paddingTop: 24 }}>
            <div className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.16em' }}>
              PHASE 0{i + 1}
            </div>
            <div className='display' style={{ fontSize: 28, marginTop: 12, color: '#F5EFE2' }}>{c.stage}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
              {c.items.map((it, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'rgba(245,239,226,0.8)',
                    paddingLeft: 16,
                    position: 'relative',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, color: '#C9A55A' }}>—</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 64,
          padding: 32,
          background: 'rgba(245,239,226,0.05)',
          border: '1px solid rgba(245,239,226,0.12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 32,
        }}
        className='memo-strategy-stats'
      >
        {stats.map((s, i) => (
          <div key={i}>
            <div className='display tnum' style={{ fontSize: 36, color: '#C9A55A' }}>{s.v}</div>
            <div className='data-label' style={{ marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ===========================================================================
// Section 06 — Risks
// ===========================================================================

function Risks({ risks, copy }: { risks: MemoEditorial['risks']; copy: MemoCopy }) {
  return (
    <Section
      num='06'
      title={copy.risks_title}
      subtitle={copy.risks_subtitle}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }} className='memo-grid-2'>
        {risks.map((r, i) => (
          <div key={i} style={{ borderLeft: '2px solid #B08A3E', paddingLeft: 24 }}>
            <div className='mono tnum' style={{ fontSize: 11, color: '#B08A3E', letterSpacing: '0.16em' }}>
              RISK 0{i + 1}
            </div>
            <div className='display' style={{ fontSize: 26, marginTop: 8 }}>{r.t}</div>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: '#2A2722' }}>{r.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ===========================================================================
// Section 07 — Comps
// ===========================================================================

function Comps({ p, copy }: { p: Property; copy: MemoCopy }) {
  const sqm = p.sqm ?? 380;
  const beds = p.bedrooms || 4;
  const priceUsd = p.priceUsd ?? 0;
  const idHash = parseInt(p.slug.replace(/\D/g, '') || '7', 10) || 7;

  const comps = [
    { ref: 'COMP-A', addr: `Cuna de Allende ${1000 + idHash * 7}`, dist: '0.3 km', sqm: sqm + 35, beds, sold: priceUsd * 1.08, ppm: priceUsd ? Math.round(priceUsd * 1.08 / (sqm + 35)) : 0, date: "Feb '26", delta: '+8.0%' },
    { ref: 'COMP-B', addr: 'Hernández Macías', dist: '0.5 km', sqm: sqm - 20, beds: Math.max(1, beds - 1), sold: priceUsd * 0.92, ppm: priceUsd ? Math.round(priceUsd * 0.92 / (sqm - 20)) : 0, date: "Dec '25", delta: '−7.5%' },
    { ref: 'COMP-C', addr: 'Recreo', dist: '0.7 km', sqm: sqm + 60, beds: beds + 1, sold: priceUsd * 1.18, ppm: priceUsd ? Math.round(priceUsd * 1.18 / (sqm + 60)) : 0, date: "Nov '25", delta: '+18.4%' },
    { ref: 'COMP-D', addr: '— gated —', dist: '— gated —', sqm: sqm + 10, beds, sold: 0, ppm: 0, date: '— gated —', delta: '— gated —', gated: true },
    { ref: 'COMP-E', addr: '— gated —', dist: '— gated —', sqm: sqm - 8, beds, sold: 0, ppm: 0, date: '— gated —', delta: '— gated —', gated: true },
  ];
  const subjectPpm = priceUsd ? Math.round(priceUsd / sqm) : 0;

  return (
    <Section
      num='07'
      title={copy.comps_title}
      subtitle={copy.comps_subtitle}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className='memo-grid-4'>
        <DataCard label='Subject · $/m²' value={subjectPpm ? `$${subjectPpm.toLocaleString()}` : '—'} sub='List basis' />
        <DataCard
          label='Cohort median · $/m²'
          value={subjectPpm ? `$${Math.round(subjectPpm * 1.06).toLocaleString()}` : '—'}
          sub='5 trades, 12 mo'
          highlight
        />
        <DataCard label='Variance to median' value='−5.7%' sub='Subject below comps' />
        <DataCard label='Days on market · avg' value='42' sub='Cohort, off-market' />
      </div>

      <div style={{ border: '1px solid rgba(20,19,15,0.12)', background: '#FFFFFF', overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '70px 1.6fr 0.7fr 0.7fr 0.5fr 1fr 1fr 0.8fr 0.7fr',
            padding: '14px 20px',
            background: 'rgba(20,19,15,0.04)',
            borderBottom: '1px solid rgba(20,19,15,0.12)',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(20,19,15,0.6)',
            minWidth: 920,
          }}
        >
          <span>Ref</span>
          <span>Address</span>
          <span>Dist.</span>
          <span>m²</span>
          <span>BD</span>
          <span>Sold</span>
          <span>$/m²</span>
          <span>Date</span>
          <span>Δ vs subj.</span>
        </div>
        {comps.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1.6fr 0.7fr 0.7fr 0.5fr 1fr 1fr 0.8fr 0.7fr',
              padding: '18px 20px',
              borderBottom: i < comps.length - 1 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              alignItems: 'baseline',
              fontSize: 14,
              opacity: c.gated ? 0.55 : 1,
              minWidth: 920,
            }}
          >
            <span className='mono tnum' style={{ fontSize: 11, color: '#C9A55A' }}>{c.ref}</span>
            <span style={{ fontStyle: c.gated ? 'italic' : 'normal' }}>{c.addr}</span>
            <span className='mono tnum' style={{ fontSize: 12 }}>{c.dist}</span>
            <span className='mono tnum'>{c.sqm}</span>
            <span className='mono tnum'>{c.beds}</span>
            <span className='mono tnum' style={{ filter: c.gated ? 'blur(5px)' : 'none', color: '#1F3A2E' }}>
              {c.gated || !c.sold ? '$X.XXM' : `$${(c.sold / 1_000_000).toFixed(2)}M`}
            </span>
            <span className='mono tnum' style={{ filter: c.gated ? 'blur(5px)' : 'none' }}>
              {c.gated || !c.ppm ? '$XX,XXX' : `$${c.ppm.toLocaleString()}`}
            </span>
            <span className='mono tnum' style={{ fontSize: 12 }}>{c.date}</span>
            <span
              className='mono tnum'
              style={{
                color: c.delta.startsWith('+') ? '#3F6B55' : c.delta.startsWith('−') ? '#8B6F47' : 'rgba(20,19,15,0.4)',
                fontSize: 12,
              }}
            >
              {c.delta}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: '16px 20px',
          background: 'rgba(201,165,90,0.08)',
          borderLeft: '3px solid #C9A55A',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div className='data-label' style={{ color: '#8E6F2D' }}>{copy.comps_gated_label}</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{copy.comps_gated_caption}</div>
        </div>
        <Link href={`/contact?intent=underwriting&property=${p.slug}#comps`} className='btn btn-gold' style={{ flexShrink: 0 }}>
          {copy.comps_unlock_label}
        </Link>
      </div>
    </Section>
  );
}

// ===========================================================================
// Final CTA
// ===========================================================================

function MemoCTA({ p, copy }: { p: Property; copy: MemoCopy }) {
  const shown = copy.cta_shown;
  const gated = copy.cta_gated;

  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0' }}>
      <div className='container'>
        <div
          style={{
            borderTop: '1px solid rgba(245,239,226,0.15)',
            paddingTop: 24,
            marginBottom: 64,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(245,239,226,0.5)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span>{copy.cta_topbar_label}</span>
          <span>{copy.cta_topbar_response}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className='memo-cta-grid'>
          <div>
            <h2
              className='display'
              style={{
                fontSize: 'clamp(48px, 6vw, 80px)',
                margin: 0,
                lineHeight: 0.96,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-line',
              }}
            >
              {copy.cta_headline_pre}
              <span className='display-italic' style={{ color: '#C9A55A' }}>{copy.cta_headline_italic}</span>
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                color: 'rgba(245,239,226,0.78)',
                maxWidth: 480,
                marginTop: 28,
              }}
            >
              {copy.cta_paragraph}
            </p>

            <div
              style={{
                marginTop: 40,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              {copy.cta_steps.map(s => (
                <div key={s.n} style={{ borderTop: '1px solid rgba(201,165,90,0.4)', paddingTop: 12 }}>
                  <div className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.12em' }}>{s.n}</div>
                  <div style={{ fontSize: 16, marginTop: 6, fontWeight: 500 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,239,226,0.6)', marginTop: 2 }}>{s.d}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              <Link href={`/contact?intent=underwriting&property=${p.slug}`} className='btn btn-gold'>
                Request package · {p.name.split(' ').slice(0, 2).join(' ')} →
              </Link>
              <Link href='/properties' className='btn btn-ghost' style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.3)' }}>
                {copy.cta_compare_label}
              </Link>
            </div>
            <div
              className='mono'
              style={{
                fontSize: 10,
                color: 'rgba(245,239,226,0.5)',
                marginTop: 16,
                letterSpacing: '0.08em',
              }}
            >
              {copy.cta_footnote}
            </div>
          </div>

          <div style={{ background: 'rgba(245,239,226,0.04)', border: '1px solid rgba(245,239,226,0.12)' }}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(245,239,226,0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div>
                <div className='data-label' style={{ color: 'rgba(245,239,226,0.5)' }}>On this page</div>
                <div className='display' style={{ fontSize: 22, marginTop: 4 }}>{copy.cta_shown_label}</div>
              </div>
              <span className='mono' style={{ fontSize: 10, color: 'rgba(245,239,226,0.5)', letterSpacing: '0.08em' }}>
                {shown.length} ITEMS
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {shown.map((x, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '12px 24px',
                    alignItems: 'baseline',
                    fontSize: 13,
                    color: 'rgba(245,239,226,0.85)',
                  }}
                >
                  <span style={{ color: '#3F6B55', fontSize: 12 }}>✓</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid rgba(245,239,226,0.12)',
                borderBottom: '1px solid rgba(245,239,226,0.12)',
                background: 'rgba(201,165,90,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div>
                <div className='data-label' style={{ color: '#C9A55A' }}>In the package</div>
                <div className='display' style={{ fontSize: 22, marginTop: 4, color: '#F5EFE2' }}>{copy.cta_gated_label}</div>
              </div>
              <span className='mono' style={{ fontSize: 10, color: '#C9A55A', letterSpacing: '0.08em' }}>
                {gated.length} ITEMS
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {gated.map((x, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '12px 24px',
                    alignItems: 'baseline',
                    fontSize: 13,
                    color: 'rgba(245,239,226,0.92)',
                  }}
                >
                  <span className='mono' style={{ color: '#C9A55A', fontSize: 10, minWidth: 16 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
