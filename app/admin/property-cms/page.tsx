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
  return <PropertyCmsClient initialRows={rows} />;
}
