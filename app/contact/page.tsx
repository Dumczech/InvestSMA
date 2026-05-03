import type { Metadata } from 'next';
import { Disclaimer } from '@/components/site';
import { getContactFormOptions } from '@/lib/data/editorial';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Investor Access · InvestSMA',
  description:
    'Apply for investor access to San Miguel de Allende luxury rental opportunities — 24-hour response, off-market deals, and the LRM acquisition team.',
};

export default async function ContactPage() {
  const opts = await getContactFormOptions();
  return (
    <div className='doc-page' data-screen-label='Contact'>
      <ContactClient options={opts} />
      <Disclaimer />
    </div>
  );
}
