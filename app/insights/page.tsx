import type { Metadata } from 'next';
import { SectionHeader } from '@/components/site';
import { getPublishedArticles } from '@/lib/data/cms';
const fallback=['Is San Miguel de Allende a Good Real Estate Investment?','What Kind of Rental Revenue Can a Luxury Home Generate in San Miguel?','Why Large Homes Outperform During Peak Season','Second Home vs. Investment Property in Mexico','How LRM Evaluates an Investment Property'];
export const metadata: Metadata={title:'Investment Insights | InvestSMA',description:'San Miguel de Allende vacation rental investment guides, market reports, and case studies.'};
export default async function Insights(){const articles=await getPublishedArticles(); const items=articles.length?articles.map((a:any)=>a.title):fallback; return <main className='mx-auto max-w-6xl p-6'><SectionHeader title='Insights' subtitle='San Miguel investment guides, market reports, and buyer education.'/><div className='grid gap-4 md:grid-cols-3'>{items.map(a=><article key={a} className='card p-4'><div className='text-xs text-sand'>Market Reports · Buyer Education</div><h3 className='mt-2 text-lg'>{a}</h3></article>)}</div></main>}
