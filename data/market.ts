import { MarketMetric } from '@/types/market';
// MOCK DATA: compare view defaults to LRM vs Market.
export const headlineMetrics: MarketMetric[]=[
{id:'adr',label:'ADR',period:'Last 12M',lrmValue:520,marketValue:372,unit:'currency',delta:148,deltaPercent:39.8,trend:'up',source:'LRM + AirDNA (sample)'},
{id:'occupancy',label:'Occupancy',period:'Last 12M',lrmValue:68,marketValue:62.4,unit:'percent',delta:5.6,deltaPercent:9,trend:'up',source:'LRM + AirDNA (sample)'},
{id:'revpar',label:'RevPAR',period:'Last 12M',lrmValue:354,marketValue:232,unit:'currency',delta:122,deltaPercent:52.6,trend:'up',source:'LRM + AirDNA (sample)'},
{id:'direct',label:'Direct Booking %',period:'Last 12M',lrmValue:41,marketValue:24,unit:'percent',delta:17,deltaPercent:70.8,trend:'up',source:'LRM + market benchmark (sample)'}
];
