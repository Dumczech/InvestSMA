import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Disclaimer, StickyCTA } from '@/components/site';
import {
  getAboutContent,
  getAboutCopy,
  type AboutContent,
  type AboutCopy,
} from '@/lib/data/editorial';

export const metadata: Metadata = {
  title: 'About · InvestSMA',
  description:
    "InvestSMA is a research and lead-gen platform operated by Luxury Rental Management — operators, not brokers. Eleven years of San Miguel rental performance data informs every recommendation.",
};

export default async function AboutPage() {
  const [content, copy] = await Promise.all([getAboutContent(), getAboutCopy()]);
  return (
    <div className='doc-page' data-screen-label='About'>
      <Hero stats={content.stats} copy={copy} />
      <AreNotAre are_not={content.are_not} are={content.are} copy={copy} />
      <BrokerStructure />
      <Criteria />
      <Playbook />
      <PullQuote />
      <LRMSection />
      <ClosingCta copy={copy} />
      <Disclaimer />
      <StickyCTA label='Talk to the LRM team' cta='Request Access' href='/contact' />
    </div>
  );
}

// Reusable section header — keeps section starts visually consistent.
function SectionHeader({
  num,
  eyebrow,
  title,
  dark = false,
}: {
  num: string;
  eyebrow: string;
  title: ReactNode;
  dark?: boolean;
}) {
  const muted = dark ? 'rgba(245,239,226,0.55)' : 'rgba(20,19,15,0.55)';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <span className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}>§ {num}</span>
        <span className='mono' style={{ fontSize: 11, color: muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{eyebrow}</span>
      </div>
      <h2
        className='display'
        style={{
          fontSize: 'clamp(40px, 5vw, 72px)',
          margin: 0,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          maxWidth: 900,
          color: dark ? '#F5EFE2' : undefined,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Hero({ stats, copy }: { stats: AboutContent['stats']; copy: AboutCopy }) {
  return (
    <section
      className='surface-dark'
      style={{
        background: '#14130F',
        color: '#F5EFE2',
        paddingTop: 64,
        paddingBottom: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className='container'>
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
          {copy.topbar.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 80,
            paddingTop: 72,
            paddingBottom: 24,
            alignItems: 'end',
          }}
          className='hero-grid'
        >
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>{copy.hero_eyebrow}</div>
            <h1
              className='display'
              style={{
                fontSize: 'clamp(56px, 7vw, 104px)',
                margin: '20px 0 0',
                letterSpacing: '-0.025em',
                lineHeight: 0.94,
                whiteSpace: 'pre-line',
              }}
            >
              {copy.hero_headline_pre}
              <span className='display-italic' style={{ color: '#C9A55A' }}>
                {copy.hero_headline_italic}
              </span>
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(245,239,226,0.82)' }}>
              {copy.hero_paragraph}
            </p>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ borderTop: '1px solid rgba(201,165,90,0.4)', paddingTop: 12 }}>
                  <div className='display tnum' style={{ fontSize: 32, color: '#C9A55A' }}>{s.v}</div>
                  <div className='data-label' style={{ marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AreNotAre({
  are_not,
  are,
  copy,
}: {
  are_not: AboutContent['are_not'];
  are: AboutContent['are'];
  copy: AboutCopy;
}) {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <SectionHeader
          num='02'
          eyebrow='Positioning'
          title={
            <>
              {copy.positioning_title_pre}
              <span className='display-italic' style={{ color: '#1F3A2E' }}>{copy.positioning_title_italic}</span>
              {copy.positioning_title_post}
            </>
          }
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginTop: 64 }} className='are-grid'>
          {/* NOT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span className='mono tnum' style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.12em' }}>
                {copy.are_not_label}
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {are_not.map((x, i) => (
                <li
                  key={i}
                  style={{
                    padding: '20px 0',
                    borderTop: '1px solid rgba(20,19,15,0.1)',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr',
                    gap: 16,
                  }}
                >
                  <span
                    className='mono tnum'
                    style={{ color: 'rgba(20,19,15,0.4)', fontSize: 14, textDecoration: 'line-through' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div
                      className='display'
                      style={{
                        fontSize: 22,
                        color: 'rgba(20,19,15,0.55)',
                        marginBottom: 6,
                        textDecoration: 'line-through',
                        textDecorationColor: 'rgba(139,111,71,0.4)',
                      }}
                    >
                      {x.t}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(20,19,15,0.65)' }}>
                      {x.d}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ARE */}
          <div className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: 32, marginTop: -8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.12em' }}>
                {copy.are_label}
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(245,239,226,0.2)' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {are.map((x, i) => (
                <li
                  key={i}
                  style={{
                    padding: '20px 0',
                    borderTop: '1px solid rgba(245,239,226,0.1)',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr',
                    gap: 16,
                  }}
                >
                  <span className='mono tnum' style={{ color: '#C9A55A', fontSize: 14 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className='display' style={{ fontSize: 24, color: '#F5EFE2', marginBottom: 6 }}>
                      {x.t}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(245,239,226,0.78)' }}>
                      {x.d}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const BROKER_NODES = [
  { who: 'You',        role: 'Investor',                       color: '#14130F', desc: 'Brings capital + investment goals',  step: '01' },
  { who: 'Broker',     role: 'Trusted partner (yours or ours)', color: '#8B6F47', desc: 'Handles transaction · earns brokerage fee', step: '02' },
  { who: 'InvestSMA',  role: 'Operator',                       color: '#C9A55A', desc: 'Identifies + underwrites the asset', step: '03' },
  { who: 'LRM',        role: 'Management platform',            color: '#1F3A2E', desc: 'Operates the property post-close',   step: '04' },
];

function BrokerStructure() {
  return (
    <section style={{ background: '#FAF6EC', padding: '96px 0', borderTop: '1px solid rgba(20,19,15,0.08)', borderBottom: '1px solid rgba(20,19,15,0.08)' }}>
      <div className='container'>
        <SectionHeader
          num='03'
          eyebrow='Structure'
          title={<>Clean incentives, by <span className='display-italic' style={{ color: '#1F3A2E' }}>design</span>.</>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, marginTop: 56, alignItems: 'start' }} className='broker-grid'>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(20,19,15,0.78)' }}>
            We work alongside a network of trusted SMA brokers — we can introduce you to agents we know, or collaborate directly with yours. Either way, the deal closes through them. Our work begins after.
            <br /><br />
            This structure matters. It keeps incentives clean and lets us focus on what actually drives returns: identifying the right asset, then executing it properly post-close.
          </p>

          <div style={{ background: '#FFFFFF', border: '1px solid rgba(20,19,15,0.12)', padding: 32 }}>
            <div className='data-label' style={{ marginBottom: 24 }}>FIG. A · How a deal flows</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
              {BROKER_NODES.map((node, i, arr) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 16px 1fr', gap: 14, alignItems: 'center', padding: '14px 0' }}>
                    <span className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.08em' }}>{node.step}</span>
                    <span style={{ width: 12, height: 12, background: node.color, borderRadius: '50%' }} />
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span className='display' style={{ fontSize: 20 }}>{node.who}</span>
                        <span style={{ fontSize: 12, color: 'rgba(20,19,15,0.5)' }}>· {node.role}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(20,19,15,0.7)', marginTop: 2 }}>{node.desc}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ position: 'absolute', left: 46, top: 32, bottom: -10, width: 1, background: 'rgba(20,19,15,0.15)' }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed rgba(20,19,15,0.15)', fontSize: 12, color: 'rgba(20,19,15,0.6)', fontStyle: 'italic' }}>
              No double-dipping. No transaction commission to InvestSMA. Our fee is performance-based, post-close.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CRITERIA_ITEMS = [
  {
    n: '01',
    t: 'Location alpha',
    d: 'Prime or emerging neighborhoods with proven, repeatable tourism demand. Walkability to Jardín, Parroquia, or the principal restaurant corridors.',
    tag: 'Demand-side',
  },
  {
    n: '02',
    t: 'Revenue upside',
    d: 'Clear, identifiable opportunities to lift revenue through design, amenities, and listing positioning — not just market drift.',
    tag: 'Asset-level',
  },
  {
    n: '03',
    t: 'Outperformance ceiling',
    d: 'Properties where professional, hands-on management can structurally beat the market average — not just match it.',
    tag: 'Operator-driven',
  },
];

function Criteria() {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <SectionHeader
          num='04'
          eyebrow='Acquisition criteria'
          title={<>What we <span className='display-italic' style={{ color: '#1F3A2E' }}>look for</span>.</>}
        />
        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(20,19,15,0.7)', maxWidth: 640, marginTop: 24 }}>
          Three filters every deal has to clear before we recommend it. If a property doesn't pass all three, we pass.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 64 }} className='criteria-grid'>
          {CRITERIA_ITEMS.map(it => (
            <div key={it.n} style={{ background: '#FFFFFF', border: '1px solid rgba(20,19,15,0.1)', padding: 32, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
                <span className='display' style={{ fontSize: 56, color: '#C9A55A', lineHeight: 1, letterSpacing: '-0.02em' }}>{it.n}</span>
                <span className='chip'>{it.tag}</span>
              </div>
              <div className='display' style={{ fontSize: 28, lineHeight: 1.05, marginBottom: 14, letterSpacing: '-0.01em' }}>{it.t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(20,19,15,0.72)' }}>{it.d}</div>
              <div style={{ marginTop: 'auto', paddingTop: 28, borderTop: '1px solid rgba(20,19,15,0.08)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(20,19,15,0.4)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                <span>Filter {it.n}</span>
                <span>Pass / Fail</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '20px 24px', background: 'rgba(31,58,46,0.06)', borderLeft: '3px solid #1F3A2E', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16 }}>
          <div className='mono' style={{ fontSize: 12, color: 'rgba(20,19,15,0.7)' }}>
            <span style={{ color: '#1F3A2E', fontWeight: 600 }}>~7%</span> of properties we screen each quarter clear all three filters.
          </div>
          <Link href='/properties' className='mono' style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#14130F' }}>
            See current list →
          </Link>
        </div>
      </div>
    </section>
  );
}

const PLAYBOOK_PHASES = [
  { ph: 'Phase 1', day: 'Days 0–30', t: 'Design optimization',     d: 'Walk-through, photography brief, staging plan, capex priority list. We benchmark your property against the top 10% of comparable listings, not the median.' },
  { ph: 'Phase 2', day: 'Days 30–60', t: 'Listing positioning',     d: "Title, copy, and category strategy across Airbnb, Vrbo, Booking, and direct. Position determines who finds you and what they'll pay." },
  { ph: 'Phase 3', day: 'Ongoing',    t: 'Dynamic pricing',         d: 'ADR adjusted weekly using portfolio-wide demand signal — not just public competitor data, which lags by weeks.' },
  { ph: 'Phase 4', day: 'Ongoing',    t: 'Multi-channel distribution', d: 'Direct bookings (no platform fee), corporate/relocation channels, repeat guest list — diversifying the revenue base.' },
  { ph: 'Phase 5', day: 'Every stay', t: 'High-touch guest experience', d: 'On-the-ground concierge, premium linens, in-stay communication. The reviews compound; ADR and occupancy follow.' },
];

function Playbook() {
  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0' }}>
      <div className='container'>
        <SectionHeader
          num='05'
          eyebrow='Post-close playbook'
          dark
          title={<>Once the keys change hands, <span className='display-italic' style={{ color: '#C9A55A' }}>we execute.</span></>}
        />
        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', maxWidth: 640, marginTop: 24 }}>
          Most firms hand you keys and walk away. Our work starts there. The five phases below run in parallel and compound — that's where outperformance comes from.
        </p>

        <div style={{ marginTop: 64, borderTop: '1px solid rgba(245,239,226,0.15)' }}>
          {PLAYBOOK_PHASES.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 180px 1fr',
                gap: 32,
                padding: '28px 0',
                borderBottom: '1px solid rgba(245,239,226,0.12)',
                alignItems: 'baseline',
              }}
              className='playbook-row'
            >
              <div>
                <div className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.12em' }}>{p.ph}</div>
                <div style={{ fontSize: 13, color: 'rgba(245,239,226,0.55)', marginTop: 4 }}>{p.day}</div>
              </div>
              <div className='display' style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{p.t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', maxWidth: 560 }}>{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PullQuote() {
  return (
    <section style={{ background: '#C9A55A', color: '#14130F', padding: '120px 0', position: 'relative' }}>
      <div className='container'>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'baseline' }} className='pullquote-grid'>
          <div>
            <div className='data-label' style={{ color: 'rgba(20,19,15,0.6)' }}>§ 06</div>
            <div className='mono' style={{ fontSize: 11, color: 'rgba(20,19,15,0.6)', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              The whole thesis, in one line
            </div>
          </div>
          <blockquote style={{ margin: 0 }}>
            <div className='display' style={{ fontSize: 'clamp(40px, 5vw, 76px)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              <span style={{ color: 'rgba(20,19,15,0.35)', fontStyle: 'italic' }}>&ldquo;</span>
              We are <span className='display-italic'>not brokers.</span>
              <br />
              We are <span className='display-italic'>operators.</span>
              <span style={{ color: 'rgba(20,19,15,0.35)', fontStyle: 'italic' }}>&rdquo;</span>
            </div>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 640 }} className='pullquote-foot'>
              <div style={{ borderTop: '1px solid rgba(20,19,15,0.3)', paddingTop: 12 }}>
                <div style={{ fontSize: 16, lineHeight: 1.5 }}>
                  If the goal is simply to buy property, there are plenty of options.
                </div>
              </div>
              <div style={{ borderTop: '1px solid #14130F', paddingTop: 12 }}>
                <div style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 500 }}>
                  If the goal is to build a high-performing asset — that's where we come in.
                </div>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

const LRM_STATS = [
  { k: 'Properties under management', v: '40+',  s: 'High-end SMA inventory' },
  { k: 'Portfolio occupancy',         v: '63%',  s: 'Trailing 12-month avg.' },
  { k: 'Avg. ADR vs market',          v: '+38%', s: 'Top-quartile positioning' },
  { k: 'Repeat guest rate',           v: '34%',  s: 'Direct-channel base' },
  { k: 'Years operating SMA',         v: '11',   s: 'Through two cycles' },
  { k: 'Owner NPS',                   v: '72',   s: 'Last 24 months' },
];

function LRMSection() {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <SectionHeader
          num='07'
          eyebrow='The platform'
          title={<>Backed by <span className='display-italic' style={{ color: '#1F3A2E' }}>Luxury Rental Management</span>.</>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, marginTop: 56, alignItems: 'start' }} className='lrm-grid'>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(20,19,15,0.78)' }}>
            Our advantage isn't theoretical — it's the live data flowing through one of San Miguel's leading high-end short-term rental operators. Every assumption we use to underwrite a property is pulled from properties already running in our system.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border: '1px solid rgba(20,19,15,0.12)', background: '#FFFFFF' }}>
            {LRM_STATS.map((x, i, arr) => (
              <div
                key={i}
                style={{
                  padding: '24px 28px',
                  borderRight: i % 2 === 0 ? '1px solid rgba(20,19,15,0.1)' : 'none',
                  borderBottom: i < arr.length - 2 ? '1px solid rgba(20,19,15,0.1)' : 'none',
                }}
              >
                <div className='data-label'>{x.k}</div>
                <div className='display tnum' style={{ fontSize: 38, marginTop: 6, color: '#1F3A2E', letterSpacing: '-0.01em' }}>{x.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(20,19,15,0.55)', marginTop: 2 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: 'rgba(20,19,15,0.5)', fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
          INTERNAL DATA · Q1 2026 · NOT AUDITED
        </div>
      </div>
    </section>
  );
}

function ClosingCta({ copy }: { copy: AboutCopy }) {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}
          className='closing-grid'
        >
          <div>
            <div className='lead-num'>{copy.closing_eyebrow}</div>
            <h2
              className='display'
              style={{
                fontSize: 'clamp(40px, 5vw, 72px)',
                margin: '12px 0 24px',
                lineHeight: 0.98,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-line',
              }}
            >
              {copy.closing_title_pre}
              <span className='display-italic' style={{ color: '#1F3A2E' }}>{copy.closing_title_italic}</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#2A2722', maxWidth: 540 }}>
              {copy.closing_paragraph}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifySelf: 'end', flexWrap: 'wrap' }}>
            <Link href='/contact' className='btn btn-primary'>{copy.closing_cta_apply_label}</Link>
            <Link href='/insights' className='btn btn-ghost'>{copy.closing_cta_read_label}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
