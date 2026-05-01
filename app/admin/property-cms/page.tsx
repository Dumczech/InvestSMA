import { getSupabaseServerClient } from '@/lib/supabase/server';
import PropertyCmsClient, { type PropertyRow } from './PropertyCmsClient';

export const dynamic = 'force-dynamic';

async function loadProperties(): Promise<PropertyRow[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s.from('properties').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PropertyRow[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadProperties();
  return (
    <main className='mx-auto max-w-6xl p-6'>
      <h1 className='text-2xl'>Property CMS</h1>
      <p className='mt-2 text-white/70'>
        Manage the property cards on <code className='text-sand'>/properties</code> and the
        memo content on <code className='text-sand'>/properties/[slug]</code>.
        Status <strong>published</strong> makes it visible on the public site.
      </p>
      <PropertyCmsClient initialRows={rows} />
    </main>
  );
}
