import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tests both flows of POST /api/admin/media-assets:
//   - application/json — id-keyed UPDATE (alt_text + module patch)
//   - multipart        — storage upload + INSERT row

const orderMock         = vi.fn();
const eqMock            = vi.fn();
const updateMock        = vi.fn(() => ({ eq: eqMock }));
const insertMock        = vi.fn();
const storageUploadMock = vi.fn();

const fromMock = vi.fn((table: string) => {
  if (table !== 'media_assets') throw new Error(`unexpected table ${table}`);
  return {
    select: () => ({ order: orderMock }),
    update: updateMock,
    insert: insertMock,
  };
});

const storageFromMock = vi.fn(() => ({ upload: storageUploadMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: fromMock,
    storage: { from: storageFromMock },
  }),
}));

import { GET, POST } from '@/app/api/admin/media-assets/route';

describe('GET /api/admin/media-assets', () => {
  beforeEach(() => orderMock.mockReset());

  it('returns rows ordered by created_at desc', async () => {
    const rows = [{ id: '1', storage_path: 'a.png' }];
    orderMock.mockResolvedValueOnce({ data: rows, error: null });

    const res = await GET();
    expect(await res.json()).toEqual({ ok: true, data: rows });
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('falls back to mock-data warning on error (does not surface 500)', async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: 'rls' } });

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([]);
    expect(body.warning).toMatch(/mock data/i);
  });
});

describe('POST /api/admin/media-assets — JSON update flow', () => {
  beforeEach(() => {
    updateMock.mockClear();
    eqMock.mockReset();
  });

  it('updates alt_text + module on the row matching id', async () => {
    eqMock.mockResolvedValueOnce({ error: null });

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'abc', alt_text: 'sunset', module: 'property' }),
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(updateMock).toHaveBeenCalledWith({ alt_text: 'sunset', module: 'property' });
    expect(eqMock).toHaveBeenCalledWith('id', 'abc');
  });

  it('400s when id is missing', async () => {
    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ alt_text: 'x' }),
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Missing id' });
  });
});

describe('POST /api/admin/media-assets — multipart upload flow', () => {
  beforeEach(() => {
    storageUploadMock.mockReset();
    insertMock.mockReset();
    storageFromMock.mockClear();
  });

  it('uploads to investsma-assets and inserts the metadata row', async () => {
    storageUploadMock.mockResolvedValueOnce({ error: null });
    insertMock.mockResolvedValueOnce({ error: null });

    const fd = new FormData();
    const file = new File([new Uint8Array([1, 2, 3])], 'casa.jpg', { type: 'image/jpeg' });
    fd.set('file', file);
    fd.set('module', 'property');
    fd.set('alt_text', 'Casa courtyard');

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(storageFromMock).toHaveBeenCalledWith('investsma-assets');
    expect(storageUploadMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      storage_bucket: 'investsma-assets',
      mime_type: 'image/jpeg',
      module: 'property',
      alt_text: 'Casa courtyard',
      uploaded_by: 'admin',
    }));
  });

  it('400s when file is missing from multipart', async () => {
    const fd = new FormData();
    fd.set('module', 'property');

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Missing file' });
  });
});
