import { getSupabaseServerClient } from '@/lib/supabase/server';
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
    <main className='mx-auto max-w-6xl p-6'>
      <h1 className='text-2xl'>Market Reports</h1>
      <p className='mt-2 text-white/70'>
        Quarterly + ad-hoc reports surfaced behind the Gated Market Report CTA on the homepage
        and on <code className='text-sand'>/market-data</code>.
        Toggle <strong>Published</strong> to expose a report to investors.
      </p>
      <MarketReportsClient initialRows={rows} />
    </main>
  );
}
