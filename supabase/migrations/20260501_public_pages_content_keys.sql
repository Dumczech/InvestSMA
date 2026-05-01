-- Seeds site_content rows for public pages whose copy/numbers used to be
-- hardcoded in JSX:
--   * market_headline_metrics  — KPI tiles on /market-data
--   * contact_page             — title, subtitle, field labels, submit on /contact
--   * insights_fallback_titles — placeholder cards on /insights when articles
--                                 table is empty
--   * roi_calculator           — title, inputs, gated section copy on /roi-calculator
--
-- The shapes mirror the loader functions in lib/data/cms.ts; defaults match
-- the prior hardcoded copy verbatim. ON CONFLICT DO NOTHING keeps any admin
-- edits safe on re-apply.

insert into public.site_content (key, value)
values
  (
    'market_headline_metrics',
    '{
      "items": [
        { "id": "adr",       "label": "ADR",              "period": "Last 12M", "lrmValue": 520, "marketValue": 372,  "unit": "currency", "delta": 148,  "deltaPercent": 39.8, "trend": "up", "source": "LRM + AirDNA (sample)" },
        { "id": "occupancy", "label": "Occupancy",        "period": "Last 12M", "lrmValue": 68,  "marketValue": 62.4, "unit": "percent",  "delta": 5.6,  "deltaPercent": 9,    "trend": "up", "source": "LRM + AirDNA (sample)" },
        { "id": "revpar",    "label": "RevPAR",           "period": "Last 12M", "lrmValue": 354, "marketValue": 232,  "unit": "currency", "delta": 122,  "deltaPercent": 52.6, "trend": "up", "source": "LRM + AirDNA (sample)" },
        { "id": "direct",    "label": "Direct Booking %", "period": "Last 12M", "lrmValue": 41,  "marketValue": 24,   "unit": "percent",  "delta": 17,   "deltaPercent": 70.8, "trend": "up", "source": "LRM + market benchmark (sample)" }
      ]
    }'::jsonb
  ),
  (
    'contact_page',
    '{
      "title": "Request Investor Access",
      "subtitle": "Apply for curated opportunities, market intelligence, and underwriting support.",
      "fieldLabels": ["Name", "Email", "Phone", "Budget", "Timeline", "Buyer type", "Interested neighborhoods"],
      "messagePlaceholder": "Message",
      "submitLabel": "Request Investor Access"
    }'::jsonb
  ),
  (
    'insights_fallback_titles',
    '{
      "items": [
        "Is San Miguel de Allende a Good Real Estate Investment?",
        "What Kind of Rental Revenue Can a Luxury Home Generate in San Miguel?",
        "Why Large Homes Outperform During Peak Season",
        "Second Home vs. Investment Property in Mexico",
        "How LRM Evaluates an Investment Property"
      ]
    }'::jsonb
  ),
  (
    'roi_calculator',
    '{
      "title": "ROI Potential Calculator",
      "subtitle": "Directional underwriting to frame positioning and next steps.",
      "inputs": [
        "Purchase budget",
        "Down payment %",
        "Bedroom count",
        "Property condition",
        "Upgrade budget",
        "Personal-use days/year",
        "Target positioning: mid-market/luxury/ultra-luxury"
      ],
      "submitLabel": "Run Analysis",
      "gate": {
        "title": "Investor Access Required",
        "fields": [
          "Name",
          "Email",
          "Phone",
          "Budget",
          "Buying timeline",
          "Interested in: Second home / Investment property / Hybrid personal-use property / Off-market deals"
        ],
        "sampleResult": "Estimated ADR: $900–$1,450 · Occupancy: 60–70% · Annual Gross: $240K–$410K · Suggested positioning: Luxury · Next step: Request underwriting call."
      }
    }'::jsonb
  )
on conflict (key) do nothing;
