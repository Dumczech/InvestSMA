import { describe, it, expect, vi, beforeEach } from 'vitest';

const eqB = vi.fn();
const eqA = vi.fn(() => ({ eq: eqB }));
const updateMock = vi.fn(() => ({ eq: eqA }));
const fromMock = vi.fn(() => ({ update: updateMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/admin/publish-batch/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/publish-batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/admin/publish-batch', () => {
  beforeEach(() => {
    eqA.mockClear();
    eqB.mockReset();
    updateMock.mockClear();
    fromMock.mockClear();
  });

  it('publishes only verified rows in the requested batch on the requested table', async () => {
    eqB.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq({
      table: 'market_monthly_performance',
      importBatchId: 'b-123',
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith('market_monthly_performance');
    expect(updateMock).toHaveBeenCalledWith({ status: 'published' });
    expect(eqA).toHaveBeenCalledWith('import_batch_id', 'b-123');
    expect(eqB).toHaveBeenCalledWith('status', 'verified');
  });

  it('returns 500 if the call throws', async () => {
    eqB.mockRejectedValueOnce(new Error('rls'));

    const res = await POST(makeReq({ table: 't', importBatchId: 'b' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
  });
});
