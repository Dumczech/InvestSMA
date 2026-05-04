import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const upsertMock = vi.fn();
const fromMock = vi.fn((table: string) => {
  if (table !== 'site_content') throw new Error(`unexpected table ${table}`);
  return {
    select: () => ({ order: orderMock }),
    upsert: upsertMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/content/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/content', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('GET /api/admin/content', () => {
  beforeEach(() => {
    fromMock.mockClear();
    orderMock.mockReset();
  });

  it('returns rows ordered by key', async () => {
    const rows = [{ key: 'a', value: '1' }, { key: 'b', value: '2' }];
    orderMock.mockResolvedValueOnce({ data: rows });

    const res = await GET();

    expect(await res.json()).toEqual({ ok: true, data: rows });
    expect(orderMock).toHaveBeenCalledWith('key');
  });

  it('falls back to ok:false with empty data when Supabase throws', async () => {
    orderMock.mockRejectedValueOnce(new Error('boom'));

    const res = await GET();

    expect(await res.json()).toEqual({ ok: false, data: [] });
  });
});

describe('POST /api/admin/content', () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  it('upserts with default published status when not provided', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    const res = await POST(makeReq({ key: 'hero_title', value: 'Hi' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(upsertMock).toHaveBeenCalledWith(
      { key: 'hero_title', value: 'Hi', status: 'published', updated_by: 'admin' },
      { onConflict: 'key' },
    );
  });

  it('passes through an explicit status', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    await POST(makeReq({ key: 'k', value: 'v', status: 'draft' }));

    expect(upsertMock.mock.calls[0][0].status).toBe('draft');
  });

  it('returns 500 when Supabase reports an error', async () => {
    upsertMock.mockResolvedValueOnce({ error: { message: 'rls denied' } });

    const res = await POST(makeReq({ key: 'k', value: 'v' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
  });
});
