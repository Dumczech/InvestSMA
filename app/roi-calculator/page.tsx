import type { Metadata } from 'next';
import ROIClient from './ROIClient';
export const metadata: Metadata={title:'ROI Calculator | InvestSMA',description:'Estimate ADR, occupancy, and annual gross for San Miguel de Allende income-producing property investments.'};
export default function Page(){return <ROIClient/>}
