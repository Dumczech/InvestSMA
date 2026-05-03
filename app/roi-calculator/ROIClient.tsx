'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// Faithful port of design5/.../roi.jsx — gated underwriting tool.
// The "unlock" gate posts to /api/leads (PR #6+) so the lead is captured
// regardless of whether the user proceeds to /contact afterward.

const NBHD_DATA: Record<string, { adrBase: number; occ: number; premium: number }> = {
  'Centro Histórico': { adrBase: 418, occ: 68, premium: 1.15 },
  Atascadero: { adrBase: 362, occ: 64, premium: 1.0 },
  'San Antonio': { adrBase: 294, occ: 65, premium: 0.85 },
  'Los Frailes': { adrBase: 312, occ: 60, premium: 0.9 },
  'El Chorro': { adrBase: 486, occ: 66, premium: 1.25 },
};

type Inputs = {
  budget: number;
  downPayment: number;
  propertyType: string;
  nbhd: keyof typeof NBHD_DATA;
  beds: number;
  personalDays: number;
  upgradeBudget: number;
};

function calcROI(inputs: Inputs) {
  const nb = NBHD_DATA[inputs.nbhd];
  const bedMultiplier: Record<number, number> = { 2: 0.65, 3: 0.85, 4: 1.0, 5: 1.25, 6: 1.45 };
  const adrMid = Math.round(nb.adrBase * (bedMultiplier[inputs.beds] ?? 1));
  const adrLow = Math.round(adrMid * 0.85);
  const adrHigh = Math.round(adrMid * 1.25);
  const upgradeBoost = Math.min((inputs.upgradeBudget / inputs.budget) * 0.15, 0.12);
  const occ = Math.min(nb.occ + upgradeBoost * 100 - (inputs.personalDays / 365) * 50, 92);
  const availableNights = 365 - inputs.personalDays;
  const occupiedNights = availableNights * (occ / 100);
  const grossLow = Math.round(occupiedNights * adrLow);
  const grossHigh = Math.round(occupiedNights * adrHigh);
  const grossMid = Math.round((grossLow + grossHigh) / 2);
  const netMid = Math.round(grossMid * 0.55);
  const cashOnCash = (netMid / inputs.downPayment) * 100;
  const capRate = (netMid / inputs.budget) * 100;
  let strategy = 'Balanced rental';
  if (inputs.personalDays > 90) strategy = 'Hybrid personal-use';
  else if (cashOnCash > 12) strategy = 'High-yield rental';
  else if (inputs.upgradeBudget / inputs.budget > 0.08) strategy = 'Value-add upgrade play';
  return {
    adrLow, adrMid, adrHigh,
    occ: Math.round(occ),
    grossLow, grossMid, grossHigh,
    netMid, cashOnCash, capRate, strategy,
  };
}

