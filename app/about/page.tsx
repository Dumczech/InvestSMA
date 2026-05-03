import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';

export const metadata: Metadata = {
  title: 'About · InvestSMA',
  description:
    "InvestSMA is a research and lead-gen platform operated by Luxury Rental Management — operators, not brokers. Eleven years of San Miguel rental performance data informs every recommendation.",
};

// Faithful port of design5/.../about.jsx — hero + positioning ("we are /
// we are not") + operations stack + closing CTA. Editorial copy lives
// inline; can be moved to site_content if/when admin needs to edit.

const NOT = [
  { t: 'A real estate brokerage', d: "We don't represent buyers or sellers in transactions, and we don't collect a brokerage commission on your purchase." },
  { t: 'A passive financial advisor', d: "We're not licensed financial advisors. We don't package securities or run pooled funds." },
  { t: 'A speculation play', d: "We don't make calls based on macro sentiment or where prices \"should\" be in five years." },
];

const ARE = [
  { t: 'Operators', d: 'We run a portfolio of high-end short-term rentals in SMA every day. The data flowing through our system is what informs every recommendation.' },
  { t: 'A management platform', d: 'Through Luxury Rental Management, we execute the full operational stack — design, listing, pricing, distribution, guest experience.' },
  { t: 'Aligned by performance', d: "Our income depends on the property performing after it's purchased. That keeps the incentives clean." },
];

const STACK = [
  { phase: 'Acquisition', items: ['Off-market sourcing', 'Underwriting + memo', 'Notario + fideicomiso intro'] },
  { phase: 'Stabilization', items: ['Design refresh + furnishing', 'Pro photo + 360° tour', 'OTA + direct site live'] },
  { phase: 'Operations', items: ['24/7 bilingual concierge', 'Dynamic pricing weekly', 'Quarterly owner reporting'] },
  { phase: 'Optimization', items: ['Annual ADR/occ review', 'Capex ROI tracking', 'Tax-efficient distributions'] },
];

export default function AboutPage() {
  return (
    <div className='doc-page' data-screen-label='About'>
      <Hero />
      <AreNotAre />
      <OperationsStack />
      <ClosingCta />
      <Disclaimer />
      <StickyCTA label='Talk to the LRM team' cta='Request Access' href='/contact' />
    </div>
  );
}

function Hero() {
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
          <span>§ About InvestSMA</span>
          <span>Operators · not brokers</span>
          <span>Est. via Luxury Rental Mgmt</span>
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
            <div className='lead-num' style={{ color: '#C9A55A' }}>About · 01</div>
            <h1
              className='display'
              style={{
                fontSize: 'clamp(56px, 7vw, 104px)',
                margin: '20px 0 0',
                letterSpacing: '-0.025em',
                lineHeight: 0.94,
              }}
            >
              We don&apos;t help you
              <br />
              buy property.
              <br />
              <span className='display-italic' style={{ color: '#C9A55A' }}>
                We help you build a performing asset.
              </span>
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(245,239,226,0.82)' }}>
              Most opportunities in San Miguel look good on paper. Few are structured, positioned,
              and operated in a way that delivers what investors expect. That gap — between a
              clean acquisition and a performing asset — is what we close.
            </p>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { v: '11', l: 'Years operating SMA' },
                { v: '40+', l: 'LRM portfolio doors' },
                { v: '$280K', l: 'Avg. gross / property' },
              ].map((s, i) => (
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

function AreNotAre() {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <div className='section-head'>
          <div>
            <div className='lead-num'>02 · Positioning</div>
            <h2>
              What we <span className='display-italic' style={{ color: '#1F3A2E' }}>are</span> and aren&apos;t.
            </h2>
          </div>
          <p className='lede' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }} className='are-grid'>
          {/* NOT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span className='mono tnum' style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.12em' }}>
                WE ARE NOT
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {NOT.map((x, i) => (
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
                WE ARE
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(245,239,226,0.2)' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {ARE.map((x, i) => (
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

function OperationsStack() {
  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0' }}>
      <div className='container'>
        <div className='section-head' style={{ borderBottom: '1px solid rgba(245,239,226,0.12)', paddingBottom: 56 }}>
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>03 · Operations stack</div>
            <h2 style={{ color: '#F5EFE2' }}>
              Four phases.
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>One operator.</span>
            </h2>
          </div>
          <p className='lede' style={{ color: 'rgba(245,239,226,0.7)' }}>
            From acquisition to exit, the same team — and the same data — runs every phase.
            That&apos;s how we keep the projection-to-reality variance below 8%.
          </p>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 56 }}
          className='stack-grid'
        >
          {STACK.map((c, i) => (
            <div key={i} style={{ borderTop: '1px solid #C9A55A', paddingTop: 24 }}>
              <div className='mono tnum' style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.16em' }}>
                PHASE 0{i + 1}
              </div>
              <div className='display' style={{ fontSize: 28, marginTop: 12, color: '#F5EFE2' }}>
                {c.phase}
              </div>
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
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section style={{ background: '#FBF8F0', padding: '120px 0' }}>
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}
          className='closing-grid'
        >
          <div>
            <div className='lead-num'>04 · Next step</div>
            <h2
              className='display'
              style={{
                fontSize: 'clamp(40px, 5vw, 72px)',
                margin: '12px 0 24px',
                lineHeight: 0.98,
                letterSpacing: '-0.025em',
              }}
            >
              The portfolio is small
              <br />
              <span className='display-italic' style={{ color: '#1F3A2E' }}>by design.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#2A2722', maxWidth: 540 }}>
              We add roughly one investor per quarter. Tell us what you&apos;re looking for and
              we&apos;ll respond within 24 hours.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifySelf: 'end', flexWrap: 'wrap' }}>
            <Link href='/contact' className='btn btn-primary'>Apply for access →</Link>
            <Link href='/insights' className='btn btn-ghost'>Read our notes</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
