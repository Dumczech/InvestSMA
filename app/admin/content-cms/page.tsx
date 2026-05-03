import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';
import ContentCmsClient from './ContentCmsClient';

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
    <div className='main'>
      <Topbar crumbs={['Site Content']} />
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Site Content</h1>
            <p className='page-subtitle'>
              JSON content blocks consumed by the public site (homepage hero, market snapshot,
              gated CTA, contact copy, ROI labels, legal disclosures, &amp; more). Edits go live
              on next render.
            </p>
          </div>
          <div className='page-actions'>
            <span className='muted' style={{ fontSize: 12 }}>
              <Icon name='info' style={{ width: 12, height: 12, marginRight: 4 }} />
              Each row = one <code>site_content</code> key
            </span>
          </div>
        </div>
        <ContentCmsClient initialRows={rows} />
      </div>
    </div>
  );
}
