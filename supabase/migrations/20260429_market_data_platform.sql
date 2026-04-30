create extension if not exists pgcrypto;

create table if not exists public.market_data_imports (
  id uuid primary key default gen_random_uuid(), source_type text not null check (source_type in ('lrm_internal','airdna','manual','csv')), period text not null,
  imported_file_name text, import_batch_id text not null, status text not null check (status in ('draft','needs_review','verified','published')) default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);

create table if not exists public.market_monthly_performance (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, month int not null, year int not null,
  lrm_occupancy numeric, market_occupancy numeric, lrm_adr numeric, market_adr numeric, lrm_revpar numeric, market_revpar numeric,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.market_bedroom_performance (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, bedroom_count text not null,
  lrm_adr numeric, market_adr numeric, lrm_occupancy numeric, market_occupancy numeric, lrm_revpar numeric, market_revpar numeric,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.market_neighborhood_performance (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, month int, year int, neighborhood text not null,
  lrm_adr numeric, market_adr numeric, lrm_occupancy numeric, market_occupancy numeric, lrm_revenue numeric, market_revenue_estimate numeric,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.market_channel_mix (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, month int, year int, channel_name text not null, channel_share numeric not null,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.market_seasonality (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, month int not null, year int not null, demand_index numeric not null,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.airdna_benchmark_data (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, month int, year int, neighborhood text, bedroom_count text,
  occupancy numeric, adr numeric, revpar numeric, supply numeric, demand numeric,
  imported_file_name text, import_batch_id text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
create table if not exists public.data_validation_errors (
  id uuid primary key default gen_random_uuid(), source_type text not null, period text not null, row_number int, table_name text not null, import_batch_id text,
  error_code text not null, error_message text not null, raw_row jsonb, imported_file_name text, status text not null default 'needs_review', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by text, notes text
);
