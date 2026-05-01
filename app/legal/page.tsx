import type { Metadata } from 'next';
import Link from 'next/link';
import { getLegalContent } from '@/lib/data/cms';
import LegalClient from './LegalClient';

export const metadata: Metadata = {
  title: 'Disclosures & Terms — InvestSMA',
  description:
    'Disclosures, terms of use, and risk disclaimers for InvestSMA. We are not a real estate brokerage and do not provide investment, legal, or tax advice.',
};

// Server-rendered shell that loads content from site_content and hands the
// rest off to a client component for the scroll-spy TOC. Mirrors the design
// in design3/.../legal.jsx; copy preserved when no row exists.
export default async function LegalPage() {
  const content = await getLegalContent();

  const lastUpdatedLong = new Date(content.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const lastUpdatedShort = new Date(content.lastUpdated).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className='doc-page' data-screen-label='Legal'>
      {/* ===== HERO ===== */}
      <section
        className='dark'
        style={{ background: '#14130F', color: '#F5EFE2', paddingTop: 56, paddingBottom: 64 }}
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
            <span>§ Legal</span>
            <span>InvestSMA · Operated by Luxury Rental Management</span>
            <span>Last updated · {lastUpdatedLong}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 80,
              paddingTop: 56,
              alignItems: 'end',
            }}
            className='hero-grid'
          >
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Page · Disclosures & Terms</div>
              <h1
                className='display'
                style={{
                  fontSize: 'clamp(48px, 6vw, 88px)',
                  margin: '20px 0 0',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.96,
                }}
              >
                Disclosures &amp;
                <br />
                <span className='display-italic' style={{ color: '#C9A55A' }}>terms of use.</span>
              </h1>
            </div>
            <div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)' }}>
                Two short documents that clarify our role and set appropriate expectations. We are
                not a brokerage, and nothing on this site is investment, legal, or tax advice. Read
                both before engaging.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <a href='#disclosures' className='btn btn-gold'>Disclosures →</a>
                <a
                  href='#terms'
                  className='btn btn-ghost'
                  style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.3)' }}
                >
                  Terms of use →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY (TOC + clauses) — client component for scroll-spy ===== */}
      <LegalClient
        disclosures={content.disclosures}
        terms={content.terms}
        docCode={content.docCode}
        version={content.version}
        lastUpdatedLabel={lastUpdatedShort}
      />
    </div>
  );
}
