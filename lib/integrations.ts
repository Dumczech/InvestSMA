/**
 * Future integration map:
 * - LRM internal reports: ingest nightly into benchmark_data payload snapshots.
 * - Guesty exports: parse reservation/channel data for occupancy, ADR, LOS, lead-time.
 * - Owner statement exports: validate gross revenue and fee normalization.
 * - AirDNA CSV/API: map neighborhood and bedroom benchmarks into benchmark_data.
 * - CRM lead capture: POST /api/leads currently stores in Supabase; add Pipedrive sync later.
 * - Report downloads: store PDFs in Supabase Storage `investsma-reports` bucket.
 */
export const INTEGRATION_PLAN_VERSION = 'v1';
