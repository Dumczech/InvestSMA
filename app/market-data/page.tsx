import { Metadata } from 'next';
import { getPublishedMarketData } from '@/lib/data/marketData';
import { getMarketHeadlineMetrics } from '@/lib/data/cms';
import { Disclaimer, StickyCTA } from '@/components/site';
import MarketClient from './MarketClient';

export const metadata: Metadata = {
  title: 'Market Data Dashboard · InvestSMA',
  description:
    'San Miguel de Allende rental market index — LRM portfolio (312 properties) benchmarked against the AirDNA market panel (2,847 listings). Updated weekly.',
};

export default async function MarketPage() {
  const [data, headlineMetrics] = await Promise.all([
    getPublishedMarketData(),
    getMarketHeadlineMetrics(),
  ]);
  return (
    <div className='doc-page' data-screen-label='Market'>
      <MarketClient
        monthly={data.monthly}
        bedroom={data.bedroom}
        neighborhood={data.neighborhood}
        headlineMetrics={headlineMetrics}
        usingMock={data.usingMock}
      />
      <Disclaimer />
      <StickyCTA label='Get the Q1 report' cta='Free Access' href='/contact' />
    </div>
  );
}
