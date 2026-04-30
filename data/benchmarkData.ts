import { ReportSource } from '@/types/report';
// MOCK DATA: replace with AirDNA/API or CSV ingestion.
// TODO(integration): connect AirDNA exports and normalize by neighborhood + bedroom count.
export const reportSources: ReportSource[]=[
{sourceName:'LRM Internal PMS Rollup',sourceType:'internal',period:'Last 12 months',lastUpdated:'2026-04-01',notes:'Sample dataset for UI architecture testing.'},
{sourceName:'AirDNA Market Benchmark Export',sourceType:'airdna',period:'Last 12 months',lastUpdated:'2026-03-28',notes:'Sample benchmark placeholders.'},
{sourceName:'Owner Statement Normalization',sourceType:'imported_csv',period:'Q1 2026',lastUpdated:'2026-04-15',notes:'Mock transformed owner statement inputs.'}
];
