'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

// Hero subscribe input on /insights. The design treated this as a
// stub (preventDefault), but we route the email to /contact?subscribe=1
// so the lead capture form can prefill it — soft-converting "I want
// updates" into the existing lead funnel without a separate API.

export function SubscribeForm({ placeholder, submitLabel }: { placeholder: string; submitLabel: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const qs = new URLSearchParams({ intent: 'subscribe', email: trimmed }).toString();
    router.push(`/contact?${qs}`);
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, alignSelf: 'end', flexWrap: 'wrap' }}>
      <input
        type='email'
        name='email'
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(245,239,226,0.05)',
          border: '1px solid rgba(245,239,226,0.2)',
          padding: '12px 16px',
          color: '#F5EFE2',
          fontFamily: 'var(--f-mono)',
          fontSize: 12,
          minWidth: 220,
          outline: 'none',
        }}
      />
      <button className='btn btn-gold' type='submit'>{submitLabel}</button>
    </form>
  );
}
