import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/admin/manual-entry/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/manual-entry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/admin/manual-entry', () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
  });

  it('inserts the row into the requested table with status=draft and the given sourceType', async () => {
    insertMock.mockResolvedValueOnce({ error: null });

    const res = await POST(makeReq({
      table: 'market_monthly_performance',
      sourceType: 'airdna',
      row: { period: '2026', month: 4, year: 2026, lrm_occupancy: 68 },
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith('market_monthly_performance');
    expect(insertMock).toHaveBeenCalledWith({
      period: '2026', month: 4, year: 2026, lrm_occupancy: 68,
      status: 'draft',
      source_type: 'airdna',
    });
  });

  it("defaults source_type to 'manual' when not provided", async () => {
    insertMock.mockResolvedValueOnce({ error: null });

    await POST(makeReq({
      table: 'market_monthly_performance',
      row: { period: '2026' },
    }));

    expect(insertMock.mock.calls[0][0].source_type).toBe('manual');
  });

  it('returns 500 with a generic error when Supabase fails', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'rls denied' } });

    const res = await POST(makeReq({
      table: 'market_monthly_performance',
      row: { period: '2026' },
    }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'Manual entry failed' });
  });
});
