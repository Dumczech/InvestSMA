-- Adds two site_content rows that back the homepage strings previously
-- hardcoded in app/page.tsx:
--   * homepage_market_snapshot — the "Market Index Snapshot" comparison strip
--   * homepage_gated_cta       — the "Gated Market Report" call-to-action
--
-- The shape mirrors lib/data/cms.ts:HomepageMarketSnapshot / HomepageGatedCta
-- so admin edits can be loaded by getHomepageContent() without code changes.
-- ON CONFLICT DO NOTHING keeps existing edits safe on re-apply.

insert into public.site_content (key, value)
values
  (
    'homepage_market_snapshot',
    '{
      "title": "Market Index Snapshot (Compare View)",
      "comparisons": [
        { "label": "ADR",       "lrm": "$520", "market": "$372"  },
        { "label": "Occupancy", "lrm": "68%",  "market": "62.4%" },
        { "label": "RevPAR",    "lrm": "$354", "market": "$232"  }
      ],
      "ctaLabel": "Open Full Dashboard",
      "ctaHref": "/market-data"
    }'::jsonb
  ),
  (
    'homepage_gated_cta',
    '{
      "title": "Gated Market Report",
      "body": "Access institutional-grade San Miguel luxury rental signals.",
      "ctaLabel": "Request access",
      "ctaHref": "/contact"
    }'::jsonb
  )
on conflict (key) do nothing;
