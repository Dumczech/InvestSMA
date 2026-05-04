import { describe, it, expect, vi, beforeEach } from 'vitest';

// Template for API-route tests: mock the Supabase client + Resend at
// the module boundary so the route handler exercises its real
// validation / mapping / response shape without touching the database
// or sending real email.

const insertMock = vi.fn();
const sendMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import { POST } from '@/app/api/leads/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

const flushAsync = () => new Promise(r => setImmediate(r));

describe('POST /api/leads', () => {
  beforeEach(() => {
    insertMock.mockReset();
    sendMock.mockReset();
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_NOTIFY_TO;
    delete process.env.LEAD_NOTIFY_FROM;
  });

  it('inserts a mapped lead row and returns ok', async () => {
    insertMock.mockResolvedValueOnce({ error: null });

    const res = await POST(makeReq({
      name: 'Ada',
      email: 'ada@example.com',
      phone: '555-0100',
      buyerType: 'first-time',
      sourcePage: '/contact',
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      phone: '555-0100',
      budget: null,
      timeline: null,
      buyer_type: 'first-time',
      neighborhoods: null,
      message: null,
      source_page: '/contact',
    });
  });

  it("defaults source_page to 'unknown' when omitted", async () => {
    insertMock.mockResolvedValueOnce({ error: null });

    await POST(makeReq({ name: 'Bob', email: 'bob@example.com' }));

    expect(insertMock.mock.calls[0][0].source_page).toBe('unknown');
  });

  it('returns 500 with a generic message when Supabase errors', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'duplicate key' } });

    const res = await POST(makeReq({ name: 'Cleo', email: 'cleo@example.com' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'Lead capture failed' });
  });

  it('skips Resend when RESEND_API_KEY is unset', async () => {
    insertMock.mockResolvedValueOnce({ error: null });

    await POST(makeReq({ name: 'Dee', email: 'dee@example.com' }));
    await flushAsync();

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends a Resend notification when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.LEAD_NOTIFY_TO = 'team@example.com';
    process.env.LEAD_NOTIFY_FROM = 'noreply@example.com';
    insertMock.mockResolvedValueOnce({ error: null });
    sendMock.mockResolvedValueOnce({ id: 'msg-1' });

    await POST(makeReq({
      name: 'Eve',
      email: 'eve@example.com',
      message: 'Looking for a 4BR Centro property',
    }));
    await flushAsync();

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe('team@example.com');
    expect(call.from).toBe('noreply@example.com');
    expect(call.replyTo).toBe('eve@example.com');
    expect(call.subject).toContain('Eve');
    expect(call.html).toContain('eve@example.com');
    expect(call.html).toContain('Looking for a 4BR Centro property');
  });

  it('still returns ok when Resend send throws (best-effort email)', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    insertMock.mockResolvedValueOnce({ error: null });
    sendMock.mockRejectedValueOnce(new Error('Resend down'));

    const res = await POST(makeReq({ name: 'Fox', email: 'fox@example.com' }));
    await flushAsync();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
