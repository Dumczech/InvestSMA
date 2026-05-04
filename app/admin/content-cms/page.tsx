import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';
import SiteAssetsClient, { type SiteAssets } from './SiteAssetsClient';
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

// The Site Assets nav item used to land on a flat JSON editor; the
// design's site.jsx is a brand-level media control panel. We render
// the new Site Assets client at the top (logos, hero, OG, videos,
// favicon, brand tokens) and keep the JSON editor available below as
// "Content keys (advanced)" so existing key-driven edits still work.
export default async function Page() {
  const rows = await loadRows();
  const siteAssetsRow = rows.find(r => r.key === 'site_assets');
  const initialAssets = (siteAssetsRow?.value as Partial<SiteAssets> | null) ?? null;

  return (
    <>
      <SiteAssetsClient initialAssets={initialAssets} />

      <div className='main' style={{ borderTop: '8px solid var(--bg-subtle)' }}>
        <Topbar crumbs={['Site assets', 'Content keys']} />
        <div className='page'>
          <div className='page-head'>
            <div>
              <h1 className='page-title'>Content keys (advanced)</h1>
              <p className='page-subtitle'>
                JSON content blocks consumed by the public site (homepage hero copy, market snapshot, gated CTA, ROI labels, &amp; more). Most editors won&apos;t need this — use Site Assets above for brand-level media and copy.
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
    </>
  );
}
