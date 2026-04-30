-- TODO: run in Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  budget text,
  timeline text,
  buyer_type text,
  neighborhoods text[],
  message text,
  source_page text
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  neighborhood text not null,
  price_usd numeric,
  bedrooms int,
  adr_low numeric,
  adr_high numeric,
  annual_gross_low numeric,
  annual_gross_high numeric,
  status text not null default 'draft'
);

create table if not exists public.market_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  period text not null,
  summary text,
  pdf_path text,
  published boolean not null default false
);

create table if not exists public.benchmark_data (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  period text not null,
  source_name text not null,
  source_type text not null,
  payload jsonb not null,
  notes text
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  title text not null,
  category text not null,
  excerpt text,
  body text,
  published boolean not null default false
);

-- Storage buckets (run once)
-- insert into storage.buckets (id, name, public) values ('investsma-assets','investsma-assets', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('investsma-reports','investsma-reports', false) on conflict do nothing;

-- Modular CMS + data platform tables
create table if not exists public.roi_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  input_payload jsonb not null,
  output_payload jsonb,
  version_tag text not null default 'v1'
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  module text,
  alt_text text,
  uploaded_by text
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_system text not null,
  source_type text not null,
  status text not null,
  input_uri text,
  output_summary jsonb,
  error_log text,
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null,
  permissions jsonb not null default '{}'::jsonb,
  assigned_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_user_id uuid,
  module text not null,
  action text not null,
  entity_type text,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb
);

create table if not exists public.investment_assumption_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  property_id uuid references public.properties(id) on delete cascade,
  version_no int not null,
  assumptions jsonb not null,
  created_by text not null,
  is_active boolean not null default true
);

create table if not exists public.event_tracking (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  module text not null,
  actor_id text,
  session_id text,
  payload jsonb
);

create table if not exists public.gated_access_grants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  resource_type text not null,
  resource_id text not null,
  access_status text not null default 'pending',
  granted_at timestamptz,
  expires_at timestamptz
);
