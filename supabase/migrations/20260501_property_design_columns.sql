-- Adds the columns the design bundle's property cards + memo expect but
-- the original schema didn't include. Each is nullable so existing rows
-- (and the four placeholder rows) keep working, and admins can fill them
-- in from /admin/property-cms over time.
--
--   score        — LRM Score badge (0-100) on the property card
--   baths        — bathroom count, displayed alongside beds
--   sqm          — interior area in square meters
--   rooftop      — rooftop / Parroquia view flag (drives badge in memo hero)
--   accent2      — secondary accent hex used by the SVG art placeholder
--   style        — 'colonial' | 'hacienda' | 'villa' — selects the SVG variant
--   hero_image   — single-URL hero override; complements the existing
--                  jsonb `images` array used for the carousel/strip
--
-- Idempotent via ADD COLUMN IF NOT EXISTS. No backfill — migration 6's
-- core_tables.sql already populated the table; this just extends it.

alter table public.properties add column if not exists score      integer;
alter table public.properties add column if not exists baths      numeric;
alter table public.properties add column if not exists sqm        integer;
alter table public.properties add column if not exists rooftop    boolean not null default false;
alter table public.properties add column if not exists accent2    text;
alter table public.properties add column if not exists style      text check (style in ('colonial', 'hacienda', 'villa') or style is null);
alter table public.properties add column if not exists hero_image text;

create index if not exists idx_properties_score on public.properties (score desc);
