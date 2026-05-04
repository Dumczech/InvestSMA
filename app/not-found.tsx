import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer } from '@/components/site';

// Faithful port of design 404.html — split-screen big-numeral 404 +
// editorial copy + curated jump links. Renders within the standard
// site chrome (Nav, Ticker, Footer wrap via app/layout.tsx).

export const metadata: Metadata = {
  title: 'Page not found · InvestSMA',
};

const TRY_LINKS = [
  { l: 'Q1 2026 Market Report', h: '/reports' },
  { l: 'ROI Calculator',        h: '/roi-calculator' },
  { l: "The Buyer's Guide",      h: '/guide' },
  { l: 'Case studies',          h: '/cases' },
  { l: 'Contact us',            h: '/contact' },
];

export default function NotFound() {
  return (
    <div className='doc-page' data-screen-label='404'>
      <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', minHeight: '78vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2A2722 0%, #14130F 100%)' }} />
        <div className='container' style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className='nf-grid'>
            <div>
              <div className='display tnum' style={{ fontSize: 'clamp(120px, 18vw, 240px)', color: '#C9A55A', letterSpacing: '-0.04em', lineHeight: 0.85 }}>
                404
              </div>
              <div className='mono' style={{ fontSize: 11, letterSpacing: '0.16em', color: 'rgba(245,239,226,0.5)', marginTop: 16 }}>
                LRM-ERR · 404 · NO MATCH IN INDEX
              </div>
            </div>
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Page not found</div>
              <h1 className='display' style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', margin: '16px 0 24px', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                That page is <span className='display-italic' style={{ color: '#D9CFB8' }}>off-market.</span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', maxWidth: 480 }}>
                Either the link is stale, the property has closed, or the URL was typed in by hand. Try one of these instead — or send us a quick note and we will track down what you were looking for.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href='/' className='btn btn-gold'>Back to home →</Link>
                <Link href='/properties' className='btn btn-ghost' style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.3)' }}>Browse properties</Link>
              </div>
              <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(245,239,226,0.15)' }}>
                <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,239,226,0.5)', marginBottom: 16 }}>Try one of these</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TRY_LINKS.map(l => (
                    <Link
                      key={l.h}
                      href={l.h}
                      style={{ color: '#F5EFE2', fontSize: 16, textDecoration: 'none', borderBottom: '1px solid rgba(245,239,226,0.1)', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{l.l}</span>
                      <span style={{ color: '#C9A55A' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}
