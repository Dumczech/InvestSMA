'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LegalClause } from '@/lib/data/cms';

type Props = {
  disclosures: LegalClause[];
  terms: LegalClause[];
  docCode: string;
  version: string;
  lastUpdatedLabel: string;
};

export default function LegalClient({
  disclosures, terms, docCode, version, lastUpdatedLabel,
}: Props) {
  const [active, setActive] = useState<'disclosures' | 'terms'>('disclosures');

  useEffect(() => {
    const sections = ['disclosures', 'terms'] as const;
    const onScroll = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 120 && r.bottom > 120) {
          setActive(id);
          return;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section style={{ background: '#FBF8F0', padding: '88px 0 120px' }}>
      <div className='container'>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 64,
            alignItems: 'start',
          }}
          className='legal-body-grid'
        >
          <LegalNav
            active={active}
            counts={{ disclosures: disclosures.length, terms: terms.length }}
          />

          <div>
            {/* Disclosures */}
            <section id='disclosures' style={{ scrollMarginTop: 80 }}>
              <SectionHeader sectionNum='01' label='Disclosures' />
              <h2
                className='display'
                style={{
                  fontSize: 'clamp(40px, 5vw, 64px)',
                  margin: 0,
                  lineHeight: 1.0,
                  letterSpacing: '-0.025em',
                }}
              >
                Our role, in{' '}
                <span className='display-italic' style={{ color: '#1F3A2E' }}>plain terms</span>.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(20,19,15,0.7)',
                  maxWidth: 720,
                  marginTop: 20,
                }}
              >
                InvestSMA provides information, analysis, and operational insight related to real
                estate opportunities in San Miguel de Allende. The disclosures below clarify our
                role and set appropriate expectations.
              </p>
              <div style={{ marginTop: 48 }}>
                <ClauseList items={disclosures} sectionNum='1' />
              </div>
            </section>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                margin: '88px 0',
              }}
            >
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
              <span
                className='mono'
                style={{
                  fontSize: 10,
                  color: 'rgba(20,19,15,0.5)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                End of disclosures · Terms follow
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
            </div>

            {/* Terms */}
            <section id='terms' style={{ scrollMarginTop: 80 }}>
              <SectionHeader sectionNum='02' label='Terms of Use' />
              <h2
                className='display'
                style={{
                  fontSize: 'clamp(40px, 5vw, 64px)',
                  margin: 0,
                  lineHeight: 1.0,
                  letterSpacing: '-0.025em',
                }}
              >
                The{' '}
                <span className='display-italic' style={{ color: '#1F3A2E' }}>legal backbone</span>.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(20,19,15,0.7)',
                  maxWidth: 720,
                  marginTop: 20,
                }}
              >
                By accessing or using this website, you agree to the following terms and
                conditions. If you do not agree, you should not use this site.
              </p>
              <div style={{ marginTop: 48 }}>
                <ClauseList items={terms} sectionNum='2' />
              </div>

              {/* Acceptance footer */}
              <div
                style={{
                  marginTop: 64,
                  padding: '28px 32px',
                  background: '#14130F',
                  color: '#F5EFE2',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div className='data-label' style={{ color: '#C9A55A' }}>Acknowledgement</div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      marginTop: 8,
                      color: 'rgba(245,239,226,0.85)',
                    }}
                  >
                    By continuing to use this site or engaging with InvestSMA, you acknowledge
                    that you&apos;ve read and accepted these disclosures and terms.
                  </div>
                </div>
                <Link href='/contact' className='btn btn-gold' style={{ flexShrink: 0 }}>
                  Contact us →
                </Link>
              </div>

              {/* Document footer */}
              <div
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: '1px solid rgba(20,19,15,0.12)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(20,19,15,0.5)',
                }}
              >
                <span>Doc · {docCode} · {version}</span>
                <span>Last updated · {lastUpdatedLabel}</span>
                <a href='#top' style={{ color: 'rgba(20,19,15,0.5)' }}>↑ Back to top</a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalNav({
  active, counts,
}: {
  active: 'disclosures' | 'terms';
  counts: { disclosures: number; terms: number };
}) {
  const links = [
    { id: 'disclosures' as const, label: 'Disclosures', n: '01', count: counts.disclosures },
    { id: 'terms' as const,       label: 'Terms of Use', n: '02', count: counts.terms },
  ];
  return (
    <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
      <div className='data-label' style={{ marginBottom: 16 }}>On this page</div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          borderLeft: '1px solid rgba(20,19,15,0.15)',
        }}
      >
        {links.map(s => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                padding: '12px 16px',
                textDecoration: 'none',
                color: '#14130F',
                borderLeft:
                  active === s.id ? '2px solid #C9A55A' : '2px solid transparent',
                marginLeft: -1,
              }}
            >
              <span>
                <span
                  className='mono tnum'
                  style={{
                    fontSize: 10,
                    color: '#C9A55A',
                    letterSpacing: '0.12em',
                    marginRight: 10,
                  }}
                >
                  {s.n}
                </span>
                <span style={{ fontSize: 15 }}>{s.label}</span>
              </span>
              <span
                className='mono tnum'
                style={{ fontSize: 10, color: 'rgba(20,19,15,0.45)' }}
              >
                {s.count}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Plain-English summary */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          background: 'rgba(201,165,90,0.08)',
          borderLeft: '3px solid #C9A55A',
        }}
      >
        <div className='data-label' style={{ color: '#8E6F2D' }}>Plain-English summary</div>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 0',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          <li style={{ paddingBottom: 8 }}>· We&apos;re operators, not brokers.</li>
          <li style={{ paddingBottom: 8 }}>· Nothing here is investment / legal / tax advice.</li>
          <li style={{ paddingBottom: 8 }}>· Projections are estimates, not guarantees.</li>
          <li>· You&apos;re responsible for your own due diligence.</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 11,
          color: 'rgba(20,19,15,0.5)',
          fontFamily: 'var(--f-mono)',
          letterSpacing: '0.08em',
        }}
      >
        QUESTIONS?&nbsp;
        <a
          href='mailto:justin@luxrentalmgmt.com'
          style={{ color: '#14130F', textDecoration: 'underline' }}
        >
          justin@luxrentalmgmt.com
        </a>
      </div>
    </aside>
  );
}

