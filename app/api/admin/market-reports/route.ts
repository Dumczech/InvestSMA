import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Admin-only CRUD for market_reports rows. Mirrors the pattern in
// /api/admin/properties and /api/admin/articles: POST upserts on a
// natural key (here, title+period since there's no slug column).

export async function GET() {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('market_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.title || !body?.period) {
    return NextResponse.json({ ok: false, error: 'title and period are required' }, { status: 400 });
  }
  try {
    const s = getSupabaseServerClient();
    // Editable fields shared between insert and update. Default `gated`
    // to true (the design's lead-gen baseline). `download_count` is
    // owned by the download endpoint and explicitly NOT in the update
    // path so editors can't reset it.
    const editable = {
      title: String(body.title).trim(),
      period: String(body.period).trim(),
      summary: body.summary ? String(body.summary).trim() : null,
      pdf_path: body.pdf_path ? String(body.pdf_path).trim() : null,
      published: Boolean(body.published),
      gated: body.gated == null ? true : Boolean(body.gated),
    };

    if (body.id) {
      const { error } = await s.from('market_reports').update(editable).eq('id', body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, id: body.id });
    }

    const { data, error } = await s
      .from('market_reports')
      .insert({ ...editable, download_count: 0 })
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
