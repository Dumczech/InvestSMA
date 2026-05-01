import { SectionHeader } from '@/components/site';
import MarketDashboard from '@/components/market/dashboard';
import { Metadata } from 'next';
import { getPublishedMarketData } from '@/lib/data/marketData';
import { getMarketHeadlineMetrics } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'Market Data Dashboard | InvestSMA',
  description: 'Compare LRM portfolio performance against market benchmarks for San Miguel de Allende investment decisions.',
};

export default async function Market() {
  const [data, headlineMetrics] = await Promise.all([
    getPublishedMarketData(),
    getMarketHeadlineMetrics(),
  ]);
  return (
    <main className='mx-auto max-w-6xl p-6'>
      <SectionHeader title='Market Data Dashboard' subtitle='Default view: Compare (LRM Portfolio vs Market Average).' />
      <MarketDashboard
        monthly={data.monthly}
        bedroom={data.bedroom}
        neighborhood={data.neighborhood}
        headlineMetrics={headlineMetrics}
        usingMock={data.usingMock}
      />
    </main>
  );
}
