-- Pipeline columns + notes for the leads workflow. Lights up the
-- design fields in admin/leads (status, source classification,
-- assignee, internal notes) that were rendering as placeholders.

alter table public.leads add column if not exists status      text not null default 'new';
alter table public.leads add column if not exists source      text;
alter table public.leads add column if not exists assigned_to text;

create index if not exists idx_leads_status   on public.leads (status);
create index if not exists idx_leads_assigned on public.leads (assigned_to);

-- Allowed status values: new / contacted / qualified / meeting / won
-- / lost. Enforced as a soft constraint so older rows can still upsert.
alter table public.leads
  drop constraint if exists leads_status_check;
alter table public.leads
  add constraint leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'meeting', 'won', 'lost'));

-- Internal notes thread on a lead. Author is a free-text label for
-- now (admin email or 'system'); switch to a users.id FK once roles
-- + auth metadata are formalized.
create table if not exists public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  body        text not null,
  author      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_lead_notes_lead_created
  on public.lead_notes (lead_id, created_at desc);
