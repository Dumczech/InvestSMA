import type { Metadata } from 'next';
import ROIClient from './ROIClient';
import { getRoiCalculatorContent } from '@/lib/data/cms';

export const metadata: Metadata = {
  title: 'ROI Calculator | InvestSMA',
  description: 'Estimate ADR, occupancy, and annual gross for San Miguel de Allende income-producing property investments.',
};

export default async function Page() {
  const content = await getRoiCalculatorContent();
  return <ROIClient content={content} />;
}
