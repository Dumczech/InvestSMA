-- Core platform tables that the application code reads/writes but were
-- previously only defined in the un-applied db/schema.sql draft. Brings
-- the migration chain in sync with lib/supabase/types.ts so the typed
-- Supabase client and the live database agree.
--
-- Existing migrations cover: site_content (admin_cms_controls) and the
-- nine market_* tables (market_data_platform). This migration adds
-- everything else referenced by app/* and lib/* — leads, properties,
-- articles, market_reports, media_assets, plus the operational tables
-- (audit_logs, user_roles, etc.) the platform components expect.
--
-- Idempotent: every CREATE uses IF NOT EXISTS so re-applying is safe.

create extension if not exists pgcrypto;

-- ============================================================
-- Public site / lead capture
-- ============================================================

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  email           text not null,
  phone           text,
  budget          text,
  timeline        text,
  buyer_type      text,
  neighborhoods   text[],
  message         text,
  source_page     text
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_email      on public.leads (email);

-- ============================================================
-- Property catalogue
-- ============================================================

create table if not exists public.properties (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  slug                  text unique not null,
  name                  text not null,
  neighborhood          text not null,
  price_usd             numeric,
  bedrooms              int,
  adr_low               numeric,
  adr_high              numeric,
  annual_gross_low      numeric,
  annual_gross_high     numeric,
  upgrade_potential     text,
  investment_thesis     text,
  occupancy_assumption  text,
  strategy              text,
  seasonality           text,
  risks                 jsonb,
  images                jsonb,
  status                text not null default 'draft'
);

create index if not exists idx_properties_status on public.properties (status);
create index if not exists idx_properties_slug   on public.properties (slug);

-- ============================================================
-- Editorial / insights
-- ============================================================

create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  slug        text unique not null,
  title       text not null,
  category    text not null,
  excerpt     text,
  body        text,
  published   boolean not null default false
);

create index if not exists idx_articles_published on public.articles (published);

-- ============================================================
-- Market reports + benchmark data
-- ============================================================

create table if not exists public.market_reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null,
  period      text not null,
  summary     text,
  pdf_path    text,
  published   boolean not null default false
);

create table if not exists public.benchmark_data (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  period        text not null,
  source_name   text not null,
  source_type   text not null,
  payload       jsonb not null,
  notes         text
);

-- ============================================================
-- ROI calculator submissions
-- ============================================================

create table if not exists public.roi_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  lead_id         uuid references public.leads(id) on delete set null,
  input_payload   jsonb not null,
  output_payload  jsonb,
  version_tag     text not null default 'v1'
);

-- ============================================================
-- Media library
-- ============================================================

create table if not exists public.media_assets (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  storage_bucket  text not null,
  storage_path    text not null,
  mime_type       text,
  module          text,
  alt_text        text,
  uploaded_by     text
);

-- Storage buckets used by app/api/admin/media-assets/route.ts. Created via
-- the storage API rather than CREATE TABLE; the inserts are commented out by
-- default because Supabase requires the privileged storage owner role.
-- Run once in the Supabase dashboard or via the `supabase` CLI:
--
--   insert into storage.buckets (id, name, public) values
--     ('investsma-assets',  'investsma-assets',  true ),
--     ('investsma-reports', 'investsma-reports', false)
--   on conflict do nothing;

-- ============================================================
-- Operational platform: imports, audit, RBAC, events
-- ============================================================

create table if not exists public.import_jobs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  source_system   text not null,
  source_type     text not null,
  status          text not null,
  input_uri       text,
  output_summary  jsonb,
  error_log       text,
  started_at      timestamptz,
  finished_at     timestamptz
);

create table if not exists public.user_roles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  role          text not null,
  permissions   jsonb not null default '{}'::jsonb,
  assigned_at   timestamptz not null default now()
);

create index if not exists idx_user_roles_user on public.user_roles (user_id);

create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  actor_user_id   uuid,
  module          text not null,
  action          text not null,
  entity_type     text,
  entity_id       text,
  before_state    jsonb,
  after_state     jsonb,
  metadata        jsonb
);

create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_module     on public.audit_logs (module);

create table if not exists public.investment_assumption_versions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  property_id   uuid references public.properties(id) on delete cascade,
  version_no    int not null,
  assumptions   jsonb not null,
  created_by    text not null,
  is_active     boolean not null default true
);

create table if not exists public.event_tracking (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_name  text not null,
  module      text not null,
  actor_id    text,
  session_id  text,
  payload     jsonb
);

create index if not exists idx_event_tracking_event on public.event_tracking (event_name);

create table if not exists public.gated_access_grants (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  lead_id         uuid references public.leads(id) on delete set null,
  resource_type   text not null,
  resource_id     text not null,
  access_status   text not null default 'pending',
  granted_at      timestamptz,
  expires_at      timestamptz
);
