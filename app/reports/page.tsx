import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';

// Faithful port of design report.jsx — the quarterly market report
// landing page. Headlines / TOC / archive are static editorial for
// now; can be sourced from `market_reports` once that table covers
// section TOCs and headline lists.

export const metadata: Metadata = {
  title: 'Q1 2026 Market Report · InvestSMA',
  description:
    'Quarterly San Miguel de Allende market report — ADR by neighborhood, occupancy seasonality, transaction comps, regulatory outlook, and 12-month forecast.',
};

const HEADLINE_STATS = [
  { v: '+8.2%',  l: 'Centro ADR YoY',   sub: 'Q1 2025 → Q1 2026' },
  { v: '62.4%',  l: 'SMA occupancy',    sub: '+3.1 pts YoY' },
  { v: '−4.2%',  l: 'Inventory change', sub: 'Tightening continues' },
  { v: '+11.8%', l: 'BJX arrivals',     sub: 'International visitors' },
];

const SECTIONS = [
  { num: 'I',    title: 'Executive summary',          pages: '02–05' },
  { num: 'II',   title: 'ADR by neighborhood',        pages: '06–12' },
  { num: 'III',  title: 'Occupancy & seasonality',    pages: '13–20' },
  { num: 'IV',   title: 'Transaction comps',          pages: '21–28' },
  { num: 'V',    title: 'Inventory & supply trends',  pages: '29–34' },
  { num: 'VI',   title: 'Regulatory outlook',         pages: '35–40' },
  { num: 'VII',  title: 'Demand drivers',             pages: '41–46' },
  { num: 'VIII', title: '12-month forecast',          pages: '47–52' },
];

const ARCHIVE = [
  { q: 'Q4 2025', date: 'Jan 17, 2026', headline: 'Wedding-season pricing widens; Centro inventory contracts.', pages: 48 },
  { q: 'Q3 2025', date: 'Oct 20, 2025', headline: 'Shoulder-season demand softens slightly; ADR holds.',         pages: 44 },
  { q: 'Q2 2025', date: 'Jul 18, 2025', headline: 'Atascadero outperforms; new construction pipeline review.',    pages: 46 },
  { q: 'Q1 2025', date: 'Apr 19, 2025', headline: 'Year-over-year ADR growth re-accelerates after 2024 plateau.', pages: 42 },
];

