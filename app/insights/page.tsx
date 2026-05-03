import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader } from '@/components/site';
import { getPublishedArticles, getInsightsFallbackTitles } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'Investment Insights | InvestSMA',
  description:
    'San Miguel de Allende vacation rental investment guides, market reports, and case studies.',
};

type ArticleRow = { slug?: string; title?: string; category?: string; excerpt?: string };

export default async function Insights() {
  const [articles, fallback] = await Promise.all([
    getPublishedArticles(),
    getInsightsFallbackTitles(),
  ]);

  // When no articles are seeded yet, render fallback titles as cards (no links).
  // When articles exist, each card links to /insights/[slug] (the post detail page).
  const cards: Array<{ slug?: string; title: string; category?: string; excerpt?: string }> =
    articles.length
      ? (articles as ArticleRow[]).map(a => ({
          slug: a.slug,
          title: a.title || '',
          category: a.category,
          excerpt: a.excerpt,
        }))
      : fallback.map(t => ({ title: t }));

  return (
    <main className='mx-auto max-w-6xl p-6'>
      <SectionHeader
        title='Insights'
        subtitle='San Miguel investment guides, market reports, and buyer education.'
      />
      <div className='grid gap-4 md:grid-cols-3'>
        {cards.map(card => {
          const inner = (
            <article className='card p-4 h-full'>
              <div className='text-xs text-sand'>
                {card.category || 'Market Reports · Buyer Education'}
              </div>
              <h3 className='mt-2 text-lg'>{card.title}</h3>
              {card.excerpt && (
                <p className='mt-2 text-sm text-white/70'>{card.excerpt}</p>
              )}
            </article>
          );
          return card.slug ? (
            <Link key={card.slug} href={`/insights/${card.slug}`} className='block hover:opacity-90'>
              {inner}
            </Link>
          ) : (
            <div key={card.title}>{inner}</div>
          );
        })}
      </div>
    </main>
  );
}