export default function ROIClient() {
  const [inputs, setInputs] = useState<Inputs>({
    budget: 1500000,
    downPayment: 450000,
    propertyType: 'Colonial',
    nbhd: 'Centro Histórico',
    beds: 4,
    personalDays: 30,
    upgradeBudget: 50000,
  });
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', timeline: '' });

  const results = useMemo(() => calcROI(inputs), [inputs]);
  const update = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInputs(s => ({ ...s, [k]: v }));

  const submitGate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          timeline: contact.timeline,
          budget: `$${(inputs.budget / 1000).toFixed(0)}K`,
          buyerType: `ROI calc · ${inputs.beds}BD ${inputs.nbhd}`,
          message: `Calculated: ${results.strategy}. Gross $${(results.grossMid / 1000).toFixed(0)}K, CoC ${results.cashOnCash.toFixed(1)}%`,
          sourcePage: '/roi-calculator',
        }),
      });
    } catch {
      // Show results regardless
    }
    setUnlocked(true);
    setShowGate(false);
  };

  return (
    <>
      {/* HERO */}
      <section
        className='surface-dark'
        style={{ background: '#14130F', color: '#F5EFE2', padding: '64px 0 32px' }}
      >
        <div className='container'>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64, alignItems: 'end' }}
            className='hero-grid'
          >
            <div>
              <div className='lead-num' style={{ color: '#C9A55A' }}>Tool · ROI Underwriter v3.2</div>
              <h1
                className='display'
                style={{
                  fontSize: 'clamp(48px, 6vw, 88px)',
                  margin: '16px 0 0',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.98,
                }}
              >
                Underwrite an SMA
                <br />
                <span className='display-italic' style={{ color: '#D9CFB8' }}>
                  rental property in 90 seconds.
                </span>
              </h1>
              <p
                style={{
                  marginTop: 24,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(245,239,226,0.78)',
                  maxWidth: 540,
                }}
              >
                Real ADR, occupancy, and seasonality data — applied to your budget. Full results
                gated to verified investors.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {[
                { v: 'Live', l: 'Q1 2026 data' },
                { v: '312', l: 'Properties indexed' },
                { v: '< 2 min', l: 'Avg time' },
              ].map((s, i) => (
                <div key={i} style={{ minWidth: 120 }}>
                  <div className='display tnum' style={{ fontSize: 32, color: '#C9A55A' }}>{s.v}</div>
                  <div className='data-label' style={{ marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ background: '#FBF8F0', padding: '48px 0 120px' }}>
        <div className='container'>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32 }}
            className='roi-grid'
          >
            {/* INPUTS */}
            <div
              style={{
                background: '#FAF6EC',
                border: '1px solid rgba(20,19,15,0.1)',
                padding: 40,
              }}
            >
              <div className='data-label'>Inputs · Step 01</div>
              <div className='display' style={{ fontSize: 32, marginTop: 8, marginBottom: 32 }}>
                Your investment parameters
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <SliderRow
                  label='Investment budget'
                  value={inputs.budget}
                  min={500000}
                  max={5000000}
                  step={50000}
                  onChange={v => update('budget', v)}
                  format={v => `$${(v / 1_000_000).toFixed(2)}M`}
                />
                <SliderRow
                  label='Down payment'
                  value={inputs.downPayment}
                  min={100000}
                  max={inputs.budget}
                  step={25000}
                  onChange={v => update('downPayment', v)}
                  format={v => `$${(v / 1000).toFixed(0)}K · ${((v / inputs.budget) * 100).toFixed(0)}%`}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className='field-group'>
                    <label className='field-label'>Neighborhood</label>
                    <select
                      className='field-select'
                      value={inputs.nbhd}
                      onChange={e => update('nbhd', e.target.value as keyof typeof NBHD_DATA)}
                    >
                      {Object.keys(NBHD_DATA).map(n => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className='field-group'>
                    <label className='field-label'>Property type</label>
                    <select
                      className='field-select'
                      value={inputs.propertyType}
                      onChange={e => update('propertyType', e.target.value)}
                    >
                      <option>Colonial</option>
                      <option>Modern</option>
                      <option>Hacienda</option>
                      <option>Condo</option>
                    </select>
                  </div>
                </div>

                <div className='field-group'>
                  <label className='field-label'>Bedrooms</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => update('beds', n)}
                        style={{
                          flex: 1,
                          padding: 14,
                          background: inputs.beds === n ? '#14130F' : 'transparent',
                          color: inputs.beds === n ? '#F5EFE2' : '#14130F',
                          border:
                            '1px solid ' + (inputs.beds === n ? '#14130F' : 'rgba(20,19,15,0.2)'),
                          fontFamily: 'var(--f-mono)',
                          fontSize: 13,
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                      >
                        {n} BD
                      </button>
                    ))}
                  </div>
                </div>

                <SliderRow
                  label='Personal-use days / year'
                  value={inputs.personalDays}
                  min={0}
                  max={180}
                  step={5}
                  onChange={v => update('personalDays', v)}
                  format={v => `${v} days · ${Math.round(v / 30)} mo`}
                />
                <SliderRow
                  label='Upgrade / capex budget'
                  value={inputs.upgradeBudget}
                  min={0}
                  max={300000}
                  step={5000}
                  onChange={v => update('upgradeBudget', v)}
                  format={v => `$${(v / 1000).toFixed(0)}K`}
                />
              </div>
            </div>

            {/* RESULTS */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: '#14130F',
                  color: '#F5EFE2',
                  padding: 40,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className='data-label' style={{ color: '#C9A55A' }}>Output · Estimated returns</div>
                <div
                  className='display'
                  style={{ fontSize: 32, marginTop: 8, marginBottom: 32, color: '#F5EFE2' }}
                >
                  Your projection
                </div>

                <div>
                  <ResultRow
                    label='Estimated ADR range'
                    value={`$${results.adrLow}–$${results.adrHigh}`}
                    sub={`Avg $${results.adrMid}`}
                  />
                  <ResultRow
                    label='Estimated occupancy'
                    value={`${results.occ}%`}
                    sub={`After ${inputs.personalDays} owner-use days`}
                  />
                  <ResultRow
                    label='Gross revenue (Y2)'
                    value={`$${(results.grossMid / 1000).toFixed(0)}K`}
                    sub={`Range $${(results.grossLow / 1000).toFixed(0)}–$${(results.grossHigh / 1000).toFixed(0)}K`}
                    blur={!unlocked}
                  />
                  <ResultRow
                    label='Net to owner (after LRM fee)'
                    value={`$${(results.netMid / 1000).toFixed(0)}K`}
                    sub='55% net margin'
                    highlight
                    blur={!unlocked}
                  />
                  <ResultRow
                    label='Cash-on-cash return'
                    value={`${results.cashOnCash.toFixed(1)}%`}
                    sub={`On $${(inputs.downPayment / 1000).toFixed(0)}K down`}
                    blur={!unlocked}
                  />
                  <ResultRow
                    label='Suggested strategy'
                    value={results.strategy}
                    sub='Based on your inputs'
                    blur={!unlocked}
                    last
                  />
                </div>

                {!unlocked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '180px 0 0',
                      background:
                        'linear-gradient(180deg, rgba(20,19,15,0) 0%, rgba(20,19,15,0.85) 18%, rgba(20,19,15,0.98) 50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      padding: 40,
                      textAlign: 'center',
                    }}
                  >
                    <div className='display' style={{ fontSize: 28, marginBottom: 8, color: '#F5EFE2' }}>
                      Unlock full results
                    </div>
                    <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 320, marginBottom: 24 }}>
                      Verify in 30 seconds to see net revenue, cash-on-cash, and your recommended
                      strategy.
                    </p>
                    <button className='btn btn-gold' onClick={() => setShowGate(true)}>
                      Unlock Results →
                    </button>
                  </div>
                )}
              </div>

              {unlocked && (
                <div style={{ marginTop: 24, padding: 24, background: '#1F3A2E', color: '#F5EFE2' }}>
                  <div className='data-label' style={{ color: '#C9A55A' }}>Next step</div>
                  <div className='display' style={{ fontSize: 22, marginTop: 8, marginBottom: 16 }}>
                    Want a property matched to your criteria?
                  </div>
                  <Link href='/contact' className='btn btn-gold'>
                    Send me 3 matching properties →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {unlocked && <Sensitivity inputs={inputs} results={results} />}
        </div>
      </section>

      {showGate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,19,15,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setShowGate(false)}
        >
          <div
            style={{ background: '#FBF8F0', maxWidth: 560, width: '100%', padding: 48, position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGate(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#14130F',
              }}
              aria-label='close'
            >
              ×
            </button>
            <div className='data-label'>Step 02 · Verify</div>
            <div className='display' style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
              Almost there.
            </div>
            <p style={{ fontSize: 14, color: '#3A362F', marginBottom: 32 }}>
              We send each underwriting summary as a PDF so you can review later. We do not share
              your information with brokers.
            </p>
            <form
              onSubmit={submitGate}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <div className='field-group'>
                <label className='field-label'>Full name</label>
                <input
                  required
                  className='field-input'
                  value={contact.name}
                  onChange={e => setContact(s => ({ ...s, name: e.target.value }))}
                  placeholder='Jane Calloway'
                />
              </div>
              <div className='field-group'>
                <label className='field-label'>Email</label>
                <input
                  required
                  type='email'
                  className='field-input'
                  value={contact.email}
                  onChange={e => setContact(s => ({ ...s, email: e.target.value }))}
                  placeholder='jane@example.com'
                />
              </div>
              <div className='field-group'>
                <label className='field-label'>Phone</label>
                <input
                  required
                  type='tel'
                  className='field-input'
                  value={contact.phone}
                  onChange={e => setContact(s => ({ ...s, phone: e.target.value }))}
                  placeholder='+1 (415) 555-0184'
                />
              </div>
              <div className='field-group'>
                <label className='field-label'>Buying timeline</label>
                <select
                  required
                  className='field-select'
                  value={contact.timeline}
                  onChange={e => setContact(s => ({ ...s, timeline: e.target.value }))}
                >
                  <option value='' disabled>Select timeline</option>
                  <option>0–3 months</option>
                  <option>3–6 months</option>
                  <option>6–12 months</option>
                  <option>12+ months</option>
                  <option>Researching only</option>
                </select>
              </div>
              <button type='submit' className='btn btn-gold'>Show My Results →</button>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  opacity: 0.5,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                No spam · No broker referrals · We email once
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SliderRow({
  label, value, min, max, step, onChange, format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div className='field-group'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label className='field-label'>{label}</label>
        <span
          className='mono tnum'
          style={{
            fontSize: 16,
            fontFamily: 'var(--f-display)',
            letterSpacing: '-0.01em',
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#B08A3E', marginTop: 4 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          color: '#3A362F',
          opacity: 0.6,
          letterSpacing: '0.06em',
        }}
      >
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function ResultRow({
  label, value, sub, highlight, last, blur,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  last?: boolean;
  blur?: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px 0',
        borderBottom: last ? 'none' : '1px solid rgba(245,239,226,0.1)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 24,
        alignItems: 'baseline',
        filter: blur ? 'blur(8px)' : 'none',
        transition: 'filter 200ms',
      }}
    >
      <div>
        <div className='data-label' style={{ color: '#C9A55A' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{sub}</div>}
      </div>
      <div
        className='display tnum'
        style={{ fontSize: highlight ? 40 : 28, color: highlight ? '#C9A55A' : '#F5EFE2' }}
      >
        {value}
      </div>
    </div>
  );
}

function Sensitivity({
  inputs,
  results,
}: {
  inputs: Inputs;
  results: ReturnType<typeof calcROI>;
}) {
  const scenarios = [
    { name: 'Bear', occ: results.occ - 12, adr: results.adrLow * 0.9, color: '#9B4A3A' },
    { name: 'Base', occ: results.occ, adr: results.adrMid, color: '#3A362F' },
    { name: 'Bull', occ: results.occ + 8, adr: results.adrHigh, color: '#1F3A2E' },
  ];
  return (
    <div style={{ marginTop: 64 }}>
      <div className='data-label'>Sensitivity Analysis</div>
      <div className='display' style={{ fontSize: 36, marginTop: 8, marginBottom: 24 }}>
        Scenarios across the cycle
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
        className='sensitivity-grid'
      >
        {scenarios.map((s, i) => {
          const nights = (365 - inputs.personalDays) * (s.occ / 100);
          const gross = Math.round(nights * s.adr);
          const net = Math.round(gross * 0.55);
          const coc = (net / inputs.downPayment) * 100;
          return (
            <div
              key={i}
              style={{
                padding: 28,
                background: i === 1 ? '#FAF6EC' : '#FBF8F0',
                border: '1px solid ' + (i === 1 ? '#14130F' : 'rgba(20,19,15,0.1)'),
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <span
                  className='mono'
                  style={{
                    fontSize: 11,
                    color: s.color,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.name} case
                </span>
                {i === 1 && (
                  <span
                    className='chip'
                    style={{
                      background: '#14130F',
                      color: '#C9A55A',
                      borderColor: '#14130F',
                    }}
                  >
                    Most likely
                  </span>
                )}
              </div>
              <div className='display tnum' style={{ fontSize: 44, marginTop: 16 }}>
                ${(gross / 1000).toFixed(0)}K
              </div>
              <div className='data-label' style={{ marginTop: 4 }}>Gross revenue / yr</div>
              <div
                style={{
                  marginTop: 24,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <div className='data-label'>Net to owner</div>
                  <div className='mono tnum' style={{ fontSize: 18, marginTop: 4 }}>
                    ${(net / 1000).toFixed(0)}K
                  </div>
                </div>
                <div>
                  <div className='data-label'>Cash-on-cash</div>
                  <div
                    className='mono tnum'
                    style={{ fontSize: 18, marginTop: 4, color: '#1F3A2E' }}
                  >
                    {coc.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
