import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';

// Faithful port of design guide.jsx — long-form orientation TOC for the
// 8-chapter Buyer's Guide. Chapter content is editorial / static for
// now and can later be sourced from the articles table.

export const metadata: Metadata = {
  title: "The Buyer's Guide · InvestSMA",
  description:
    "8 chapters of San Miguel de Allende real estate buyer education — neighborhoods, acquisition framework, legal, tax, operating economics, closing, and post-close.",
};

const CHAPTERS = [
  { num: '01', title: 'Why San Miguel',      summary: 'Demand drivers, demographic tailwinds, the regulatory landscape, and what makes SMA structurally different from other Mexican STR markets.', pages: 6 },
  { num: '02', title: 'The 6 neighborhoods', summary: 'Centro, Atascadero, Guadiana, San Antonio, Los Frailes, La Lejona — yield, ADR, occupancy, lifestyle fit, and basis trends for each.',         pages: 9 },
  { num: '03', title: 'Acquisition framework', summary: 'How we screen properties: the 3 hard filters, the 7 secondary signals, and the 5 disqualifiers we walk away from automatically.',           pages: 7 },
  { num: '04', title: 'Legal & ownership',   summary: 'Fideicomiso vs. SA de CV, what the notario actually does, common title issues, and the SRE permit process step-by-step.',                       pages: 8 },
  { num: '05', title: 'Tax for foreigners',  summary: 'IVA, ISR, capital gains, the RFC registration, what your fiscal accountant should cost, and the optional regime that saves 25-30%.',           pages: 6 },
  { num: '06', title: 'Operating economics', summary: 'Real Y1 P&L on three properties, including the one that underperformed. What management actually costs, what reserves you actually need.',     pages: 7 },
  { num: '07', title: 'Closing checklist',   summary: 'Six-to-eight week timeline, six checkpoints, four parties. Where deals go sideways and how to add slack.',                                       pages: 5 },
  { num: '08', title: 'After closing',       summary: 'Furnishing budget, photography, listing setup, dynamic-pricing, the maintenance calendar, and Year-1 vs Year-3 expectations.',                  pages: 6 },
];

const HERO_STATS = [
  { v: '8',      l: 'Chapters' },
  { v: '3',      l: 'Real P&Ls' },
  { v: '12,400', l: 'Words' },
  { v: '24h',    l: 'Reply time' },
];

