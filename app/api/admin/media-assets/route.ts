import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { processUpload, MediaValidationError } from '@/lib/media/process';

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

// POST handles two flows on the same endpoint:
//   - multipart: upload a new file (file, optional folder/module/alt_text)
//   - json:      update an existing row (id + any subset of patchable fields)

type MediaPatch = {
  alt_text?: string | null;
  module?: string | null;
  folder?: string | null;
  name?: string | null;
  tags?: string[];
};

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    try {
      const body = await req.json();
      if (!body?.id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
      const patch: MediaPatch = {};
      if (typeof body.alt_text === 'string' || body.alt_text === null) patch.alt_text = body.alt_text;
      if (typeof body.module === 'string'   || body.module   === null) patch.module   = body.module;
      if (typeof body.folder === 'string'   || body.folder   === null) patch.folder   = body.folder;
      if (typeof body.name === 'string'     || body.name     === null) patch.name     = body.name;
      if (Array.isArray(body.tags)) {
        patch.tags = body.tags
          .filter((t: unknown): t is string => typeof t === 'string')
          .map((t: string) => t.trim())
          .filter((t: string) => Boolean(t));
      }
      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ ok: false, error: 'No editable fields supplied' }, { status: 400 });
      }
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
    const folderInput = String(form.get('folder') || '').trim();
    const moduleInput = String(form.get('module') || folderInput || 'general').trim();
    const altText = String(form.get('alt_text') || '');
    const tagsRaw = String(form.get('tags') || '');
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    if (!file) return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });

    // Resize / re-encode large images, reject anything that violates
    // the size or minimum-dimension limits. Non-image files pass
    // through untouched.
    const processed = await processUpload(file);

    const s = getSupabaseServerClient();
    // Path = <folder>/<timestamp>-<original-name> so the bucket
    // organizes naturally for Supabase Studio browsing too.
    const folderSegment = folderInput ? `${folderInput.replace(/^\/+|\/+$/g, '')}/` : '';
    const filePath = `${folderSegment}${Date.now()}-${file.name}`;
    const { error: uploadError } = await s.storage
      .from('investsma-assets')
      .upload(filePath, processed.buffer, { contentType: processed.contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { error } = await s.from('media_assets').insert({
      storage_bucket: 'investsma-assets',
      storage_path: filePath,
      mime_type: processed.contentType,
      module: moduleInput,
      folder: folderInput || moduleInput || null,
      name: file.name,
      size_bytes: processed.size_bytes,
      width:  processed.width,
      height: processed.height,
      alt_text: altText,
      tags,
      uploaded_by: 'admin',
    });
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      processed: processed.processed,
      size_bytes: processed.size_bytes,
      width:  processed.width,
      height: processed.height,
    });
  } catch (e) {
    if (e instanceof MediaValidationError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ ok: false, error: 'Upload failed (configure Supabase bucket and env).' }, { status: 500 });
  }
}
