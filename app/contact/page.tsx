import type { Metadata } from 'next';
import { Disclaimer } from '@/components/site';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Investor Access · InvestSMA',
  description:
    'Apply for investor access to San Miguel de Allende luxury rental opportunities — 24-hour response, off-market deals, and the LRM acquisition team.',
};

export default function ContactPage() {
  return (
    <div className='doc-page' data-screen-label='Contact'>
      <ContactClient />
      <Disclaimer />
    </div>
  );
}
