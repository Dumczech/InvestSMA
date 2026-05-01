import { getSupabaseServerClient } from '@/lib/supabase/server';
import ContentCmsClient from './ContentCmsClient';

// Server component: pull every site_content row, hand to the client editor.
// `force-dynamic` so admin always sees the latest, never cached.
export const dynamic = 'force-dynamic';

type Row = { key: string; value: unknown; status: string; updated_at: string };

async function loadRows(): Promise<Row[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('site_content')
      .select('key,value,status,updated_at')
      .order('key');
    if (error) throw error;
    return (data ?? []) as Row[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadRows();
  return (
    <main className='mx-auto max-w-5xl p-6'>
      <h1 className='text-2xl'>Content CMS</h1>
      <p className='mt-2 text-white/70'>
        Edit homepage hero, metrics, market snapshot, and any other site content blocks.
        Each row is a JSON value keyed by name; the public site reads these via{' '}
        <code className='text-sand'>getHomepageContent()</code>.
      </p>
      <ContentCmsClient initialRows={rows} />
    </main>
  );
}
