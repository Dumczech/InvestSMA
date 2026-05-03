import { describe, it, expect, vi, beforeEach } from 'vitest';

const upsertMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) => {
      if (table !== 'properties') throw new Error(`unexpected table ${table}`);
      return { upsert: upsertMock };
    },
  }),
}));

import { POST } from '@/app/api/admin/properties/route';

function makeReq(body: unknown) {
  return new Request('http://test.local/api/admin/properties', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/admin/properties', () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  it('upserts the body verbatim with onConflict on slug', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    const body = { slug: 'casa-azul', name: 'Casa Azul', price_usd: 950000 };
    const res = await POST(makeReq(body));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(upsertMock).toHaveBeenCalledWith(body, { onConflict: 'slug' });
  });

  it('returns 500 when Supabase reports an error', async () => {
    upsertMock.mockResolvedValueOnce({ error: { message: 'unique violation' } });

    const res = await POST(makeReq({ slug: 'x' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
  });
});
