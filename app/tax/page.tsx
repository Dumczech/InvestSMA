import type { Metadata } from 'next';
import Link from 'next/link';
import { Disclaimer, StickyCTA } from '@/components/site';

// Faithful port of design tax.jsx — Mexican tax & ownership primer
// for foreign SMA buyers. Static editorial content; sticky topic
// sidebar + 6 anchor sections.

export const metadata: Metadata = {
  title: 'Tax & Ownership · InvestSMA',
  description:
    'Mexican tax law for foreign property owners — fideicomiso vs. SA de CV, IVA, ISR, capital gains, predial, US tax implications. Six topics every SMA owner should understand.',
};

const TOPICS = [
  {
    id: 'fideicomiso', num: '01', title: 'Fideicomiso vs. SA de CV',
    summary: 'The two ways foreigners hold property in restricted-zone Mexico. When each one makes sense.',
    bullets: [
      { k: 'Fideicomiso', v: 'Bank trust · 50-yr renewable · setup $1,800–$2,500 · annual $550–$750' },
      { k: 'SA de CV',    v: 'Mexican corp · direct ownership · setup $3,500–$5,000 · annual ~$2,400 accounting' },
      { k: 'Rule of thumb', v: 'Single property under $1.5M → fideicomiso. 3+ properties or commercial use → corporation.' },
    ],
  },
  {
    id: 'iva', num: '02', title: 'IVA on rental income',
    summary: 'The 16% value-added tax on furnished rentals — and how the platforms handle it.',
    bullets: [
      { k: 'Rate',       v: '16% on furnished/STR rental gross. Unfurnished residential is exempt.' },
      { k: 'Collection', v: 'Booking.com and Airbnb withhold and remit on your behalf — but only if you have given them your RFC.' },
      { k: 'No RFC?',    v: 'Platforms withhold at higher penalty rates. Always register an RFC in week one.' },
    ],
  },
  {
    id: 'isr', num: '03', title: 'ISR (income tax)',
    summary: 'Two regimes. The default is bad. The optional one usually saves 25–30%.',
    bullets: [
      { k: 'Default',          v: '25% withholding on gross rental income. No deductions allowed. Simple but expensive.' },
      { k: 'Optional regime',  v: 'Standard income-tax brackets on net (gross minus deductions). 18–22% effective is typical.' },
      { k: 'What you can deduct', v: 'Management fees, depreciation, repairs, utilities, insurance, supplies, fiscal accounting fees.' },
    ],
  },
  {
    id: 'capgains', num: '04', title: 'Capital gains at exit',
    summary: 'Three numbers most owners do not understand until it is too late.',
    bullets: [
      { k: 'Non-residents', v: '25% on gross sale price OR 35% on the gain (you elect). The 4% notario flat rate is a withholding, not the final tax.' },
      { k: 'Tax residents', v: 'Personal-residence exemption shields ~$700K USD of gain. Requires 183+ days in Mexico in the relevant year.' },
      { k: 'INPC indexing', v: 'Acquisition basis is indexed to inflation — meaningfully reduces taxable gain on properties held 5+ years.' },
    ],
  },
  {
    id: 'predial', num: '05', title: 'Predial (property tax)',
    summary: 'Annual property tax — low, but with two gotchas.',
    bullets: [
      { k: 'Rate',     v: 'Roughly 0.10–0.25% of cadastral value annually. Paid in February for a small early-bird discount.' },
      { k: 'Gotcha #1', v: 'Cadastral value can be reassessed when title transfers. Budget +12–18% on the first post-purchase bill.' },
      { k: 'Gotcha #2', v: 'Predial arrears stay with the property, not the seller. Always verify zero-balance certificates at closing.' },
    ],
  },
  {
    id: 'us-tax', num: '06', title: 'US tax implications',
    summary: 'For US persons. Foreign Mexican rental income IS taxed in the US — with credits.',
    bullets: [
      { k: 'Schedule E', v: 'You report rental income/expenses on Schedule E like any rental. Property must be depreciated over 30 years (foreign).' },
      { k: 'FTC',        v: 'Mexican income tax paid generates a Foreign Tax Credit on the US return — usually washes most of the US liability.' },
      { k: 'Reporting',  v: 'Form 8938 if total foreign assets exceed thresholds. FBAR if you have foreign bank accounts > $10K aggregate.' },
    ],
  },
];

