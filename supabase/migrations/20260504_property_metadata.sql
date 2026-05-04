-- Lights up the design fields in admin/property-cms that were marked
-- TODO_SCHEMA: headline, position, per-line operating costs, occupancy
-- bands, walkthrough video, floor plans, memo subsections, SEO, and
-- publish-time toggles.
--
-- (sqm + baths already exist from 20260501_property_design_columns.sql,
-- so they're not re-added here.)
--
-- All nullable / safely defaulted so existing rows continue to render.

-- Public-facing copy
alter table public.properties add column if not exists headline                  text;
alter table public.properties add column if not exists position_in_market        text
  check (position_in_market is null or position_in_market in ('Entry', 'Premium', 'Editorial', 'Trophy'));

-- Occupancy bands (the existing `occupancy_assumption` text column stays
-- as a free-text caption; these two add structured numbers for the memo).
alter table public.properties add column if not exists occupancy_low_pct         numeric(5, 2);
alter table public.properties add column if not exists occupancy_high_pct        numeric(5, 2);

-- Per-line operating cost defaults shown on the Financial tab
alter table public.properties add column if not exists lrm_management_fee_pct    numeric(5, 2);
alter table public.properties add column if not exists cleaning_per_stay_usd     numeric(10, 2);
alter table public.properties add column if not exists property_tax_usd          numeric(10, 2);
alter table public.properties add column if not exists utilities_per_year_usd    numeric(10, 2);
alter table public.properties add column if not exists insurance_per_year_usd    numeric(10, 2);
alter table public.properties add column if not exists maintenance_reserve_pct   numeric(5, 2);

-- Media tab additions
alter table public.properties add column if not exists walkthrough_video_url     text;
alter table public.properties add column if not exists floor_plans               jsonb default '[]'::jsonb;

-- Memo subsections (the design has 5; the existing investment_thesis,
-- strategy, and seasonality cover three — these add the remaining two
-- plus a structured key-metrics block).
alter table public.properties add column if not exists upgrade_strategy          text;
alter table public.properties add column if not exists lrm_operating_plan        text;
alter table public.properties add column if not exists key_metrics               jsonb default '{}'::jsonb;

-- SEO
alter table public.properties add column if not exists seo_title                 text;
alter table public.properties add column if not exists seo_description           text;
alter table public.properties add column if not exists og_image_path             text;

-- Publish-tab toggles
alter table public.properties add column if not exists gate_full_memo            boolean not null default true;
alter table public.properties add column if not exists featured_on_homepage      boolean not null default false;
alter table public.properties add column if not exists allow_indexing            boolean not null default true;
alter table public.properties add column if not exists assigned_advisor          text;

create index if not exists idx_properties_featured on public.properties (featured_on_homepage) where featured_on_homepage = true;
create index if not exists idx_properties_advisor  on public.properties (assigned_advisor);
