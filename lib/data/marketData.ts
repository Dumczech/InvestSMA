import { getSupabaseServerClient } from '@/lib/supabase/server';
import { lrmMonthly, lrmBedroom, lrmNeighborhood } from '@/data/lrmPerformance';

export const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function getPublishedMarketData() {
  if (!hasSupabaseEnv()) {
    return {
      monthly: lrmMonthly,
      bedroom: lrmBedroom,
      neighborhood: lrmNeighborhood,
      usingMock: true,
    };
  }

  const supabase = getSupabaseServerClient();
  const [monthly, bedroom, neighborhood] = await Promise.all([
    supabase
      .from('market_monthly_performance')
      .select('*')
      .eq('status', 'published')
      .order('year')
      .order('month'),
    supabase.from('market_bedroom_performance').select('*').eq('status', 'published'),
    supabase
      .from('market_neighborhood_performance')
      .select('*')
      .eq('status', 'published'),
  ]);

  return {
    monthly: (monthly.data ?? []).map((r: any) => ({
      month: `${r.month}`,
      lrmOccupancy: Number(r.lrm_occupancy ?? 0),
      marketOccupancy: Number(r.market_occupancy ?? 0),
      lrmADR: Number(r.lrm_adr ?? 0),
      marketADR: Number(r.market_adr ?? 0),
      lrmRevPAR: Number(r.lrm_revpar ?? 0),
      marketRevPAR: Number(r.market_revpar ?? 0),
    })),
    bedroom: (bedroom.data ?? []).map((r: any) => ({
      bedroomCount: r.bedroom_count,
      lrmADR: Number(r.lrm_adr ?? 0),
      marketADR: Number(r.market_adr ?? 0),
      lrmOccupancy: Number(r.lrm_occupancy ?? 0),
      marketOccupancy: Number(r.market_occupancy ?? 0),
      lrmRevPAR: Number(r.lrm_revpar ?? 0),
      marketRevPAR: Number(r.market_revpar ?? 0),
      sampleSize: 0,
      period: r.period,
    })),
    neighborhood: (neighborhood.data ?? []).map((r: any) => ({
      neighborhood: r.neighborhood,
      lrmADR: Number(r.lrm_adr ?? 0),
      marketADR: Number(r.market_adr ?? 0),
      lrmOccupancy: Number(r.lrm_occupancy ?? 0),
      marketOccupancy: Number(r.market_occupancy ?? 0),
      lrmRevenue: Number(r.lrm_revenue ?? 0),
      marketRevenueEstimate: Number(r.market_revenue_estimate ?? 0),
      capRateEstimate: 0,
      trend: 'flat',
      comps: 0,
    })),
    usingMock: false,
  };
}
