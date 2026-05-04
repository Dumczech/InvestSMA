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

  it('passes the full design payload through (headline, position, op-costs, SEO, publish toggles)', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    const body = {
      slug: 'casa-olivos',
      name: 'Casa de los Olivos',
      neighborhood: 'Centro',
      price_usd: 3850000,
      bedrooms: 6,
      baths: 6.5,
      sqm: 650,
      headline: 'Editorial-grade Centro estate with 6 suites and rooftop terrace',
      position_in_market: 'Editorial',
      adr_low: 800,
      adr_high: 1300,
      occupancy_low_pct: 55,
      occupancy_high_pct: 68,
      annual_gross_low: 220000,
      annual_gross_high: 390000,
      lrm_management_fee_pct: 20,
      cleaning_per_stay_usd: 280,
      property_tax_usd: 2400,
      utilities_per_year_usd: 14000,
      insurance_per_year_usd: 6800,
      maintenance_reserve_pct: 3,
      walkthrough_video_url: 'https://youtu.be/abc123',
      seo_title: 'Casa de los Olivos · 6BR Centro',
      seo_description: 'Curated 6BR colonial · 4-yr P&L published',
      og_image_path: 'properties/casa-olivos/og.jpg',
      gate_full_memo: true,
      featured_on_homepage: true,
      allow_indexing: true,
      assigned_advisor: 'Justin McCarter',
      status: 'published',
    };

    const res = await POST(makeReq(body));

    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(body, { onConflict: 'slug' });
  });

  it('returns 500 when Supabase reports an error', async () => {
    upsertMock.mockResolvedValueOnce({ error: { message: 'unique violation' } });

    const res = await POST(makeReq({ slug: 'x' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
  });
});
