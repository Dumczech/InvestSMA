import { describe, it, expect, vi, beforeEach } from 'vitest';

// Template for API-route tests: mock the Supabase client at the module
// boundary so the route handler exercises its real validation /
// mapping / response shape without touching the database.

const insertMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

import { POST } from '@/app/api/leads/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    insertMock.mockReset();
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
});