export default function ReportPage() {
  return (
    <div className='doc-page' data-screen-label='Q1-Report'>
      <section className='surface-dark' style={{ background: '#1F3A2E', color: '#F5EFE2', padding: '80px 0 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1F3A2E 0%, #14130F 100%)', opacity: 0.95 }} />
        <div className='container' style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 80, alignItems: 'end' }} className='report-hero-grid'>
            <div>
              <div className='mono' style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A55A' }}>
                Q1 2026 · Quarterly market report · Open data
              </div>
              <h1 className='display' style={{ fontSize: 'clamp(48px, 6.4vw, 92px)', margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 0.96 }}>
                The SMA market, <span className='display-italic' style={{ color: '#D9CFB8' }}>quarterly.</span>
              </h1>
              <p style={{ marginTop: 32, fontSize: 18, lineHeight: 1.55, color: 'rgba(245,239,226,0.82)', maxWidth: 600 }}>
                ADR by neighborhood, occupancy seasonality, transaction comps, regulatory outlook, and a 12-month forecast — sourced from 312 LRM-managed properties and AirDNA&apos;s 2,847-listing market panel. The data lives on this site — talk to us if you want to discuss what it means for your portfolio.
              </p>
            </div>
            <div style={{ background: 'rgba(245,239,226,0.06)', border: '1px solid rgba(245,239,226,0.18)', padding: 28 }}>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A55A' }}>Talk through the data</div>
              <div className='display' style={{ fontSize: 26, marginTop: 10, lineHeight: 1.1 }}>30 minutes with the analyst.</div>
              <p style={{ fontSize: 13, color: 'rgba(245,239,226,0.7)', lineHeight: 1.55, marginTop: 14 }}>
                We walk you through Q1 trends in your target neighborhoods and what they imply for ADR, occupancy, and acquisition timing.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Live data walkthrough', 'Neighborhood-specific Q&A', 'Off-market property options', 'No follow-up drip sequence'].map(b => (
                  <li key={b} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 13, color: 'rgba(245,239,226,0.88)' }}>
                    <span style={{ color: '#C9A55A', fontSize: 11 }}>•</span><span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link href='/contact?intent=q1-report' className='btn btn-gold' style={{ width: '100%', marginTop: 24, display: 'block', textAlign: 'center' }}>Schedule a Call →</Link>
              <div className='mono' style={{ fontSize: 10, color: 'rgba(245,239,226,0.45)', lineHeight: 1.5, marginTop: 12 }}>Real human · 24h response · No drip</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '64px 0' }}>
        <div className='container'>
          <div className='lead-num' style={{ marginBottom: 24 }}>Headline numbers · Q1 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(20,19,15,0.12)', border: '1px solid rgba(20,19,15,0.12)' }} className='report-headline-grid'>
            {HEADLINE_STATS.map((s, i) => (
              <div key={i} style={{ background: '#FBF8F0', padding: 28 }}>
                <div className='display tnum' style={{ fontSize: 56, color: '#14130F', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
                <div className='mono' style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A362F', marginTop: 12 }}>{s.l}</div>
                <div className='mono' style={{ fontSize: 11, color: '#1F3A2E', marginTop: 6 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#FAF6EC', padding: '80px 0', borderTop: '1px solid rgba(20,19,15,0.1)' }}>
        <div className='container'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80 }} className='report-toc-grid'>
            <div>
              <div className='lead-num'>Inside</div>
              <h2 className='display' style={{ fontSize: 48, marginTop: 12, lineHeight: 1, letterSpacing: '-0.02em' }}>Eight sections of <span className='display-italic'>field-tested data.</span></h2>
              <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: '#3A362F' }}>
                Updated weekly from our PMS and AirDNA&apos;s market panel. The summaries are public on this site — the conversation about what it means for your portfolio is the part that&apos;s worth scheduling.
              </p>
            </div>
            <div>
              {SECTIONS.map(s => (
                <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px', gap: 20, padding: '20px 0', borderTop: '1px solid rgba(20,19,15,0.15)', alignItems: 'baseline' }}>
                  <div className='mono tnum' style={{ fontSize: 14, color: '#C9A55A', letterSpacing: '0.06em' }}>§ {s.num}</div>
                  <div className='display' style={{ fontSize: 22, color: '#14130F' }}>{s.title}</div>
                  <div className='mono' style={{ fontSize: 11, color: '#3A362F', textAlign: 'right' }}>pp. {s.pages}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(20,19,15,0.15)' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '80px 0', borderTop: '1px solid rgba(20,19,15,0.1)' }}>
        <div className='container'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(20,19,15,0.15)', paddingBottom: 16, marginBottom: 32 }}>
            <div className='lead-num'>Past quarters · archive</div>
            <span className='mono' style={{ fontSize: 11, color: '#3A362F' }}>Discuss any of these on a call</span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {ARCHIVE.map(p => (
              <div key={p.q} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 140px', gap: 24, padding: '20px 24px', background: '#FAF6EC', border: '1px solid rgba(20,19,15,0.1)', alignItems: 'center' }} className='report-archive-row'>
                <div>
                  <div className='mono tnum' style={{ fontSize: 16, color: '#14130F', letterSpacing: '0.06em' }}>{p.q}</div>
                  <div className='mono' style={{ fontSize: 10, color: '#3A362F', marginTop: 4 }}>{p.date}</div>
                </div>
                <div style={{ fontSize: 16, color: '#2A2722', fontStyle: 'italic' }}>&ldquo;{p.headline}&rdquo;</div>
                <div className='mono' style={{ fontSize: 11, color: '#3A362F' }}>Updated weekly</div>
                <Link href='/contact?intent=archive' className='btn btn-ghost' style={{ width: '100%', borderColor: 'rgba(20,19,15,0.2)', color: '#14130F' }}>Discuss →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Disclaimer />
      <StickyCTA label='Want to discuss the report?' cta='Schedule a Call' href='/contact' />
    </div>
  );
}
