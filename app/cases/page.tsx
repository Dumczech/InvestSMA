import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';

// Faithful port of design cases.jsx — published Y1 P&Ls for 4 LRM-managed
// SMA properties. Static editorial content for now; the 4-row dataset
// can later be sourced from a `case_studies` table.

export const metadata: Metadata = {
  title: 'Case Studies · InvestSMA',
  description:
    'Four LRM-managed San Miguel de Allende properties — three years of real P&Ls, every line item published. Including the property that ran 4.2% net in Year 1.',
};

const CASES = [
  {
    id: 'casa-aldama-y1',
    name: 'Casa Aldama',
    neighborhood: 'Centro',
    config: '3BR · 2.5BA · 240 sqm',
    basis: 1062500, gross: 312000, net: 92500,
    yieldPct: 8.7, occ: 68.4, adr: 612,
    accent: '#1F3A2E',
    headline: '$312K gross · 68% occupancy · 8.7% net yield',
    summary: 'A Centro 3BR colonial that hit the model in Y1 — wedding season did most of the work.',
    tag: 'Strong Y1',
  },
  {
    id: 'atascadero-3yr-pl',
    name: 'Casa Mirador',
    neighborhood: 'Atascadero',
    config: '4BR · 3BA · 380 sqm',
    basis: 1200000, gross: 268000, net: 50400,
    yieldPct: 4.2, occ: 54, adr: 488,
    accent: '#B08A3E',
    headline: 'Y1: 4.2% net · Y3: 9.6% net · the recovery',
    summary: 'A rough launch — WiFi, pool, photography all underperformed. Three operational fixes in Year 2 stabilized the asset.',
    tag: 'Recovery story',
  },
  {
    id: 'guadiana-portfolio',
    name: 'Guadiana Pair',
    neighborhood: 'Guadiana',
    config: '2 × 2BR · combined',
    basis: 1480000, gross: 358000, net: 110200,
    yieldPct: 7.4, occ: 64, adr: 392,
    accent: '#2A2722',
    headline: 'Two doors, one operating layer · 7.4% net',
    summary: 'A side-by-side portfolio play. Shared cleaning, shared restocking, two listings — economics hold up materially better than single-door equivalents.',
    tag: 'Portfolio',
  },
  {
    id: 'centro-sub1m',
    name: 'Casa Pila Seca',
    neighborhood: 'Centro',
    config: '2BR · 1.5BA · 165 sqm',
    basis: 895000, gross: 218000, net: 67200,
    yieldPct: 7.5, occ: 71, adr: 446,
    accent: '#3F6B55',
    headline: 'Sub-$1M Centro · 71% occupancy',
    summary: 'A smaller Centro 2BR that punches above weight on occupancy — couples and small-group bookings carry the year.',
    tag: 'Sub-$1M',
  },
];

const fmtUsdK = (n: number) => `$${(n / 1000).toFixed(0)}K`;

const HERO_STATS = [
  { v: '4',     l: 'Properties' },
  { v: '$4.6M', l: 'Combined basis' },
  { v: '$1.16M',l: 'Combined gross Y1' },
  { v: '7.0%',  l: 'Avg net yield' },
];

