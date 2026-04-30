import { PropertyCard, SectionHeader } from '@/components/site';
import { Metadata } from 'next';
import { getPublishedProperties } from '@/lib/data/cms';
export const metadata: Metadata = {title:'Featured Properties | InvestSMA',description:'San Miguel de Allende vacation rental investment opportunities with investment memo analysis.'};
export default async function Properties(){const properties=await getPublishedProperties(); return <main className='mx-auto max-w-6xl p-6'><SectionHeader title='Featured Investment Properties' subtitle='High-conviction luxury homes and hospitality assets.'/><div className='grid gap-4 md:grid-cols-2'>{properties.map(p=><PropertyCard key={p.slug} p={p}/>)}</div></main>}
