import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';
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
    <div className='main'>
      <Topbar crumbs={['Properties']}>
        <button className='btn btn-sm btn-primary'><Icon name='plus' /> New property</button>
      </Topbar>
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Properties</h1>
            <p className='page-subtitle'>
              Manage the public catalog. Status <code>published</code> makes a property visible
              on <code>/properties</code> and the homepage Featured rail.
            </p>
          </div>
        </div>
        <PropertyCmsClient initialRows={rows} />
      </div>
    </div>
  );
}