export default function CasesPage() {
  return (
    <div className='doc-page' data-screen-label='Case-Studies'>
      <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '80px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2A2722 0%, #14130F 70%)' }} />
        <div className='container' style={{ position: 'relative' }}>
          <div className='lead-num' style={{ color: '#C9A55A' }}>Case studies · Real P&amp;Ls</div>
          <h1 className='display' style={{ fontSize: 'clamp(48px, 6vw, 88px)', margin: '20px 0 24px', letterSpacing: '-0.025em', lineHeight: 0.98, maxWidth: 1100 }}>
            Four properties. <span className='display-italic' style={{ color: '#D9CFB8' }}>Three years.</span> Every line item published.
          </h1>
          <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.55, color: 'rgba(245,239,226,0.78)', maxWidth: 720 }}>
            Most management firms publish only their winners. We publish everything — including the property that ran 4.2% net in Year 1 before we figured out what was wrong. The point is not to brag; it is to show you what realistic outcomes look like.
          </p>

          <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, paddingTop: 32, borderTop: '1px solid rgba(245,239,226,0.15)' }} className='cases-stats-grid'>
            {HERO_STATS.map((s, i) => (
              <div key={i}>
                <div className='display tnum' style={{ fontSize: 44, color: '#C9A55A', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
                <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,239,226,0.6)', marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '80px 0' }}>
        <div className='container'>
          <div className='lead-num' style={{ marginBottom: 32 }}>The case studies</div>
          {CASES.map((c, idx) => (
            <div
              key={c.id}
              style={{ borderTop: '1px solid rgba(20,19,15,0.15)', padding: '40px 0', display: 'grid', gridTemplateColumns: '80px 1.4fr 2fr 200px', gap: 32, alignItems: 'start' }}
              className='case-row'
            >
              <div className='display tnum' style={{ fontSize: 32, color: '#C9A55A', letterSpacing: '-0.02em' }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div>
                <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B08A3E' }}>{c.tag} · {c.neighborhood}</div>
                <div className='display' style={{ fontSize: 30, lineHeight: 1.1, marginTop: 10, color: '#14130F' }}>{c.name}</div>
                <div className='mono' style={{ fontSize: 11, color: '#3A362F', marginTop: 8, letterSpacing: '0.04em' }}>{c.config}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#2A2722', marginTop: 20 }}>{c.summary}</p>
              </div>
              <div>
                <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A362F', marginBottom: 16 }}>Headline metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(20,19,15,0.12)', border: '1px solid rgba(20,19,15,0.12)' }}>
                  {[
                    { v: fmtUsdK(c.basis), l: 'Basis' },
                    { v: fmtUsdK(c.gross), l: 'Y1 Gross' },
                    { v: fmtUsdK(c.net),   l: 'Y1 Net' },
                    { v: c.yieldPct.toFixed(1) + '%', l: 'Net yield' },
                    { v: c.occ + '%',     l: 'Occupancy' },
                    { v: '$' + c.adr,     l: 'Avg ADR' },
                  ].map((m, i) => (
                    <div key={i} style={{ background: '#FBF8F0', padding: '14px 16px' }}>
                      <div className='display tnum' style={{ fontSize: 22, color: '#14130F', letterSpacing: '-0.01em' }}>{m.v}</div>
                      <div className='mono' style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A362F', marginTop: 4 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '12px 14px', background: c.accent, color: '#F5EFE2' }}>
                  <div className='mono' style={{ fontSize: 10, letterSpacing: '0.1em', color: '#C9A55A' }}>Headline</div>
                  <div style={{ fontSize: 15, marginTop: 4, fontStyle: 'italic' }}>{c.headline}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href={`/insights/${c.id}`} className='btn btn-primary' style={{ width: '100%' }}>Full breakdown →</Link>
                <Link href='/contact?intent=memo' className='btn btn-ghost' style={{ width: '100%', borderColor: 'rgba(20,19,15,0.2)', color: '#14130F' }}>Want similar?</Link>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(20,19,15,0.15)' }} />
        </div>
      </section>

      <section style={{ background: '#FAF6EC', padding: '80px 0', borderTop: '1px solid rgba(20,19,15,0.1)' }}>
        <div className='container cases-method-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64 }}>
          <div>
            <div className='lead-num'>How we report</div>
            <h2 className='display' style={{ fontSize: 40, marginTop: 12, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Methodology, in one column.</h2>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.75, color: '#2A2722' }}>
            <p><strong>Gross</strong> = total booking revenue, before any deductions. <strong>Net</strong> = gross minus management (LRM at 18%), property tax, utilities, supplies, insurance, and amortized capex. We do not deduct mortgage interest because most of our clients pay cash; if you finance, your net yield will be lower.</p>
            <p style={{ marginTop: 16 }}><strong>Yield</strong> = net divided by all-in basis (acquisition + closing costs + furnishing). <strong>Occupancy</strong> = booked nights divided by available nights, where &ldquo;available&rdquo; excludes owner blockouts.</p>
            <p style={{ marginTop: 16 }}>Numbers are pulled from the property&apos;s QuickBooks file at year-end and cross-checked against Booking.com and Airbnb statements. We do not anonymize — owners have consented to publication.</p>
          </div>
        </div>
      </section>

      <Disclaimer />
      <StickyCTA label='Want results like these?' cta='Schedule a Call' href='/contact' />
    </div>
  );
}
