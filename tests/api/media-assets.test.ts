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

// Mock the image processor so tests don't pull sharp into the test
// runner. Default behavior is a pass-through that reports realistic
// dimensions; individual tests override per-call with mockImplementationOnce.
const processUploadMock = vi.fn();
vi.mock('@/lib/media/process', () => {
  class MediaValidationError extends Error {
    status = 400;
    constructor(msg: string) { super(msg); this.name = 'MediaValidationError'; }
  }
  return {
    processUpload: (file: File) => processUploadMock(file),
    MediaValidationError,
  };
});
import { MediaValidationError } from '@/lib/media/process';

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

  it('400s when no editable fields are supplied', async () => {
    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'abc' }),
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'No editable fields supplied' });
  });

  it('patches folder + name + tags via JSON', async () => {
    eqMock.mockResolvedValueOnce({ error: null });

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: 'abc',
        folder: 'properties/casa-olivos',
        name: 'hero.jpg',
        tags: ['hero', '  ', 'exterior', 42],
      }),
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      folder: 'properties/casa-olivos',
      name: 'hero.jpg',
      tags: ['hero', 'exterior'],
    });
  });
});

describe('POST /api/admin/media-assets — multipart upload flow', () => {
  beforeEach(() => {
    storageUploadMock.mockReset();
    insertMock.mockReset();
    storageFromMock.mockClear();
    processUploadMock.mockReset();
    processUploadMock.mockImplementation(async (file: File) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      size_bytes: file.size,
      width: 1200,
      height: 800,
      processed: file.type.startsWith('image/'),
    }));
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
    expect(await res.json()).toEqual(expect.objectContaining({ ok: true, processed: true }));
    expect(storageFromMock).toHaveBeenCalledWith('investsma-assets');
    expect(storageUploadMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      storage_bucket: 'investsma-assets',
      mime_type: 'image/jpeg',
      module: 'property',
      alt_text: 'Casa courtyard',
      uploaded_by: 'admin',
      name: 'casa.jpg',
      size_bytes: 3,
      width: 1200,
      height: 800,
      folder: 'property',
      tags: [],
    }));
  });

  it('honors folder + tags from the multipart form and prefixes the storage path', async () => {
    storageUploadMock.mockResolvedValueOnce({ error: null });
    insertMock.mockResolvedValueOnce({ error: null });

    const fd = new FormData();
    fd.set('file', new File([new Uint8Array([0, 0, 0, 0])], 'olive.jpg', { type: 'image/jpeg' }));
    fd.set('folder', 'properties/casa-olivos');
    fd.set('alt_text', 'Olive trees');
    fd.set('tags', ' sunset, exterior , ');

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);

    const uploadArgs = storageUploadMock.mock.calls[0];
    expect(uploadArgs[0]).toMatch(/^properties\/casa-olivos\/\d+-olive\.jpg$/);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      folder: 'properties/casa-olivos',
      module: 'properties/casa-olivos',
      tags: ['sunset', 'exterior'],
      size_bytes: 4,
      name: 'olive.jpg',
    }));
  });

  it('uses client-probed duration / width / height for videos (sharp returns nulls)', async () => {
    storageUploadMock.mockResolvedValueOnce({ error: null });
    insertMock.mockResolvedValueOnce({ error: null });
    // Video pass-through: processor leaves dims null.
    processUploadMock.mockImplementationOnce(async (file: File) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      size_bytes: file.size,
      width: null,
      height: null,
      processed: false,
    }));

    const fd = new FormData();
    fd.set('file', new File([new Uint8Array([0])], 'walkthrough.mp4', { type: 'video/mp4' }));
    fd.set('folder', 'site/video');
    fd.set('duration_ms', '92500');
    fd.set('width', '1920');
    fd.set('height', '1080');

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({
      ok: true, duration_ms: 92500, width: 1920, height: 1080,
    }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      mime_type: 'video/mp4',
      duration_ms: 92500,
      width: 1920,
      height: 1080,
    }));
  });

  it('drops bogus client-probed values (negative / NaN)', async () => {
    storageUploadMock.mockResolvedValueOnce({ error: null });
    insertMock.mockResolvedValueOnce({ error: null });

    const fd = new FormData();
    fd.set('file', new File([new Uint8Array([1])], 'bad.mp4', { type: 'video/mp4' }));
    fd.set('duration_ms', '-99');
    fd.set('width', 'abc');

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    await POST(req);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      duration_ms: null,
      // The default mock returns 1200×800 for image sharp; for this video
      // it'd return processed=true. We just want to know the form garbage
      // didn't poison the row.
    }));
    const insertArg = insertMock.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.duration_ms).toBeNull();
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

  it('surfaces a 400 when the processor rejects the file (size / dims)', async () => {
    processUploadMock.mockImplementationOnce(async () => {
      throw new MediaValidationError('Image is 200×200 · minimum is 600×400.');
    });

    const fd = new FormData();
    fd.set('file', new File([new Uint8Array([1])], 'tiny.jpg', { type: 'image/jpeg' }));

    const req = new Request('http://test.local/api/admin/media-assets', {
      method: 'POST',
      body: fd,
    }) as unknown as import('next/server').NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/minimum is/);
    // Storage upload should never have been attempted.
    expect(storageUploadMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });
});
