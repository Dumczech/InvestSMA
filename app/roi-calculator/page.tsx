import type { Metadata } from 'next';
import ROIClient from './ROIClient';
import { Disclaimer, StickyCTA } from '@/components/site';

export const metadata: Metadata = {
  title: 'ROI Calculator · InvestSMA',
  description:
    'Underwrite an SMA rental property in 90 seconds. Real ADR, occupancy, and seasonality data applied to your budget.',
};

export default function Page() {
  return (
    <div className='doc-page' data-screen-label='ROI'>
      <ROIClient />
      <Disclaimer />
      <StickyCTA label='Book a 15-min call' cta='Talk to LRM' href='/contact' />
    </div>
  );
}
