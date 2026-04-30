create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

-- seed keys for frontend control
insert into public.site_content (key, value)
values
('homepage_hero', '{"headline":"Invest in San Miguel de Allende’s Most Desirable Luxury Rental Market","subheadline":"Access real rental performance data, curated acquisition opportunities, and turnkey management from one of San Miguel’s leading luxury rental operators."}'),
('homepage_metrics', '{"items":[{"label":"Luxury units managed","value":"45+"},{"label":"Guest database","value":"10,000+"},{"label":"Direct booking network","value":"Strong"},{"label":"Concierge & operations","value":"Full team"}]}')
on conflict (key) do nothing;
