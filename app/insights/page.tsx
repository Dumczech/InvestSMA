import type { Metadata } from 'next';
import { SectionHeader } from '@/components/site';
import { getPublishedArticles, getInsightsFallbackTitles } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'Investment Insights | InvestSMA',
  description: 'San Miguel de Allende vacation rental investment guides, market reports, and case studies.',
};

export default async function Insights() {
  const [articles, fallback] = await Promise.all([
    getPublishedArticles(),
    getInsightsFallbackTitles(),
  ]);
  const items = articles.length ? articles.map((a: any) => a.title) : fallback;

  return (
    <main className='mx-auto max-w-6xl p-6'>
      <SectionHeader title='Insights' subtitle='San Miguel investment guides, market reports, and buyer education.' />
      <div className='grid gap-4 md:grid-cols-3'>
        {items.map(title => (
          <article key={title} className='card p-4'>
            <div className='text-xs text-sand'>Market Reports · Buyer Education</div>
            <h3 className='mt-2 text-lg'>{title}</h3>
          </article>
        ))}
      </div>
    </main>
  );
}
