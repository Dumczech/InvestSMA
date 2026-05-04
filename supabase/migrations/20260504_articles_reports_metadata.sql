-- Final TODO_SCHEMA cleanup: lights up the SEO/hero fields on the
-- article editor and the gated/downloads fields on the market-report
-- list. After this migration, every "not yet stored" caption in the
-- admin is gone.

-- ============================================================
-- articles
-- ============================================================
-- The post editor's hero picker, SEO tab, and 3-state status radio
-- (draft / review / published) all need backing columns. The existing
-- `published` boolean stays for fast filtering on the public site;
-- `review_status` is the explicit pipeline state.

alter table public.articles add column if not exists hero_image_url   text;
alter table public.articles add column if not exists hero_alt         text;
alter table public.articles add column if not exists seo_title        text;
alter table public.articles add column if not exists meta_description text;
alter table public.articles add column if not exists canonical_url    text;
alter table public.articles add column if not exists review_status    text not null default 'draft'
  check (review_status in ('draft', 'review', 'published'));

-- Backfill review_status from the existing published flag so older
-- rows don't all read as 'draft'.
update public.articles
   set review_status = case when published then 'published' else 'draft' end
 where review_status = 'draft' and published = true;

create index if not exists idx_articles_review_status on public.articles (review_status);

-- ============================================================
-- market_reports
-- ============================================================
-- The list shows separate Gated + Active toggles in the design, plus
-- a Downloads count. `published` becomes the "active" flag (already
-- in the schema); `gated` is independent.

alter table public.market_reports add column if not exists gated          boolean not null default true;
alter table public.market_reports add column if not exists download_count integer not null default 0;
