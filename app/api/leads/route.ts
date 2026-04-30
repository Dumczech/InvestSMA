import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('leads').insert({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      budget: body.budget ?? null,
      timeline: body.timeline ?? null,
      buyer_type: body.buyerType ?? null,
      neighborhoods: body.neighborhoods ?? null,
      message: body.message ?? null,
      source_page: body.sourcePage ?? 'unknown'
    });
    if (error) throw error;

    // TODO(email): integrate Resend (or equivalent) transactional notification here.
    // TODO(crm): add Pipedrive sync once pipeline fields/stages are defined.
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Lead capture failed' }, { status: 500 });
  }
}
