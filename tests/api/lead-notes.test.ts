import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const eqOrderMock = vi.fn(() => ({ order: orderMock }));
const singleMock = vi.fn();
const insertChain = vi.fn(() => ({ select: () => ({ single: singleMock }) }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) => {
      if (table !== 'lead_notes') throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({ eq: eqOrderMock }),
        insert: insertChain,
      };
    },
  }),
}));

vi.mock('@/lib/supabase/auth-server', () => ({
  getCurrentUser: vi.fn(),
}));

import { GET, POST } from '@/app/api/admin/lead-notes/route';
import { getCurrentUser } from '@/lib/supabase/auth-server';

function getReq(leadId?: string) {
  const url = leadId
    ? `http://test.local/api/admin/lead-notes?lead_id=${encodeURIComponent(leadId)}`
    : 'http://test.local/api/admin/lead-notes';
  return new Request(url) as unknown as import('next/server').NextRequest;
}

function postReq(body: unknown) {
  return new Request('http://test.local/api/admin/lead-notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('GET /api/admin/lead-notes', () => {
  beforeEach(() => {
    orderMock.mockReset();
    eqOrderMock.mockClear();
  });

  it('400s when lead_id is missing', async () => {
    const res = await GET(getReq());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'Missing lead_id' });
  });

  it('returns notes for the lead, newest first', async () => {
    const rows = [{ id: 'n1', lead_id: 'L1', body: 'hi', author: 'a', created_at: '2026-01-02' }];
    orderMock.mockResolvedValueOnce({ data: rows, error: null });

    const res = await GET(getReq('L1'));

    expect(await res.json()).toEqual({ ok: true, data: rows });
    expect(eqOrderMock).toHaveBeenCalledWith('lead_id', 'L1');
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('POST /api/admin/lead-notes', () => {
  beforeEach(() => {
    insertChain.mockClear();
    singleMock.mockReset();
    vi.mocked(getCurrentUser).mockReset();
  });

  it('400s when lead_id or body is missing', async () => {
    let res = await POST(postReq({ body: 'hi' }));
    expect(res.status).toBe(400);

    res = await POST(postReq({ lead_id: 'L1', body: '   ' }));
    expect(res.status).toBe(400);
  });

  it('inserts the note with the current user email as author', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({ email: 'justin@lrm.com' } as never);
    const inserted = { id: 'n2', lead_id: 'L1', body: 'sent the memo', author: 'justin@lrm.com', created_at: '2026-01-03' };
    singleMock.mockResolvedValueOnce({ data: inserted, error: null });

    const res = await POST(postReq({ lead_id: 'L1', body: '  sent the memo  ' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: inserted });
    expect(insertChain).toHaveBeenCalledWith({
      lead_id: 'L1',
      body: 'sent the memo',
      author: 'justin@lrm.com',
    });
  });

  it('falls back to "admin" when no user is signed in', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    singleMock.mockResolvedValueOnce({ data: { id: 'n3' }, error: null });

    await POST(postReq({ lead_id: 'L1', body: 'note' }));

    expect(insertChain.mock.calls[0][0].author).toBe('admin');
  });

  it('returns 500 with the underlying error when Supabase fails', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    singleMock.mockResolvedValueOnce({ data: null, error: { message: 'rls denied' } });

    const res = await POST(postReq({ lead_id: 'L1', body: 'note' }));

    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/rls/);
  });
});
