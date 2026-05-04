import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// PATCH-style update via POST: { id, status?, source?, assigned_to? }.
// Used by the admin/leads detail drawer to change pipeline state.

const ALLOWED_STATUSES = ['new', 'contacted', 'qualified', 'meeting', 'won', 'lost'] as const;
type Status = typeof ALLOWED_STATUSES[number];

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

  const patch: { status?: Status; source?: string | null; assigned_to?: string | null } = {};
  if (typeof body.status === 'string') {
    if (!(ALLOWED_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }
    patch.status = body.status as Status;
  }
  if (typeof body.source === 'string' || body.source === null) {
    patch.source = body.source ?? null;
  }
  if (typeof body.assigned_to === 'string' || body.assigned_to === null) {
    patch.assigned_to = body.assigned_to ?? null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'No editable fields supplied' }, { status: 400 });
  }

  try {
    const s = getSupabaseServerClient();
    const { error } = await s.from('leads').update(patch).eq('id', body.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
