import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';
import { GUIDE_PARTS, GUIDE_CHAPTERS, PART_SUMMARIES } from './data';
import { PartDivider } from './blocks';
import { CHAPTERS_LIST } from './chapters';

// Faithful port of design guide.jsx — 31 chapters across 7 parts.
// Hero → editorial intro → TOC → interleaved (PartDivider, Chapter)
// → final CTA → source notes → disclaimer → sticky CTA.

export const metadata: Metadata = {
  title: "The Buyer's Guide · InvestSMA",
  description:
    "31 chapters across 7 parts: how to buy, underwrite, operate, and protect a high-performing San Miguel de Allende short-term rental investment.",
};

const HERO_STATS = [
  { v: '31',   l: 'Chapters' },
  { v: '7',    l: 'Parts' },
  { v: '25',   l: 'Diligence items' },
  { v: 'Open', l: 'No paywall, no PDF gate' },
];

function GuideHero() {
  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '100px 0 120px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(31,58,46,0.92) 0%, rgba(20,19,15,0.88) 65%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} preserveAspectRatio='xMidYMid slice'>
        <pattern id='guide-hero-grid' x='0' y='0' width='48' height='48' patternUnits='userSpaceOnUse'>
          <line x1='0' y1='0' x2='0' y2='48' stroke='#C9A55A' strokeWidth='0.5' />
          <line x1='0' y1='0' x2='48' y2='0' stroke='#C9A55A' strokeWidth='0.5' />
        </pattern>
        <rect width='100%' height='100%' fill='url(#guide-hero-grid)' />
      </svg>
      <div className='container' style={{ position: 'relative' }}>
        <div className='mono' style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A55A', marginBottom: 32 }}>
          The Buyer&apos;s Guide · Edition 2026 · 31 chapters · Open
        </div>
        <h1 className='display' style={{ fontSize: 'clamp(46px, 6.4vw, 96px)', margin: 0, letterSpacing: '-0.025em', lineHeight: 0.96, maxWidth: 1200 }}>
          A Buyer&apos;s Investment Guide to <span className='display-italic' style={{ color: '#D9CFB8' }}>Short-Term Rental</span> Homes in San Miguel de Allende.
        </h1>
        <div className='guide-hero-grid' style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 64, alignItems: 'end' }}>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: 'rgba(245,239,226,0.78)', maxWidth: 720, margin: 0, fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 400 }}>
            How to buy, underwrite, operate, and protect a high-performing vacation rental investment in San Miguel de Allende, Mexico. 31 chapters across 7 parts — written for buyers who want the discipline, not the marketing.
          </p>
          <div style={{ background: 'rgba(245,239,226,0.04)', border: '1px solid rgba(245,239,226,0.18)', padding: 28 }}>
            <div className='mono' style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A55A' }}>Apply it to your situation</div>
            <div className='display' style={{ fontSize: 26, marginTop: 10, lineHeight: 1.1 }}>30-minute walkthrough.</div>
            <p style={{ fontSize: 13, color: 'rgba(245,239,226,0.7)', lineHeight: 1.55, marginTop: 12 }}>
              The framework is one thing. Applying it to your budget, neighborhood, and timeline is another.
            </p>
            <Link href='/contact?intent=guide' className='btn btn-gold' style={{ width: '100%', marginTop: 18, display: 'block', textAlign: 'center' }}>Schedule a Call →</Link>
          </div>
        </div>
        <div className='guide-stats-grid' style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(245,239,226,0.15)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {HERO_STATS.map((s, i) => (
            <div key={i}>
              <div className='display tnum' style={{ fontSize: 56, color: '#C9A55A', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,239,226,0.6)', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideEditorialIntro() {
  return (
    <section style={{ background: 'var(--paper)', padding: '100px 0' }}>
      <div className='container-narrow'>
        <div className='mono' style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>
          From the editor · April 2026
        </div>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(24px, 2.4vw, 32px)', lineHeight: 1.3, color: 'var(--ink)', margin: 0, fontStyle: 'italic', fontWeight: 400 }}>
          San Miguel de Allende is not a normal real estate market. It is a heritage city, a luxury lifestyle destination, a wedding and events market, a second-home market, and a short-term rental market — all operating at the same time.
        </p>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 19, lineHeight: 1.6, color: 'var(--ink-2)', marginTop: 24 }}>
          This guide is written for buyers who want to acquire a home in San Miguel and use short-term rental income to improve the economics of ownership. The blunt truth: STR investment here can work extremely well — but only when the buyer underwrites correctly, buys the right asset, operates professionally, and understands taxes, platform rules, staffing, guest expectations, and maintenance risk.
        </p>
        <div style={{ marginTop: 32, padding: '20px 24px', borderLeft: '3px solid var(--gold)', background: '#FAF6EC', fontFamily: 'var(--f-mono)', fontSize: 12, lineHeight: 1.7, color: 'var(--ink-2)', letterSpacing: '0.02em' }}>
          <strong style={{ letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 10 }}>Disclosure ·</strong> This is not legal, tax, or financial advice. Buyers should work with a licensed real estate professional, Mexican attorney, accountant, and qualified property manager before purchasing.
        </div>
      </div>
    </section>
  );
}

function GuideTOC() {
  return (
    <section style={{ background: '#FAF6EC', padding: '100px 0', borderTop: '1px solid rgba(20,19,15,0.08)' }}>
      <div className='container'>
        <div className='guide-toc-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>
          <div className='guide-toc-side' style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <div className='mono' style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>Contents</div>
            <h2 className='display' style={{ fontSize: 64, marginTop: 0, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
              What&apos;s <span className='display-italic'>inside.</span>
            </h2>
            <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
              Seven parts. Thirty-one chapters. Each one is the actual framework we use when we evaluate a deal — written so you can apply it whether or not you ever work with us.
            </p>
            <Link href='#ch-01' className='btn btn-primary' style={{ marginTop: 32, display: 'inline-block' }}>Start reading →</Link>
          </div>
          <div>
            {GUIDE_PARTS.map(part => {
              const partChapters = GUIDE_CHAPTERS.filter(c => c.part === part.id);
              return (
                <div key={part.id} style={{ marginBottom: 48 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, paddingBottom: 14, borderBottom: '2px solid var(--ink)' }}>
                    <span className='display' style={{ fontSize: 24, color: 'var(--gold)', letterSpacing: '-0.02em', fontStyle: 'italic' }}>Part {part.num}</span>
                    <span className='display' style={{ fontSize: 24, color: 'var(--ink)' }}>{part.title}</span>
                  </div>
                  {partChapters.map(c => (
                    <Link key={c.num} href={`#ch-${c.num}`} className='guide-toc-row' style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 20, padding: '18px 0', borderBottom: '1px solid rgba(20,19,15,0.1)', alignItems: 'baseline', textDecoration: 'none', color: 'inherit' }}>
                      <div className='display tnum' style={{ fontSize: 22, color: 'var(--gold)', letterSpacing: '-0.02em' }}>{c.num}</div>
                      <div>
                        <div className='display' style={{ fontSize: 19, lineHeight: 1.25, color: 'var(--ink)' }}>{c.title}</div>
                        <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-3)' }}>{c.summary}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChaptersSection() {
  const out: React.ReactNode[] = [];
  let lastPart: string | null = null;
  GUIDE_CHAPTERS.forEach((c, i) => {
    if (c.part !== lastPart) {
      const part = GUIDE_PARTS.find(p => p.id === c.part)!;
      out.push(
        <PartDivider key={`pd-${part.id}`} num={part.num} title={part.title} summary={PART_SUMMARIES[part.id]} />
      );
      lastPart = c.part;
    }
    const C = CHAPTERS_LIST[i];
    out.push(
      <div key={`wrap-${c.num}`} style={{ background: i % 2 === 0 ? 'var(--paper)' : '#FAF6EC' }}>
        <div className='container'>
          {C ? <C /> : null}
        </div>
      </div>
    );
  });
  return <>{out}</>;
}

function GuideFinalCTA() {
  return (
    <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(at 70% 30%, rgba(176,138,62,0.18) 0%, transparent 60%)' }} />
      <div className='container-narrow' style={{ position: 'relative' }}>
        <div className='mono' style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A55A', marginBottom: 24 }}>
          End of guide · Next step
        </div>
        <h2 className='display' style={{ fontSize: 'clamp(40px, 5vw, 72px)', margin: 0, lineHeight: 1, letterSpacing: '-0.025em' }}>
          Want a memo on a <span className='display-italic' style={{ color: '#C9A55A' }}>specific property?</span>
        </h2>
        <p style={{ marginTop: 32, fontSize: 19, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', maxWidth: 720, fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
          We will run this exact framework on a deal you are looking at — usually within 48 hours. Free for serious buyers. We turn down ~60% of requests when the property does not fit the framework. That is fine — we&apos;d rather tell you upfront.
        </p>
        <div style={{ marginTop: 48, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href='/contact?intent=memo' className='btn btn-gold'>Request a memo →</Link>
          <Link href='/contact?intent=guide' className='btn btn-ghost'>Schedule a 30-min call →</Link>
        </div>
      </div>
    </section>
  );
}

function GuideSourceNotes() {
  return (
    <section style={{ background: '#0E0D0A', color: 'rgba(245,239,226,0.7)', padding: '64px 0', borderTop: '1px solid rgba(245,239,226,0.08)' }}>
      <div className='container-narrow'>
        <div className='mono' style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A55A', marginBottom: 20 }}>
          Source notes for buyers
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
          San Miguel&apos;s tourism appeal is supported by international recognition, UNESCO heritage status, and continuing visitor demand. Travel + Leisure named San Miguel the best city in Mexico in 2025. Guanajuato&apos;s tourism economy reportedly generated 5.758 billion pesos of impact in November 2025. SMA reported more than 403,956 visitors during the December 24, 2024 to January 5, 2025 holiday period.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
          STR performance estimates vary by source. AirDNA reports market data from approximately 4,003 SMA Airbnb and Vrbo properties, with occupancy around 37% and average daily rate around $175. Airbtics reported median revenue of approximately MXN 309,000 from February 2025 through January 2026. AirROI reported a lower annual revenue estimate of approximately $17,475 USD for April 2025 through March 2026.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>
          Tax and compliance should be reviewed with professionals. SAT has a specific tax regime for income earned through technology platforms, including lodging and accommodation. Airbnb states that Mexico hosts are responsible for taxes, including VAT and income tax reporting.
        </p>
      </div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <div className='doc-page' data-screen-label='Buyers-Guide-Long'>
      <GuideHero />
      <GuideEditorialIntro />
      <GuideTOC />
      <ChaptersSection />
      <GuideFinalCTA />
      <GuideSourceNotes />
      <Disclaimer />
      <StickyCTA label='Want a memo on a specific home?' cta='Request memo' href='/contact?intent=memo' />
    </div>
  );
}
