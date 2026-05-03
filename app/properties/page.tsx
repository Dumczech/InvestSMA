import { Metadata } from 'next';
import { getPublishedProperties } from '@/lib/data/cms';
import { Disclaimer, StickyCTA } from '@/components/site';
import PropertiesClient from './PropertiesClient';

export const metadata: Metadata = {
  title: 'Featured Investment Properties — San Miguel de Allende | InvestSMA',
  description:
    'Curated luxury rental investment properties in San Miguel de Allende — Centro, Atascadero, San Antonio, Los Frailes, El Chorro. Each with full investment memo.',
  keywords: [
    'San Miguel de Allende investment properties',
    'SMA luxury homes for sale',
    'Centro Histórico real estate',
    'Atascadero homes',
    'vacation rental investment Mexico',
  ].join(', '),
};

export default async function PropertiesPage() {
  const properties = await getPublishedProperties();
  return (
    <div className='doc-page' data-screen-label='Properties'>
      <PropertiesClient properties={properties} />
      <Disclaimer />
      <StickyCTA label='See off-market deals' cta='Request Access' href='/contact' />
    </div>
  );
}