export default function TaxPage() {
  return (
    <div className='doc-page' data-screen-label='Tax-Ownership'>
      <section className='surface-dark' style={{ background: '#14130F', color: '#F5EFE2', padding: '80px 0 64px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2A2722 0%, #14130F 80%)' }} />
        <div className='container' style={{ position: 'relative' }}>
          <div className='lead-num' style={{ color: '#C9A55A' }}>Primer · Tax &amp; Ownership</div>
          <h1 className='display' style={{ fontSize: 'clamp(48px, 6vw, 88px)', margin: '20px 0 24px', letterSpacing: '-0.025em', lineHeight: 0.98, maxWidth: 1100 }}>
            Mexican tax law for <span className='display-italic' style={{ color: '#D9CFB8' }}>foreign property owners.</span>
          </h1>
          <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.55, color: 'rgba(245,239,226,0.78)', maxWidth: 720 }}>
            Less complicated than it looks — but the cost of getting it wrong is high. Six topics every SMA owner should understand by week one of ownership.
          </p>
          <div className='mono' style={{ fontSize: 11, marginTop: 32, padding: '12px 16px', background: 'rgba(201,165,90,0.1)', border: '1px solid rgba(201,165,90,0.3)', display: 'inline-block', color: '#C9A55A', letterSpacing: '0.06em' }}>
            ⚠ This is a summary, not legal or tax advice. Your situation is specific. Talk to a Mexican fiscal accountant.
          </div>
        </div>
      </section>

      <section style={{ background: '#FBF8F0', padding: '64px 0' }}>
        <div className='container tax-layout' style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 64, alignItems: 'start' }}>
          <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A362F', marginBottom: 16 }}>Topics</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TOPICS.map(t => (
                <li key={t.id}>
                  <a href={`#${t.id}`} style={{ display: 'flex', gap: 10, color: '#14130F', textDecoration: 'none', fontSize: 14, lineHeight: 1.3 }}>
                    <span className='mono' style={{ fontSize: 10, color: '#B08A3E' }}>{t.num}</span>
                    <span>{t.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className='surface-dark' style={{ marginTop: 32, padding: 16, background: '#1F3A2E', color: '#F5EFE2' }}>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.14em', color: '#C9A55A' }}>Want a referral?</div>
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>We refer to two SMA-based fiscal accountants. Free intros for clients.</div>
              <Link href='/contact?intent=tax-referral' style={{ color: '#C9A55A', marginTop: 12, display: 'inline-block', fontSize: 11, textDecoration: 'none' }}>Request intro →</Link>
            </div>
          </aside>
          <div>
            {TOPICS.map(t => (
              <div
                key={t.id}
                id={t.id}
                style={{ borderTop: '1px solid rgba(20,19,15,0.15)', padding: '40px 0', display: 'grid', gridTemplateColumns: '80px 1fr', gap: 32, scrollMarginTop: 80 }}
                className='tax-topic'
              >
                <div className='display tnum' style={{ fontSize: 36, color: '#C9A55A', letterSpacing: '-0.02em' }}>{t.num}</div>
                <div>
                  <h2 className='display' style={{ fontSize: 36, lineHeight: 1.1, color: '#14130F', letterSpacing: '-0.015em' }}>{t.title}</h2>
                  <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.6, color: '#2A2722', fontStyle: 'italic', maxWidth: 720 }}>{t.summary}</p>
                  <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(20,19,15,0.12)', border: '1px solid rgba(20,19,15,0.12)' }}>
                    {t.bullets.map((b, i) => (
                      <div key={i} style={{ background: '#FAF6EC', padding: '18px 24px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'baseline' }} className='tax-bullet'>
                        <div className='mono' style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1F3A2E' }}>{b.k}</div>
                        <div style={{ fontSize: 15, lineHeight: 1.6, color: '#2A2722' }}>{b.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(20,19,15,0.15)' }} />
          </div>
        </div>
      </section>

      <Disclaimer />
      <StickyCTA label='Need a tax referral?' cta='Get intro' href='/contact?intent=tax-referral' />
    </div>
  );
}
