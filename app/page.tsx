import type { Metadata } from 'next';
import Link from 'next/link';
import { MetricCard, PropertyCard, SectionHeader } from '@/components/site';
import { getHomepageContent, getPublishedProperties } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'InvestSMA | San Miguel de Allende Real Estate Investment',
  description:
    'San Miguel de Allende real estate investment platform for luxury rental acquisitions and management.',
};

export default async function Home() {
  const content = await getHomepageContent();
  const properties = await getPublishedProperties();
  const { marketSnapshot, gatedCta } = content;

  return (
    <main>
      <section className='relative flex min-h-screen items-center justify-center bg-[linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)),url(/hero1.jpg)] bg-cover p-6 text-center'>
        <div className='max-w-3xl'>
          <h1 className='text-4xl md:text-6xl'>{content.hero.headline}</h1>
          <p className='mt-4 text-white/80'>{content.hero.subheadline}</p>
          <div className='mt-6 flex justify-center gap-3'>
            <Link href='/properties' className='rounded bg-gold px-4 py-2 text-black'>View Featured Opportunities</Link>
            <Link href='/roi-calculator' className='rounded border border-white px-4 py-2'>Calculate ROI Potential</Link>
          </div>
        </div>
      </section>

      {content.usingMock && (
        <div className='mx-auto max-w-6xl p-3 text-amber-200'>
          Using mock data. Connect Supabase to manage live data.
        </div>
      )}

      <section className='mx-auto grid max-w-6xl gap-4 p-6 md:grid-cols-4'>
        {content.metrics.map(m => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </section>

      <section className='mx-auto max-w-6xl p-6'>
        <SectionHeader title='Featured Opportunities' subtitle='Curated, memo-ready investment opportunities.' />
        <div className='grid gap-4 md:grid-cols-2'>
          {properties.slice(0, 2).map(p => (
            <PropertyCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-6xl p-6'>
        <div className='card p-6'>
          <h3 className='text-xl'>{marketSnapshot.title}</h3>
          <p className='mt-2 text-white/70'>
            {marketSnapshot.comparisons
              .map(c => `LRM ${c.label}: ${c.lrm} vs Market ${c.label}: ${c.market}`)
              .join(' · ')}
            .
          </p>
          <Link href={marketSnapshot.ctaHref} className='text-gold'>{marketSnapshot.ctaLabel}</Link>
        </div>
      </section>

      <section className='mx-auto max-w-6xl p-6'>
        <div className='card p-6'>
          <strong>{gatedCta.title}:</strong> {gatedCta.body}{' '}
          <Link href={gatedCta.ctaHref} className='text-gold'>{gatedCta.ctaLabel}</Link>
        </div>
      </section>
    </main>
  );
}
