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
  return <MarketReportsClient initialRows={rows} />;
}
