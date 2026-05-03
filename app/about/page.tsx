import type { Metadata } from 'next';
import Link from 'next/link';
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
      <OperationsStack stack={content.stack} copy={copy} />
      <ClosingCta copy={copy} />
      <Disclaimer />
      <StickyCTA label='Talk to the LRM team' cta='Request Access' href='/contact' />
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
        <div className='section-head'>
          <div>
            <div className='lead-num'>{copy.positioning_eyebrow}</div>
            <h2>
              {copy.positioning_title_pre}<span className='display-italic' style={{ color: '#1F3A2E' }}>{copy.positioning_title_italic}</span>{copy.positioning_title_post}
            </h2>
          </div>
          <p className='lede' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }} className='are-grid'>
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

function OperationsStack({ stack, copy }: { stack: AboutContent['stack']; copy: AboutCopy }) {
  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0' }}>
      <div className='container'>
        <div className='section-head' style={{ borderBottom: '1px solid rgba(245,239,226,0.12)', paddingBottom: 56 }}>
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>{copy.stack_eyebrow}</div>
            <h2 style={{ color: '#F5EFE2' }}>
              {copy.stack_title_pre}
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>{copy.stack_title_italic}</span>
            </h2>
          </div>
          <p className='lede' style={{ color: 'rgba(245,239,226,0.7)' }}>
            {copy.stack_lede}
          </p>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 56 }}
          className='stack-grid'
        >
          {stack.map((c, i) => (
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
