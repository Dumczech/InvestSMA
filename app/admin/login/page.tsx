'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Faithful port of design admin/login.html — split-card sign-in panel
// on a dark background. The auth flow is mock (localStorage-only) per
// the design; replacing it with Supabase Auth is a future migration
// (TODO_AUTH).

const SESSION_KEY = 'investsma_session';

type Session = {
  email: string;
  name: string;
  initials: string;
  role: string;
  loggedInAt: number;
  expiresAt: number;
};

function persist(s: Session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

function buildSession(email: string, remember: boolean): Session {
  const name = email.split('@')[0].split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return {
    email,
    name,
    initials: email.slice(0, 2).toUpperCase(),
    role: 'Operator',
    loggedInAt: Date.now(),
    expiresAt: Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000,
  };
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/admin';

  const [email, setEmail] = useState('justin@luxrentalmgmt.com');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If already signed in, redirect to next.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw) as Session;
      if (s.expiresAt > Date.now()) router.replace(next);
    } catch {}
  }, [router, next]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) { setErr('Email and password are required.'); return; }
    if (password.length < 3) { setErr('Password too short (demo accepts any password ≥ 3 chars).'); return; }
    setErr(null); setBusy(true);
    // Simulate latency for the demo flow.
    setTimeout(() => {
      persist(buildSession(email, remember));
      router.replace(next);
    }, 600);
  };

  const ssoLogin = () => {
    setErr(null); setBusy(true);
    setTimeout(() => {
      persist(buildSession('justin@luxrentalmgmt.com', true));
      router.replace(next);
    }, 600);
  };

  return (
    <main style={{
      background: '#14130F', color: '#F5EFE2', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-sans, Inter, sans-serif)', padding: 24,
    }}>
      <div style={{
        background: '#1A1915', border: '1px solid rgba(245,239,226,0.1)',
        borderRadius: 8, padding: '48px 40px', width: '100%', maxWidth: 420,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span style={{ width: 24, height: 24, background: '#C9A55A', borderRadius: 2 }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>InvestSMA</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#B08A3E', padding: '3px 8px', border: '1px solid rgba(176,138,62,0.4)', marginLeft: 8, textTransform: 'uppercase' }}>
            Admin
          </span>
        </div>

        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Sign in to your workspace</div>
        <div style={{ fontSize: 13, color: 'rgba(245,239,226,0.55)', marginBottom: 32, lineHeight: 1.5 }}>
          Operator access to leads, properties, market data, and CMS.
        </div>

        <div style={{
          background: 'rgba(201,165,90,0.08)',
          border: '1px solid rgba(201,165,90,0.2)',
          color: '#DAB76C',
          padding: '10px 14px',
          borderRadius: 4,
          fontSize: 12,
          marginBottom: 24,
          fontFamily: 'var(--f-mono)',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#C9A55A' }}>Demo:</strong> any email + password works.<br />
          Try <strong style={{ color: '#C9A55A' }}>justin@luxrentalmgmt.com</strong> / <strong style={{ color: '#C9A55A' }}>demo</strong>
        </div>

        {err && (
          <div style={{
            background: 'rgba(220,80,60,0.15)', border: '1px solid rgba(220,80,60,0.4)',
            color: '#F4B8AC', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16,
          }}>
            {err}
          </div>
        )}

        <form onSubmit={submit}>
          <LoginField label='Work email'>
            <input
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={loginInputStyle}
            />
          </LoginField>

          <LoginField
            label={
              <>
                Password{' '}
                <button
                  type='button'
                  onClick={() => alert('Reset link sent to your email (demo).')}
                  style={{ float: 'right', fontSize: 11, color: '#C9A55A', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Forgot?
                </button>
              </>
            }
          >
            <input
              type='password'
              autoComplete='current-password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={loginInputStyle}
            />
          </LoginField>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 24px', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(245,239,226,0.8)' }}>
              <input type='checkbox' checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#C9A55A' }} />
              Keep me signed in for 30 days
            </label>
          </div>

          <button
            type='submit'
            disabled={busy}
            style={{
              width: '100%',
              padding: 12,
              background: '#C9A55A',
              color: '#14130F',
              border: 'none',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              opacity: busy ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', margin: '24px 0', fontSize: 11,
          color: 'rgba(245,239,226,0.4)', letterSpacing: '0.14em',
          fontFamily: 'var(--f-mono)', textTransform: 'uppercase',
        }}>
          or
        </div>

        <button
          type='button'
          onClick={ssoLogin}
          disabled={busy}
          style={{
            width: '100%', padding: 10, background: 'transparent', color: '#F5EFE2',
            border: '1px solid rgba(245,239,226,0.15)', borderRadius: 4, fontSize: 13,
            cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, fontFamily: 'inherit',
          }}
        >
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'rgba(245,239,226,0.4)', fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
          Need access? <a href='/contact' style={{ color: 'rgba(245,239,226,0.6)', textDecoration: 'none' }}>Contact your admin →</a><br />
          <span style={{ opacity: 0.6 }}>© 2026 Luxury Rental Management</span>
        </div>
      </div>
    </main>
  );
}

const loginInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#14130F',
  border: '1px solid rgba(245,239,226,0.15)',
  borderRadius: 4,
  color: '#F5EFE2',
  fontSize: 14,
  fontFamily: 'inherit',
};

function LoginField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'rgba(245,239,226,0.65)',
        marginBottom: 6, fontFamily: 'var(--f-mono)',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
