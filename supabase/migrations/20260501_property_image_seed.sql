-- Seeds the four sample properties as live published rows + a single
-- site_content key (`default_property_image`) holding the URL the site
-- falls back to when a property's `images` array is empty. Both are safe
-- to re-run: properties use ON CONFLICT (slug); site_content uses
-- ON CONFLICT (key). Admin edits made via /admin/property-cms or
-- /admin/content-cms are preserved.

-- Global fallback image (admins can swap site-wide from /admin/content-cms).
insert into public.site_content (key, value)
values
  (
    'default_property_image',
    '{"url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&h=1000&fit=crop&q=80"}'::jsonb
  )
on conflict (key) do nothing;

-- Sample published properties — match the data/properties.ts fallback so
-- behavior is identical whether the table is empty or seeded.
insert into public.properties (
  slug, name, neighborhood, price_usd, bedrooms, baths, sqm, rooftop,
  score, style, accent2, adr_low, adr_high, annual_gross_low, annual_gross_high,
  upgrade_potential, investment_thesis, occupancy_assumption, strategy, seasonality,
  risks, images, hero_image, status
) values
(
  'casa-centro-grande', 'Casa Centro Grande', 'Centro', 2400000, 9, 8, 720, true,
  88, 'colonial', '#D9CFB8', 1200, 2000, 325000, 525000,
  'Suite refresh + rooftop events',
  'Rare scale in walkable core drives group demand and premium stays.',
  '61%–72%',
  'Position as flagship luxury group villa with direct-booking funnel.',
  'Holiday and wedding compression adds outsized ADR potential.',
  '["Historic-core permitting constraints","Capex timing for luxury finishes"]'::jsonb,
  '["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=1000&fit=crop&q=80"]'::jsonb,
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&h=1000&fit=crop&q=80',
  'published'
),
(
  'casa-vista-luxury', 'Casa Vista Luxury', 'Atascadero', 1800000, 6, 6, 540, true,
  84, 'hacienda', '#1F3A2E', 900, 1500, 250000, 400000,
  'Pool + wellness terrace',
  'View-driven inventory with differentiated design appeals to long weekend demand.',
  '58%–68%',
  'Blend premium OTA and direct repeat campaigns.',
  'Peak winter and festival periods support stepped pricing.',
  '["Slope access may limit some guest segments"]'::jsonb,
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&h=1000&fit=crop&q=80"]'::jsonb,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=1000&fit=crop&q=80',
  'published'
),
(
  'boutique-hotel-conversion', 'Boutique Hotel Conversion', 'Centro', 5200000, 12, 12, 1100, true,
  92, 'colonial', '#ECE3CD', 2500, 4000, 900000, 1400000,
  'F&B activation + event program',
  'Institutional-style cash flow profile with group/event monetization upside.',
  '54%–66%',
  'Operate as branded buyout-ready asset with concierge stack.',
  'Strongest uplift during weddings, holidays, and cultural events.',
  '["Execution complexity","Higher staffing overhead"]'::jsonb,
  '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1600&h=1000&fit=crop&q=80"]'::jsonb,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=1000&fit=crop&q=80',
  'published'
),
(
  'design-villa', 'Design Villa', 'Guadiana', 1300000, 5, 5, 410, false,
  79, 'villa', '#C9A55A', 700, 1150, 190000, 310000,
  'Smart-home + design package',
  'Design-led asset in desirable residential pocket balances lifestyle and income.',
  '57%–70%',
  'Target affluent family and small-group cohorts.',
  'Shoulder seasons can be lifted via content and direct channels.',
  '["Competitive mid-size inventory"]'::jsonb,
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&h=1000&fit=crop&q=80","https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=1600&h=1000&fit=crop&q=80"]'::jsonb,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=1000&fit=crop&q=80',
  'published'
)
on conflict (slug) do nothing;