function SectionHeader({ sectionNum, label }: { sectionNum: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
      <span
        className='mono tnum'
        style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}
      >
        § {sectionNum}
      </span>
      <span
        className='mono'
        style={{
          fontSize: 11,
          color: 'rgba(20,19,15,0.55)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ClauseList({ items, sectionNum }: { items: LegalClause[]; sectionNum: string }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((c, i) => (
        <li
          key={c.n}
          style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr',
            gap: 24,
            padding: '32px 0',
            borderTop:
              i === 0 ? '1px solid rgba(20,19,15,0.15)' : '1px solid rgba(20,19,15,0.08)',
          }}
        >
          <div>
            <div
              className='mono tnum'
              style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}
            >
              § {sectionNum}.{c.n}
            </div>
          </div>
          <div>
            <h3
              className='display'
              style={{ fontSize: 24, margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}
            >
              {c.t}
            </h3>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: 'rgba(20,19,15,0.78)',
                marginTop: 12,
              }}
            >
              {c.d}
            </p>
            {c.list && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
                {c.list.map((b, j) => (
                  <li
                    key={j}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: 10,
                      padding: '8px 0',
                      fontSize: 14,
                      color: 'rgba(20,19,15,0.78)',
                    }}
                  >
                    <span
                      className='mono tnum'
                      style={{ color: 'rgba(20,19,15,0.4)', fontSize: 11 }}
                    >
                      {String.fromCharCode(97 + j)}.
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
