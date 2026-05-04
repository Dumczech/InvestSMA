import { describe, it, expect, vi, beforeEach } from 'vitest';

const eqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: eqMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) => {
      if (table !== 'leads') throw new Error(`unexpected table ${table}`);
      return { update: updateMock };
    },
  }),
}));

import { POST } from '@/app/api/admin/leads/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/admin/leads', () => {
  beforeEach(() => {
    eqMock.mockReset();
    updateMock.mockClear();
  });

  it('updates status by id', async () => {
    eqMock.mockResolvedValueOnce({ error: null });

    const res = await POST(makeReq({ id: 'abc', status: 'qualified' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(updateMock).toHaveBeenCalledWith({ status: 'qualified' });
    expect(eqMock).toHaveBeenCalledWith('id', 'abc');
  });

  it('400s when id is missing', async () => {
    const res = await POST(makeReq({ status: 'qualified' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Missing id' });
  });

  it('400s on an invalid status value', async () => {
    const res = await POST(makeReq({ id: 'abc', status: 'rad' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid status' });
  });

  it('400s when no editable fields are supplied', async () => {
    const res = await POST(makeReq({ id: 'abc' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'No editable fields supplied' });
  });

  it('returns 500 with the underlying error when Supabase fails', async () => {
    eqMock.mockResolvedValueOnce({ error: { message: 'rls denied' } });

    const res = await POST(makeReq({ id: 'abc', status: 'won' }));

    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/rls/);
  });
});
