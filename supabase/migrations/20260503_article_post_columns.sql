-- Extends articles with rich-content fields the design's post detail page
-- expects (post.jsx + post-content.jsx). The existing `body` column stays
-- for plain-text fallback / search; new `body_json` holds the typed section
-- array (h2 / p / stats / callout). All nullable so existing rows keep
-- rendering with the legacy /insights card layout.

alter table public.articles add column if not exists deck          text;
alter table public.articles add column if not exists author        text;
alter table public.articles add column if not exists author_role   text;
alter table public.articles add column if not exists read_minutes  int;
alter table public.articles add column if not exists accent        text;     -- hex; powers the post hero gradient
alter table public.articles add column if not exists body_json     jsonb;    -- [{kind:'h2'|'p'|'stats'|'callout', ...}, ...]
alter table public.articles add column if not exists related       jsonb;    -- ["slug-1","slug-2","slug-3"]
alter table public.articles add column if not exists published_at  timestamptz;

create index if not exists idx_articles_category    on public.articles (category);
create index if not exists idx_articles_published_at on public.articles (published_at desc);
