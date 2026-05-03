export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Row → Insert/Update helper.
// Two classes of columns are optional on Insert:
//   - Auto-generated columns (id, created_at, updated_at, assigned_at).
//   - Any column whose type includes `null` — Postgres will default these to NULL.
// Everything else stays required.
type Auto = 'id' | 'created_at' | 'updated_at' | 'assigned_at';

type RequiredInsertKeys<R> = {
  [K in keyof R]: K extends Auto ? never : null extends R[K] ? never : K
}[keyof R];

type OptionalInsertKeys<R> = {
  [K in keyof R]: K extends Auto ? K : null extends R[K] ? K : never
}[keyof R];

type RowToInsert<R> =
  & { [K in RequiredInsertKeys<R>]: R[K] }
  & { [K in OptionalInsertKeys<R>]?: R[K] };

type Table<R> = {
  Row: R;
  Insert: RowToInsert<R>;
  Update: Partial<RowToInsert<R>>;
  Relationships: [];
};

type LeadsRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  buyer_type: string | null;
  neighborhoods: string[] | null;
  message: string | null;
  source_page: string | null;
};

type PropertiesRow = {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  neighborhood: string;
  price_usd: number | null;
  bedrooms: number | null;
  adr_low: number | null;
  adr_high: number | null;
  annual_gross_low: number | null;
  annual_gross_high: number | null;
  upgrade_potential: string | null;
  investment_thesis: string | null;
  occupancy_assumption: string | null;
  strategy: string | null;
  seasonality: string | null;
  risks: Json | null;
  images: Json | null;
  status: string;
  // Design-bundle additions (20260501_property_design_columns.sql).
  score: number | null;
  baths: number | null;
  sqm: number | null;
  rooftop: boolean;
  accent2: string | null;
  style: 'colonial' | 'hacienda' | 'villa' | null;
  hero_image: string | null;
};

type MarketReportsRow = {
  id: string;
  created_at: string;
  title: string;
  period: string;
  summary: string | null;
  pdf_path: string | null;
  published: boolean;
};

type BenchmarkDataRow = {
  id: string;
  created_at: string;
  period: string;
  source_name: string;
  source_type: string;
  payload: Json;
  notes: string | null;
};

type ArticlesRow = {
  id: string;
  created_at: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  published: boolean;
  // Design-bundle additions for the post detail page
  // (20260503_article_post_columns.sql).
  deck: string | null;
  author: string | null;
  author_role: string | null;
  read_minutes: number | null;
  accent: string | null;
  body_json: Json | null;
  related: Json | null;
  published_at: string | null;
};

type SiteContentRow = {
  id: string;
  key: string;
  value: Json;
  status: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

type RoiSubmissionsRow = {
  id: string;
  created_at: string;
  lead_id: string | null;
  input_payload: Json;
  output_payload: Json | null;
  version_tag: string;
};

type MediaAssetsRow = {
  id: string;
  created_at: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string | null;
  module: string | null;
  alt_text: string | null;
  uploaded_by: string | null;
};

type ImportJobsRow = {
  id: string;
  created_at: string;
  source_system: string;
  source_type: string;
  status: string;
  input_uri: string | null;
  output_summary: Json | null;
  error_log: string | null;
  started_at: string | null;
  finished_at: string | null;
};

type UserRolesRow = {
  id: string;
  user_id: string;
  role: string;
  permissions: Json;
  assigned_at: string;
};

type AuditLogsRow = {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  module: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  before_state: Json | null;
  after_state: Json | null;
  metadata: Json | null;
};

type InvestmentAssumptionVersionsRow = {
  id: string;
  created_at: string;
  property_id: string | null;
  version_no: number;
  assumptions: Json;
  created_by: string;
  is_active: boolean;
};

type EventTrackingRow = {
  id: string;
  created_at: string;
  event_name: string;
  module: string;
  actor_id: string | null;
  session_id: string | null;
  payload: Json | null;
};

type GatedAccessGrantsRow = {
  id: string;
  created_at: string;
  lead_id: string | null;
  resource_type: string;
  resource_id: string;
  access_status: string;
  granted_at: string | null;
  expires_at: string | null;
};

type MarketDataImportsRow = {
  id: string;
  source_type: string;
  period: string;
  imported_file_name: string | null;
  import_batch_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type MarketMonthlyPerformanceRow = {
  id: string;
  source_type: string;
  period: string;
  month: number;
  year: number;
  lrm_occupancy: number | null;
  market_occupancy: number | null;
  lrm_adr: number | null;
  market_adr: number | null;
  lrm_revpar: number | null;
  market_revpar: number | null;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type MarketBedroomPerformanceRow = {
  id: string;
  source_type: string;
  period: string;
  bedroom_count: string;
  lrm_adr: number | null;
  market_adr: number | null;
  lrm_occupancy: number | null;
  market_occupancy: number | null;
  lrm_revpar: number | null;
  market_revpar: number | null;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type MarketNeighborhoodPerformanceRow = {
  id: string;
  source_type: string;
  period: string;
  month: number | null;
  year: number | null;
  neighborhood: string;
  lrm_adr: number | null;
  market_adr: number | null;
  lrm_occupancy: number | null;
  market_occupancy: number | null;
  lrm_revenue: number | null;
  market_revenue_estimate: number | null;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type MarketChannelMixRow = {
  id: string;
  source_type: string;
  period: string;
  month: number | null;
  year: number | null;
  channel_name: string;
  channel_share: number;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type MarketSeasonalityRow = {
  id: string;
  source_type: string;
  period: string;
  month: number;
  year: number;
  demand_index: number;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type AirdnaBenchmarkDataRow = {
  id: string;
  source_type: string;
  period: string;
  month: number | null;
  year: number | null;
  neighborhood: string | null;
  bedroom_count: string | null;
  occupancy: number | null;
  adr: number | null;
  revpar: number | null;
  supply: number | null;
  demand: number | null;
  imported_file_name: string | null;
  import_batch_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

type DataValidationErrorsRow = {
  id: string;
  source_type: string;
  period: string;
  row_number: number | null;
  table_name: string;
  import_batch_id: string | null;
  error_code: string;
  error_message: string;
  raw_row: Json | null;
  imported_file_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

export interface Database {
  public: {
    Tables: {
      leads: Table<LeadsRow>;
      properties: Table<PropertiesRow>;
      market_reports: Table<MarketReportsRow>;
      benchmark_data: Table<BenchmarkDataRow>;
      articles: Table<ArticlesRow>;
      site_content: Table<SiteContentRow>;
      roi_submissions: Table<RoiSubmissionsRow>;
      media_assets: Table<MediaAssetsRow>;
      import_jobs: Table<ImportJobsRow>;
      user_roles: Table<UserRolesRow>;
      audit_logs: Table<AuditLogsRow>;
      investment_assumption_versions: Table<InvestmentAssumptionVersionsRow>;
      event_tracking: Table<EventTrackingRow>;
      gated_access_grants: Table<GatedAccessGrantsRow>;
      market_data_imports: Table<MarketDataImportsRow>;
      market_monthly_performance: Table<MarketMonthlyPerformanceRow>;
      market_bedroom_performance: Table<MarketBedroomPerformanceRow>;
      market_neighborhood_performance: Table<MarketNeighborhoodPerformanceRow>;
      market_channel_mix: Table<MarketChannelMixRow>;
      market_seasonality: Table<MarketSeasonalityRow>;
      airdna_benchmark_data: Table<AirdnaBenchmarkDataRow>;
      data_validation_errors: Table<DataValidationErrorsRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
