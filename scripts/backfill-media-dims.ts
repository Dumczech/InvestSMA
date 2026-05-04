/**
 * Backfill width / height / size_bytes on existing media_assets rows.
 *
 * Run once after the 20260504_media_metadata.sql migration applies, or
 * any time uploads predate a future format/dimension change.
 *
 * Usage:
 *   npx tsx scripts/backfill-media-dims.ts --dry-run         # report only
 *   npx tsx scripts/backfill-media-dims.ts                   # write
 *   npx tsx scripts/backfill-media-dims.ts --limit 50        # cap rows
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env
 * (or the calling shell). Requires the service-role key — anon won't
 * be able to update rows.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import type { Database } from '../lib/supabase/types';

type CliFlags = { dryRun: boolean; limit: number | null };

function parseFlags(argv: string[]): CliFlags {
  const flags: CliFlags = { dryRun: false, limit: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--limit' && argv[i + 1]) {
      flags.limit = Number(argv[++i]);
    }
  }
  return flags;
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
    process.exit(1);
  }

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });

  let q = supabase
    .from('media_assets')
    .select('id, storage_bucket, storage_path, mime_type, size_bytes, width, height')
    .or('width.is.null,height.is.null,size_bytes.is.null')
    .order('created_at', { ascending: true });
  if (flags.limit != null && Number.isFinite(flags.limit)) q = q.limit(flags.limit);

  const { data, error } = await q;
  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }
  const rows = data ?? [];
  console.log(`${rows.length} rows missing dims/size${flags.dryRun ? ' (dry-run)' : ''}.`);
  if (rows.length === 0) return;

  let updated = 0;
  let missing = 0;
  let nonImage = 0;
  let failed = 0;

  for (const row of rows) {
    const bucket = row.storage_bucket || 'investsma-assets';
    const { data: file, error: dlErr } = await supabase.storage.from(bucket).download(row.storage_path);
    if (dlErr || !file) {
      console.warn(`  [skip] ${row.id} ${row.storage_path} — file missing (${dlErr?.message ?? 'no body'})`);
      missing++;
      continue;
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const patch: { size_bytes: number; width?: number; height?: number } = { size_bytes: buf.length };

    const isImage = (row.mime_type ?? '').startsWith('image/');
    if (isImage) {
      try {
        const meta = await sharp(buf, { failOn: 'truncated' }).metadata();
        if (meta.width)  patch.width  = meta.width;
        if (meta.height) patch.height = meta.height;
      } catch (e) {
        console.warn(`  [warn] ${row.id} ${row.storage_path} — sharp couldn't parse (${(e as Error).message})`);
        failed++;
      }
    } else {
      nonImage++;
    }

    if (flags.dryRun) {
      console.log(`  [dry] ${row.id} ${row.storage_path} → ${JSON.stringify(patch)}`);
      updated++;
      continue;
    }

    const { error: updErr } = await supabase.from('media_assets').update(patch).eq('id', row.id);
    if (updErr) {
      console.warn(`  [err]  ${row.id} update failed: ${updErr.message}`);
      failed++;
      continue;
    }
    updated++;
    if (updated % 25 === 0) console.log(`  ... ${updated}/${rows.length}`);
  }

  console.log('');
  console.log(`Done. updated=${updated} missing-in-storage=${missing} non-image=${nonImage} failed=${failed}`);
  if (flags.dryRun) console.log('(dry-run · no rows were modified)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
