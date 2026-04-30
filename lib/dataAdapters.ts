import { headlineMetrics } from '@/data/market';
import { lrmMonthly, lrmBedroom, lrmNeighborhood } from '@/data/lrmPerformance';
import { reportSources } from '@/data/benchmarkData';
// TODO(integration): replace static exports with async fetchers for LRM internal reports, Guesty, AirDNA CSV/API, CRM lead capture, and downloadable report jobs.
export const marketDashboardData=()=>({headlineMetrics,lrmMonthly,lrmBedroom,lrmNeighborhood,reportSources});
