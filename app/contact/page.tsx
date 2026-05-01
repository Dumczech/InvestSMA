import type { Metadata } from 'next';
import { SectionHeader } from '@/components/site';
import { getContactContent } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'Contact | InvestSMA Investor Access',
  description: 'Apply for investor access to San Miguel luxury homes and income-producing opportunities.',
};

export default async function Contact() {
  const content = await getContactContent();
  return (
    <main className='mx-auto max-w-3xl p-6'>
      <SectionHeader title={content.title} subtitle={content.subtitle} />
      <div className='grid gap-3 md:grid-cols-2'>
        {content.fieldLabels.map(f => (
          <input key={f} placeholder={f} className='rounded border border-white/20 bg-black/20 p-3' />
        ))}
        <textarea
          placeholder={content.messagePlaceholder}
          className='rounded border border-white/20 bg-black/20 p-3 md:col-span-2'
        />
      </div>
      <button className='mt-4 rounded bg-gold px-4 py-2 text-black'>{content.submitLabel}</button>
    </main>
  );
}
