import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const insertSelectSingleMock = vi.fn();
const insertMock = vi.fn(() => ({ select: () => ({ single: insertSelectSingleMock }) }));
const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));

const fromMock = vi.fn((table: string) => {
  if (table !== 'market_reports') throw new Error(`unexpected table ${table}`);
  return {
    select: () => ({ order: orderMock }),
    insert: insertMock,
    update: updateMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/market-reports/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/market-reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('GET /api/admin/market-reports', () => {
  beforeEach(() => {
    orderMock.mockReset();
  });

  it('returns rows ordered by created_at desc', async () => {
    const rows = [{ id: 1, title: 'Q1' }];
    orderMock.mockResolvedValueOnce({ data: rows, error: null });

    const res = await GET();

    expect(await res.json()).toEqual({ ok: true, data: rows });
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('falls back to ok:false with empty data on error', async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: 'rls' } });

    const res = await GET();

    expect(await res.json()).toEqual({ ok: false, data: [] });
  });
});

describe('POST /api/admin/market-reports', () => {
  beforeEach(() => {
    insertSelectSingleMock.mockReset();
    insertMock.mockClear();
    updateEqMock.mockReset();
    updateMock.mockClear();
  });

  it('400s when title is missing', async () => {
    const res = await POST(makeReq({ period: 'Q1 2026' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'title and period are required' });
  });

  it('400s when period is missing', async () => {
    const res = await POST(makeReq({ title: 'Q1' }));
    expect(res.status).toBe(400);
  });

  it('inserts a new row and returns the new id', async () => {
    insertSelectSingleMock.mockResolvedValueOnce({ data: { id: 42 }, error: null });

    const res = await POST(makeReq({
      title: '  Q1 Report  ',
      period: '  Q1 2026  ',
      summary: '  short  ',
      pdf_path: ' /reports/q1.pdf ',
      published: 'true',
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 42 });
    // Insert seeds download_count: 0 and defaults gated to true.
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Q1 Report',
      period: 'Q1 2026',
      gated: true,
      download_count: 0,
    }));
  });

  it('honors an explicit gated=false on insert', async () => {
    insertSelectSingleMock.mockResolvedValueOnce({ data: { id: 51 }, error: null });

    await POST(makeReq({
      title: 'Internal benchmark',
      period: 'Q2 2026',
      gated: false,
    }));

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ gated: false }));
  });

  it('updates by id when id is provided and skips insert (no download_count overwrite)', async () => {
    updateEqMock.mockResolvedValueOnce({ error: null });

    const res = await POST(makeReq({
      id: 7,
      title: 'Q1',
      period: 'Q1 2026',
      published: false,
      gated: false,
    }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 7 });
    expect(updateEqMock).toHaveBeenCalledWith('id', 7);
    expect(insertSelectSingleMock).not.toHaveBeenCalled();
    // Update path explicitly omits download_count so editors can't reset it.
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Q1',
      gated: false,
      published: false,
    }));
    expect(updateMock.mock.calls[0][0]).not.toHaveProperty('download_count');
  });

  it('returns 500 with the error message when Supabase fails on insert', async () => {
    insertSelectSingleMock.mockResolvedValueOnce({ data: null, error: new Error('duplicate') });

    const res = await POST(makeReq({ title: 'Q1', period: 'Q1 2026' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'duplicate' });
  });
});
