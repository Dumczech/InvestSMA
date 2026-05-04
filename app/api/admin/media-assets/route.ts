import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s.from('media_assets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: [], warning: 'Using mock data. Connect Supabase to manage live data.' });
  }
}

export async function POST(req: NextRequest) {
  // Two flows on the same endpoint:
  //   - multipart: upload a new file (file + module + alt_text)
  //   - json: update an existing row (id + module? + alt_text?)
  const ct = req.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    try {
      const body = await req.json();
      if (!body?.id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
      const patch: { alt_text?: string; module?: string } = {};
      if (typeof body.alt_text === 'string') patch.alt_text = body.alt_text;
      if (typeof body.module === 'string')   patch.module   = body.module;
      const s = getSupabaseServerClient();
      const { error } = await s.from('media_assets').update(patch).eq('id', body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }
  }

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const module = String(form.get('module') || 'general');
    const alt_text = String(form.get('alt_text') || '');
    if (!file) return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });
    const s = getSupabaseServerClient();
    const filePath = `${Date.now()}-${file.name}`;
    const arr = await file.arrayBuffer();
    const { error: uploadError } = await s.storage.from('investsma-assets').upload(filePath, arr, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;
    const { error } = await s.from('media_assets').insert({
      storage_bucket: 'investsma-assets',
      storage_path: filePath,
      mime_type: file.type,
      module,
      alt_text,
      uploaded_by: 'admin',
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Upload failed (configure Supabase bucket and env).' }, { status: 500 });
  }
}
