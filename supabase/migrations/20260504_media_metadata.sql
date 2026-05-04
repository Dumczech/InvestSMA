-- Lights up the design fields in admin/media-library that were marked
-- TODO_SCHEMA: folder/name browsing, file size for the storage strip,
-- per-asset dimensions, duration for video, and tag filtering.

alter table public.media_assets add column if not exists name        text;
alter table public.media_assets add column if not exists folder      text;
alter table public.media_assets add column if not exists size_bytes  bigint;
alter table public.media_assets add column if not exists width       int;
alter table public.media_assets add column if not exists height      int;
alter table public.media_assets add column if not exists duration_ms int;          -- video assets only
alter table public.media_assets add column if not exists tags        text[] default '{}';

create index if not exists idx_media_assets_folder      on public.media_assets (folder);
create index if not exists idx_media_assets_created_at  on public.media_assets (created_at desc);
create index if not exists idx_media_assets_tags        on public.media_assets using gin (tags);

-- Backfill name from the path basename + folder from the existing
-- module classification so already-uploaded assets keep their grouping
-- after the migration.
update public.media_assets
   set name   = coalesce(name, regexp_replace(storage_path, '^.*/', ''))
 where name is null;

update public.media_assets
   set folder = coalesce(folder, module)
 where folder is null;
