import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-server';

// GET ?lead_id=...  · list notes for a lead, newest first.
// POST { lead_id, body } · append a note authored by the current user.

export async function GET(req: NextRequest) {
  const leadId = new URL(req.url).searchParams.get('lead_id');
  if (!leadId) return NextResponse.json({ ok: false, error: 'Missing lead_id' }, { status: 400 });
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('lead_notes')
      .select('id,lead_id,body,author,created_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.lead_id || !body?.body?.trim()) {
    return NextResponse.json({ ok: false, error: 'lead_id and body are required' }, { status: 400 });
  }
  try {
    const user = await getCurrentUser();
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('lead_notes')
      .insert({
        lead_id: body.lead_id,
        body: String(body.body).trim(),
        author: user?.email ?? 'admin',
      })
      .select('id,lead_id,body,author,created_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
