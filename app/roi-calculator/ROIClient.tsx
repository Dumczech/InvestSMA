'use client';
import { useState } from 'react';
import { SectionHeader } from '@/components/site';
import type { RoiCalculatorContent } from '@/lib/data/cms';

export default function ROIClient({ content }: { content: RoiCalculatorContent }) {
  const [show, setShow] = useState(false);
  return (
    <main className='mx-auto max-w-4xl p-6'>
      <SectionHeader title={content.title} subtitle={content.subtitle} />
      <div className='grid gap-3 md:grid-cols-2'>
        {content.inputs.map(f => (
          <input key={f} placeholder={f} className='rounded border border-white/20 bg-black/20 p-3' />
        ))}
      </div>
      <button onClick={() => setShow(true)} className='mt-4 rounded bg-gold px-4 py-2 text-black'>
        {content.submitLabel}
      </button>
      {show && (
        <div className='mt-6 card p-4'>
          <h3 className='text-xl'>{content.gate.title}</h3>
          <div className='mt-3 grid gap-2 md:grid-cols-2'>
            {content.gate.fields.map(i => (
              <input key={i} placeholder={i} className='rounded border border-white/20 bg-black/20 p-2' />
            ))}
          </div>
          <div className='mt-4 text-sm'>{content.gate.sampleResult}</div>
        </div>
      )}
    </main>
  );
}