export default function GuidePage() {
  return (
    <div className='doc-page' data-screen-label='Buyers-Guide'>
      <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '80px 0 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1F3A2E 0%, #14130F 70%)', opacity: 0.95 }} />
        <div className='container' style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80, alignItems: 'end' }} className='guide-hero-grid'>
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>The Buyer&apos;s Guide · 8 chapters · Open</div>
              <h1 className='display' style={{ fontSize: 'clamp(48px, 6.4vw, 92px)', margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 0.96 }}>
                Everything we have learned <span className='display-italic' style={{ color: '#D9CFB8' }}>buying SMA properties</span>, in one document.
              </h1>
              <p style={{ marginTop: 32, fontSize: 18, lineHeight: 1.55, color: 'rgba(245,239,226,0.78)', maxWidth: 600 }}>
                8 chapters. Real P&amp;Ls, the legal framework, the tax math, the screening filters we apply to every property we evaluate. Read it openly on this site — then talk to us about your specific situation.
              </p>
            </div>
            <div style={{ background: 'rgba(245,239,226,0.05)', border: '1px solid rgba(245,239,226,0.18)', padding: 28 }}>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A55A' }}>Apply it to your situation</div>
              <div className='display' style={{ fontSize: 28, marginTop: 12, lineHeight: 1.1 }}>30-minute walkthrough.</div>
              <p style={{ fontSize: 13, color: 'rgba(245,239,226,0.7)', lineHeight: 1.55, marginTop: 14 }}>
                The framework is one thing. Applying it to your budget, neighborhood preference, and timeline is another. Schedule a call — we&apos;ll come prepared.
              </p>
              <Link href='/contact?intent=guide' className='btn btn-gold' style={{ width: '100%', marginTop: 20, display: 'block', textAlign: 'center' }}>Schedule a Call →</Link>
              <div className='mono' style={{ fontSize: 10, color: 'rgba(245,239,226,0.45)', marginTop: 12, lineHeight: 1.5 }}>Real human · 24h reply · No drip sequence.</div>
            </div>
          </div>

          <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(245,239,226,0.15)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }} className='guide-stats-grid'>
            {HERO_STATS.map((s, i) => (
              <div key={i}>
                <div className='display tnum' style={{ fontSize: 56, color: '#C9A55A', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
                <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,239,226,0.6)', marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '100px 0' }}>
        <div className='container'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }} className='guide-toc-grid'>
            <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
              <div className='lead-num'>Table of contents</div>
              <h2 className='display' style={{ fontSize: 56, marginTop: 12, lineHeight: 0.98, letterSpacing: '-0.02em' }}>
                What&apos;s <span className='display-italic'>inside.</span>
              </h2>
              <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: '#3A362F' }}>
                No fluff, no padding. Each chapter is the actual framework we use when we evaluate a deal — written so you can apply it whether or not you ever work with us.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {CHAPTERS.map(c => (
                <div key={c.num} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: 24, padding: '28px 0', borderTop: '1px solid rgba(20,19,15,0.15)', alignItems: 'baseline' }}>
                  <div className='display tnum' style={{ fontSize: 28, color: '#C9A55A', letterSpacing: '-0.02em' }}>{c.num}</div>
                  <div>
                    <div className='display' style={{ fontSize: 24, lineHeight: 1.2, color: '#14130F' }}>{c.title}</div>
                    <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: '#3A362F' }}>{c.summary}</p>
                  </div>
                  <div className='mono' style={{ fontSize: 11, color: '#3A362F', textAlign: 'right', letterSpacing: '0.06em' }}>{c.pages} pp</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(20,19,15,0.15)' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#FAF6EC', padding: '100px 0', borderTop: '1px solid rgba(20,19,15,0.1)' }}>
        <div className='container'>
          <div className='lead-num' style={{ marginBottom: 24 }}>Sample · Chapter 03 · Acquisition framework</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'start' }} className='guide-preview-grid'>
            <div>
              <h3 className='display' style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 24 }}>The three filters every property must clear.</h3>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#2A2722' }}>
                About 7% of properties we screen each quarter clear all three filters. That number has held remarkably steady — when one filter loosens, another tightens. We will walk through the exact thresholds, then explain why each one exists with the data behind it.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#2A2722', marginTop: 16 }}>
                <strong>Filter 1: Yield potential.</strong> Pro-forma gross yield must clear 8.0% on conservative occupancy assumptions (LRM uses 58% as the conservative case, vs the 62.4% market average). Below 8.0% gross, net economics get squeezed too hard by management, taxes, and reserves.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#2A2722', marginTop: 16 }}>
                <strong>Filter 2: Walkability.</strong> The property must score 80+ on our walkability index, which weights distance to Jardín, distance to nearest restaurant cluster, and elevation gain. Properties below 80 see meaningful occupancy haircuts (we have data on this going back to 2021).
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#2A2722', marginTop: 16, opacity: 0.55 }}>
                <em>... 6 more pages of this chapter, plus the full filter framework, available on request.</em>
              </p>
            </div>
            <div className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: 32 }}>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A55A' }}>Want a memo on a specific property?</div>
              <div className='display' style={{ fontSize: 22, marginTop: 12, lineHeight: 1.2 }}>We will run the framework on a deal you are looking at — usually within 48 hours.</div>
              <Link href='/contact?intent=memo' className='btn btn-gold' style={{ width: '100%', marginTop: 24 }}>Request a memo →</Link>
              <div className='mono' style={{ fontSize: 10, color: 'rgba(245,239,226,0.5)', marginTop: 16, letterSpacing: '0.06em', lineHeight: 1.6 }}>
                Free for serious buyers. We turn down ~60% of requests when the property does not fit the framework — that is fine, we&apos;d rather tell you upfront.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Disclaimer />
      <StickyCTA label='Questions on the guide?' cta='Schedule a Call' href='/contact' />
    </div>
  );
}
