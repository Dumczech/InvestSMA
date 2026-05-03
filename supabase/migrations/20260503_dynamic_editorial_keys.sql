-- Seeds 12 site_content keys absorbing the editorial arrays that were
-- previously inlined in TSX files. Each row matches the prior hardcoded
-- values byte-for-byte so behavior is unchanged at deploy. Admins can
-- edit each from /admin/content-cms.
--
-- ON CONFLICT DO NOTHING preserves any existing admin edits on re-apply.

insert into public.site_content (key, value)
values
-- 1. Homepage hero background image
(
  'homepage_hero_image',
  '{"url":"https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=2400&q=80"}'::jsonb
),
-- 2. Homepage credibility stats (4 numbers)
(
  'homepage_credibility',
  '{
    "items": [
      {"num":"312","label":"Properties\ntracked"},
      {"num":"$2.4B","label":"AUM in San\nMiguel market"},
      {"num":"11","label":"Years operating\nLRM portfolio"},
      {"num":"94%","label":"Investor 2nd-\ntransaction rate"}
    ]
  }'::jsonb
),
-- 3. Homepage video tiles (3)
(
  'homepage_videos',
  '{
    "items": [
      {"id":"v1","title":"Q1 Market Update — what shifted","dur":"8:42","img":"https://images.unsplash.com/photo-1555881400-69d63dca8a91?auto=format&fit=crop&w=1200&q=80","cat":"Market Update"},
      {"id":"v2","title":"Inside Casa Solana — full property tour","dur":"12:18","img":"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80","cat":"Property Tour"},
      {"id":"v3","title":"How LRM manages a 5-property portfolio","dur":"14:05","img":"https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","cat":"Operator Series"}
    ]
  }'::jsonb
),
-- 4. Homepage seasonal occupancy chart
(
  'homepage_occupancy_chart',
  '{
    "fig_label":"Fig. 01 · Seasonal Occupancy",
    "title":"2025 average — 4-bedroom SMA",
    "annual_avg":"62.4%",
    "months":["J","F","M","A","M","J","J","A","S","O","N","D"],
    "data":[78,82,76,64,52,48,54,56,58,68,81,86]
  }'::jsonb
),
-- 5. Homepage neighborhood comparison
(
  'homepage_nbhd_comparison',
  '{
    "items": [
      {"name":"Centro Histórico","adr":418,"yield":9.8},
      {"name":"Atascadero","adr":362,"yield":8.4},
      {"name":"San Antonio","adr":294,"yield":9.2},
      {"name":"Los Frailes","adr":312,"yield":7.6},
      {"name":"El Chorro","adr":486,"yield":8.9}
    ]
  }'::jsonb
),
-- 6. Bloomberg ticker items (10)
(
  'ticker_items',
  '{
    "items": [
      {"label":"SMA·OCC","val":"62.4%","delta":"+3.1%","up":true},
      {"label":"CENTRO·ADR","val":"$418","delta":"+8.2%","up":true},
      {"label":"ATASCADERO·ADR","val":"$362","delta":"+5.4%","up":true},
      {"label":"SAN ANTONIO·ADR","val":"$294","delta":"+2.1%","up":true},
      {"label":"YOY·VISITORS","val":"+11.8%","delta":"↑","up":true},
      {"label":"AVG·STAY","val":"4.1 nights","delta":"+0.3","up":true},
      {"label":"CAP·RATE·LUX","val":"6.8%","delta":"−0.2%","up":false},
      {"label":"GROSS·YIELD","val":"9.2%","delta":"+0.4%","up":true},
      {"label":"PEAK·NOV-MAR","val":"78% OCC","delta":"↑","up":true},
      {"label":"INVENTORY","val":"–4.2%","delta":"tightening","up":false}
    ]
  }'::jsonb
),
-- 7. Nav pages (top-level routes)
(
  'nav_pages',
  '{
    "items": [
      {"id":"home","label":"Home","href":"/"},
      {"id":"properties","label":"Properties","href":"/properties"},
      {"id":"market","label":"Market Data","href":"/market-data"},
      {"id":"roi","label":"ROI Calculator","href":"/roi-calculator"},
      {"id":"insights","label":"Insights","href":"/insights"},
      {"id":"contact","label":"Investor Access","href":"/contact"}
    ]
  }'::jsonb
),
-- 8. Footer columns + contact info
(
  'footer_config',
  '{
    "tagline":"A research and lead-gen platform for investors evaluating turnkey luxury rental properties in San Miguel de Allende. Operated by Luxury Rental Management.",
    "chips":["Operator-led","Real Data"],
    "explore":[
      {"label":"Featured Properties","href":"/properties"},
      {"label":"Market Data","href":"/market-data"},
      {"label":"ROI Calculator","href":"/roi-calculator"},
      {"label":"Insights & Reports","href":"/insights"}
    ],
    "resources":[
      {"label":"Buyer''s Guide","href":"/insights"},
      {"label":"Q1 Market Report","href":"/insights"},
      {"label":"Tax & Ownership","href":"/insights"},
      {"label":"Case Studies","href":"/insights"}
    ],
    "contact":[
      {"label":"Request Access","href":"/contact"},
      {"label":"justin@luxrentalmgmt.com","href":"mailto:justin@luxrentalmgmt.com"},
      {"label":"+1 (512) 366-2801","href":"tel:+15123662801"},
      {"label":"San Miguel de Allende, GTO"}
    ],
    "copyright":"© 2026 Luxury Rental Management · justin@luxrentalmgmt.com · +1 (512) 366-2801",
    "tagline_short":"Estimates are directional only — not guaranteed."
  }'::jsonb
),
-- 9. About page editorial
(
  'about_page',
  '{
    "stats":[
      {"v":"11","l":"Years operating SMA"},
      {"v":"40+","l":"LRM portfolio doors"},
      {"v":"$280K","l":"Avg. gross / property"}
    ],
    "are_not":[
      {"t":"A real estate brokerage","d":"We don''t represent buyers or sellers in transactions, and we don''t collect a brokerage commission on your purchase."},
      {"t":"A passive financial advisor","d":"We''re not licensed financial advisors. We don''t package securities or run pooled funds."},
      {"t":"A speculation play","d":"We don''t make calls based on macro sentiment or where prices \"should\" be in five years."}
    ],
    "are":[
      {"t":"Operators","d":"We run a portfolio of high-end short-term rentals in SMA every day. The data flowing through our system is what informs every recommendation."},
      {"t":"A management platform","d":"Through Luxury Rental Management, we execute the full operational stack — design, listing, pricing, distribution, guest experience."},
      {"t":"Aligned by performance","d":"Our income depends on the property performing after it''s purchased. That keeps the incentives clean."}
    ],
    "stack":[
      {"phase":"Acquisition","items":["Off-market sourcing","Underwriting + memo","Notario + fideicomiso intro"]},
      {"phase":"Stabilization","items":["Design refresh + furnishing","Pro photo + 360° tour","OTA + direct site live"]},
      {"phase":"Operations","items":["24/7 bilingual concierge","Dynamic pricing weekly","Quarterly owner reporting"]},
      {"phase":"Optimization","items":["Annual ADR/occ review","Capex ROI tracking","Tax-efficient distributions"]}
    ]
  }'::jsonb
),
-- 10. Contact form schema (interests/budgets/timelines)
(
  'contact_form_options',
  '{
    "interests":[
      "Second home (primary use)",
      "Pure investment property",
      "Hybrid personal-use + rental",
      "Off-market / pre-listing access",
      "Portfolio (3+ properties)",
      "Just doing research"
    ],
    "budgets":["$500K–$1M","$1M–$2M","$2M–$5M","$5M+"],
    "timelines":["0–3 mo","3–6 mo","6–12 mo","12+ mo","Researching"]
  }'::jsonb
),
-- 11. Insights category filter chips
(
  'insights_categories',
  '{
    "items":[
      {"id":"all","label":"All Insights","matches":null},
      {"id":"market","label":"Market Reports","matches":"Market Report"},
      {"id":"guide","label":"Investment Guides","matches":"Investment Guide"},
      {"id":"buyer","label":"Buyer Education","matches":"Buyer Education"},
      {"id":"case","label":"Case Studies","matches":"Case Study"},
      {"id":"tax","label":"Tax & Ownership","matches":"Tax & Ownership"},
      {"id":"lifestyle","label":"Second-Home Living","matches":"Lifestyle"}
    ]
  }'::jsonb
),
-- 12. Memo editorial (thesis bullets, upgrades, management, risks,
--                   seasonal events, monthly seasonality)
(
  'memo_editorial',
  '{
    "monthly_labels":["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
    "seasonality":[88,84,76,64,48,42,56,58,54,64,78,92],
    "adr_factor":[1.2,1.15,1.05,0.92,0.78,0.72,0.85,0.85,0.82,0.95,1.18,1.35],
    "thesis":[
      {"t":"Location alpha","d":"{neighborhood} commands premium ADR vs SMA average. Walkable to Jardín, Parroquia, and the principal restaurant corridor."},
      {"t":"Inventory scarcity","d":"Active inventory in this segment fell 4.2% YoY. Only 11 luxury 4BD+ properties traded in Q1 2026."},
      {"t":"Demand tailwind","d":"Wedding season + Día de Muertos + Christmas occupy 78% of November–March nights at premium ADR."},
      {"t":"Operator advantage","d":"LRM portfolio properties generate 18% higher RevPAR vs. owner-operated peers — verified across 312 units."}
    ],
    "upgrades":[
      {"item":"Rooftop terrace expansion + plunge pool","cost":65000,"lift":"+$48 ADR","payback":"2.1 yr"},
      {"item":"Primary suite refresh + linens","cost":22000,"lift":"+$22 ADR","payback":"1.4 yr"},
      {"item":"Outdoor kitchen / fire pit","cost":28000,"lift":"+$18 ADR","payback":"2.2 yr"},
      {"item":"Pro photography + LRM staging","cost":8000,"lift":"+8% occ","payback":"0.6 yr"}
    ],
    "management":[
      {"phase":"Acquisition","items":["Title clearance via Mexican notary","Fideicomiso setup (60 days)","Inventory + condition audit"]},
      {"phase":"Stabilization","items":["LRM design refresh (90 days)","Pro photo + 360° tour","OTA listings + direct site live"]},
      {"phase":"Operations","items":["24/7 guest concierge (bilingual)","Dynamic pricing — adjusted weekly","Quarterly owner reporting"]},
      {"phase":"Optimization","items":["Annual ADR & occupancy review","Upgrade ROI tracking","Tax-efficient distribution planning"]}
    ],
    "management_stats":[
      {"v":"22%","l":"LRM mgmt fee"},
      {"v":"4–6 wks","l":"To first guest"},
      {"v":"47","l":"Active LRM properties"},
      {"v":"18%","l":"RevPAR vs. owner-op"}
    ],
    "risks":[
      {"t":"Regulatory","d":"SMA municipality is reviewing short-term rental licensing. We model 6% annual licensing/registration cost as a contingency, even though current law does not require it."},
      {"t":"FX exposure","d":"Owner P&L is reported in MXN. We hedge 50% of distributions via forward contracts; net peso volatility historically ±4% annualized on yields."},
      {"t":"Concentration","d":"A material portion of demand originates from US/Canada. We model a 12% revenue haircut in a recession scenario but historical SMA performance has decoupled from US metro markets."},
      {"t":"Operator dependency","d":"Property economics rely on LRM (or comparable) management. Owner-operator path is supported but reduces projected RevPAR by ~18%."}
    ],
    "seasonal_events":[
      {"period":"Día de Muertos","date":"Oct 28 – Nov 4","adr":"$680","occ":"92%","notes":"Books 6mo out"},
      {"period":"Christmas / NYE","date":"Dec 18 – Jan 4","adr":"$820","occ":"96%","notes":"Multi-week stays"},
      {"period":"Wedding peak","date":"Feb – Apr weekends","adr":"$640","occ":"88%","notes":"Full-property buyouts"},
      {"period":"Independence Day","date":"Sep 13 – 17","adr":"$480","occ":"85%","notes":"Domestic demand"}
    ]
  }'::jsonb
)
on conflict (key) do nothing;
