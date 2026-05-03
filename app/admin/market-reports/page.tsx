import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';
import MarketReportsClient, { type ReportRow } from './MarketReportsClient';

export const dynamic = 'force-dynamic';

async function loadReports(): Promise<ReportRow[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('market_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ReportRow[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadReports();
  return (
    <div className='main'>
      <Topbar crumbs={['Market Reports']}>
        <button className='btn btn-sm btn-primary'><Icon name='plus' /> New report</button>
      </Topbar>
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Market Reports</h1>
            <p className='page-subtitle'>
              Quarterly + ad-hoc reports surfaced behind the gated CTA on the homepage and{' '}
              <code>/market-data</code>. Toggle <code>Published</code> to expose to investors.
            </p>
          </div>
        </div>
        <MarketReportsClient initialRows={rows} />
      </div>
    </div>
  );
}
