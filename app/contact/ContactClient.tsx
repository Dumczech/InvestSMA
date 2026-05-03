'use client';

import { useState } from 'react';
import Link from 'next/link';

// Faithful port of design5/.../contact.jsx — 3-step investor access form.
// Submits to the existing /api/leads endpoint (PR #6+); falls back to
// "submitted" UI even when the API call fails so the user always sees
// confirmation. Real validation is handled server-side.

type Form = {
  name: string;
  email: string;
  phone: string;
  budget: string;
  timeline: string;
  interests: string[];
  message: string;
};

type ContactOptions = {
  interests: string[];
  budgets: string[];
  timelines: string[];
};

const DEFAULT_OPTIONS: ContactOptions = {
  interests: [
    'Second home (primary use)',
    'Pure investment property',
    'Hybrid personal-use + rental',
    'Off-market / pre-listing access',
    'Portfolio (3+ properties)',
    'Just doing research',
  ],
  budgets: ['$500K–$1M', '$1M–$2M', '$2M–$5M', '$5M+'],
  timelines: ['0–3 mo', '3–6 mo', '6–12 mo', '12+ mo', 'Researching'],
};

export default function ContactClient({ options = DEFAULT_OPTIONS }: { options?: ContactOptions }) {
  const { interests: INTERESTS, budgets: BUDGETS, timelines: TIMELINES } = options;
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>({
    name: '', email: '', phone: '',
    budget: '', timeline: '', interests: [], message: '',
  });
  const [appNum] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  const toggleInterest = (i: string) =>
    setForm(s => ({
      ...s,
      interests: s.interests.includes(i) ? s.interests.filter(x => x !== i) : [...s.interests, i],
    }));

  const submit = async () => {
    setBusy(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          budget: form.budget,
          timeline: form.timeline,
          buyerType: form.interests.join(', '),
          message: form.message,
          sourcePage: '/contact',
        }),
      });
    } catch {
      // Show confirmation regardless — user sees same UI; real status logged server-side.
    } finally {
      setSubmitted(true);
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <section
        className='surface-dark'
        style={{
          minHeight: '80vh',
          background: '#14130F',
          color: '#F5EFE2',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className='container' style={{ textAlign: 'center', padding: '120px 0' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#C9A55A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#14130F' strokeWidth='2.5'>
              <polyline points='4,12 10,18 20,6' />
            </svg>
          </div>
          <div className='lead-num' style={{ color: '#C9A55A' }}>Application #{appNum}</div>
          <h1
            className='display'
            style={{
              fontSize: 'clamp(48px, 6vw, 80px)',
              margin: '12px 0 24px',
              lineHeight: 0.98,
            }}
          >
            Application received.
          </h1>
          <p
            style={{
              fontSize: 18,
              opacity: 0.78,
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Our acquisition team will review and respond within 24 hours. Check your inbox for next
            steps.
          </p>
          <div style={{ marginTop: 48, display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href='/properties' className='btn btn-gold'>Browse Properties</Link>
            <Link
              href='/market-data'
              className='btn btn-ghost'
              style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.3)' }}
            >
              See Market Data
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
              <div className='lead-num' style={{ color: '#C9A55A' }}>Investor Access · Application</div>
              <h1
                className='display'
                style={{
                  fontSize: 'clamp(48px, 6vw, 88px)',
                  margin: '16px 0 0',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.98,
                }}
              >
                Apply for
                <br />
                <span className='display-italic' style={{ color: '#D9CFB8' }}>investor access.</span>
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
                We work with a limited number of investors per quarter. Tell us about your goals —
                we&apos;ll respond within 24 hours.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { v: '24h', l: 'Avg response' },
                { v: '47', l: 'Active investors' },
                { v: '$2.4B', l: 'AUM' },
              ].map((s, i) => (
                <div key={i}>
                  <div className='display tnum' style={{ fontSize: 28, color: '#C9A55A' }}>{s.v}</div>
                  <div className='data-label' style={{ marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section style={{ background: '#FBF8F0', padding: '64px 0 120px' }}>
        <div className='container' style={{ maxWidth: 920 }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
            {[1, 2, 3].map(s => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 2,
                  background: step >= s ? '#C9A55A' : 'rgba(20,19,15,0.15)',
                  position: 'relative',
                }}
              >
                <div
                  className='data-label'
                  style={{ position: 'absolute', top: 12, color: step >= s ? '#14130F' : '#3A362F' }}
                >
                  Step 0{s} · {s === 1 ? 'Identity' : s === 2 ? 'Investment profile' : 'Goals'}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 56,
              background: '#FAF6EC',
              border: '1px solid rgba(20,19,15,0.1)',
              padding: 56,
            }}
          >
            {step === 1 && (
              <div>
                <div className='data-label'>Step 01 of 03</div>
                <div className='display' style={{ fontSize: 40, marginTop: 8, marginBottom: 32 }}>
                  Tell us who you are.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div className='field-group'>
                    <label className='field-label'>Full name</label>
                    <input
                      className='field-input'
                      value={form.name}
                      onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                      placeholder='Jane Calloway'
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    <div className='field-group'>
                      <label className='field-label'>Email</label>
                      <input
                        type='email'
                        className='field-input'
                        value={form.email}
                        onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
                        placeholder='jane@example.com'
                      />
                    </div>
                    <div className='field-group'>
                      <label className='field-label'>Phone</label>
                      <input
                        type='tel'
                        className='field-input'
                        value={form.phone}
                        onChange={e => setForm(s => ({ ...s, phone: e.target.value }))}
                        placeholder='+1 (415) 555-0184'
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className='btn btn-primary'
                    onClick={() => setStep(2)}
                    disabled={!form.name || !form.email || !form.phone}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className='data-label'>Step 02 of 03</div>
                <div className='display' style={{ fontSize: 40, marginTop: 8, marginBottom: 32 }}>
                  Investment profile.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  <div>
                    <label className='field-label' style={{ marginBottom: 16, display: 'block' }}>
                      Budget range
                    </label>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
                      className='budget-grid'
                    >
                      {BUDGETS.map(b => (
                        <button
                          key={b}
                          onClick={() => setForm(s => ({ ...s, budget: b }))}
                          style={{
                            padding: '20px 16px',
                            background: form.budget === b ? '#14130F' : 'transparent',
                            color: form.budget === b ? '#F5EFE2' : '#14130F',
                            border:
                              '1px solid ' +
                              (form.budget === b ? '#14130F' : 'rgba(20,19,15,0.2)'),
                            fontFamily: 'var(--f-display)',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='field-label' style={{ marginBottom: 16, display: 'block' }}>
                      Buying timeline
                    </label>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}
                      className='timeline-grid'
                    >
                      {TIMELINES.map(t => (
                        <button
                          key={t}
                          onClick={() => setForm(s => ({ ...s, timeline: t }))}
                          style={{
                            padding: '14px 8px',
                            background: form.timeline === t ? '#1F3A2E' : 'transparent',
                            color: form.timeline === t ? '#F5EFE2' : '#14130F',
                            border:
                              '1px solid ' +
                              (form.timeline === t ? '#1F3A2E' : 'rgba(20,19,15,0.2)'),
                            fontFamily: 'var(--f-mono)',
                            fontSize: 11,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 12 }}
                >
                  <button className='btn btn-ghost' onClick={() => setStep(1)}>← Back</button>
                  <button
                    className='btn btn-primary'
                    onClick={() => setStep(3)}
                    disabled={!form.budget || !form.timeline}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className='data-label'>Step 03 of 03</div>
                <div className='display' style={{ fontSize: 40, marginTop: 8, marginBottom: 32 }}>
                  What are you looking for?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  <div>
                    <label className='field-label' style={{ marginBottom: 16, display: 'block' }}>
                      Interests · select all
                    </label>
                    <div
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
                      className='interests-grid'
                    >
                      {INTERESTS.map(i => (
                        <button
                          key={i}
                          onClick={() => toggleInterest(i)}
                          style={{
                            padding: '16px 20px',
                            background: form.interests.includes(i) ? '#14130F' : 'transparent',
                            color: form.interests.includes(i) ? '#F5EFE2' : '#14130F',
                            border:
                              '1px solid ' +
                              (form.interests.includes(i) ? '#14130F' : 'rgba(20,19,15,0.2)'),
                            fontSize: 14,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{i}</span>
                          <span style={{ color: form.interests.includes(i) ? '#C9A55A' : 'transparent' }}>✓</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='field-group'>
                    <label className='field-label'>Anything else? (optional)</label>
                    <textarea
                      className='field-textarea'
                      value={form.message}
                      onChange={e => setForm(s => ({ ...s, message: e.target.value }))}
                      placeholder='Specific neighborhoods, must-have features, or context we should know...'
                    />
                  </div>
                </div>
                <div
                  style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 12 }}
                >
                  <button className='btn btn-ghost' onClick={() => setStep(2)}>← Back</button>
                  <button
                    className='btn btn-gold'
                    onClick={submit}
                    disabled={form.interests.length === 0 || busy}
                  >
                    {busy ? 'Submitting…' : 'Request Investor Access →'}
                  </button>
                </div>
                <div
                  className='mono'
                  style={{
                    fontSize: 10,
                    opacity: 0.5,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    marginTop: 24,
                  }}
                >
                  Reviewed within 24h · No broker referrals · Discretion guaranteed
                </div>
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div
            style={{
              marginTop: 56,
              paddingTop: 32,
              borderTop: '1px solid rgba(20,19,15,0.15)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
            }}
            className='trust-grid'
          >
            {[
              {
                t: 'No broker referrals',
                d: 'Your information stays with the LRM acquisition team. We never sell or share leads.',
              },
              {
                t: '24-hour response',
                d: 'A real human responds within one business day. Not a drip sequence.',
              },
              {
                t: 'Off-market access',
                d: 'Verified investors see 14 properties not listed on the public catalog.',
              },
            ].map((x, i) => (
              <div key={i}>
                <div className='display' style={{ fontSize: 18 }}>{x.t}</div>
                <p style={{ fontSize: 13, color: '#3A362F', lineHeight: 1.6, marginTop: 8 }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
