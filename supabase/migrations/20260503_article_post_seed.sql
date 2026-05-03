-- Seeds the 9 designed insight posts as published articles. Each row's
-- body_json holds the typed section array exactly as authored in
-- design5/.../post-content.jsx; admins can edit it from /admin/articles
-- (the JSON editor) or from /admin/content-cms.
-- ON CONFLICT (slug) DO NOTHING — admin edits survive re-apply.

insert into public.articles (
  slug, title, category, excerpt, body, published, published_at,
  deck, author, author_role, read_minutes, accent, body_json, related
) values
-- 1
(
  'q1-market-report',
  'Q1 2026 SMA Market Report: ADR climbs 8.2% as inventory tightens 4.2%',
  'Market Report',
  'The first quarter delivered the tightest inventory we have seen in three years.',
  null, true, '2026-04-18T00:00:00Z',
  'The first quarter delivered the tightest inventory we have seen in three years, but ADR resilience kept gross yields steady at 9.2%. Here is what the numbers say — and what they do not.',
  'Justin Vargas', 'Founder, LRM', 12, '#1F3A2E',
  '[
    {"kind":"h2","text":"The headline numbers"},
    {"kind":"p","text":"Across the 312 properties LRM tracks in central San Miguel, weighted average daily rate rose to $418 — up 8.2% year-over-year, well above general Mexican inflation of 4.1%. Occupancy held at 62.4% (+3.1 pts), driven primarily by an 11.8% increase in international visitor arrivals at BJX (Bajío International)."},
    {"kind":"stats","items":[
      {"val":"$418","label":"Centro ADR","delta":"+8.2% YoY"},
      {"val":"62.4%","label":"SMA occupancy","delta":"+3.1 pts"},
      {"val":"–4.2%","label":"Inventory change","delta":"tightening"},
      {"val":"9.2%","label":"Gross yield","delta":"+0.4 pts"}
    ]},
    {"kind":"h2","text":"Inventory: the squeeze is real"},
    {"kind":"p","text":"Active short-term rental supply contracted 4.2% in the quarter — the steepest decline since Q4 2022. Two forces are at work. First, tourism-permit enforcement in Centro removed roughly 180 unlicensed listings. Second, several institutional buyers have begun converting STR portfolios to long-term lets in anticipation of regulatory changes. Net effect: the same demand chasing fewer beds."},
    {"kind":"h2","text":"Where the upside is concentrated"},
    {"kind":"p","text":"Centro and Atascadero captured nearly all the ADR growth. San Antonio posted only +2.1%, and Guadiana was flat. If you are buying for yield, the geographic concentration matters: a Centro 3BR averaged $418/night vs $294 for the same footprint in San Antonio."},
    {"kind":"callout","tone":"sand","text":"A small Centro property at $418 ADR will outperform a larger San Antonio property at $294 — even after accounting for the price-per-sqm premium. We model this for every memo we write."},
    {"kind":"h2","text":"What the numbers do not say"},
    {"kind":"p","text":"Three caveats worth flagging. (1) Wedding-season ADR is widening — Nov-Mar peaks now command a 32% premium over shoulder months, up from 26% in 2024. (2) Property-tax reassessments hit several Centro blocks in February; budget +12-18% on prediales. (3) The 2027 STR cap conversation in Congreso del Estado is still unresolved."},
    {"kind":"h2","text":"The bottom line"},
    {"kind":"p","text":"Q1 confirms the thesis: SMA is supply-constrained, demand-resilient, and pricing in real-dollar terms. We expect ADR growth to moderate to 5-6% in Q2-Q3 (seasonal) before reaccelerating into wedding season. If you are underwriting deals, model 6% ADR growth and 60% occupancy as your base case."}
  ]'::jsonb,
  '["neighborhoods-ranked","wedding-season-adr","casa-aldama-y1"]'::jsonb
),
-- 2
(
  'fideicomiso-vs-corp',
  'Fideicomiso vs. Mexican corporation: what we recommend for SMA buyers',
  'Buyer Education',
  'For 90% of foreign buyers in San Miguel, the fideicomiso is the right structure.',
  null, true, '2026-04-11T00:00:00Z',
  'For 90% of foreign buyers in San Miguel, the fideicomiso is the right structure. For the other 10% — usually buyers acquiring multiple properties or planning commercial use — a Mexican corporation is materially better. Here is the decision framework.',
  'Justin Vargas', 'Founder, LRM', 9, '#B08A3E',
  '[
    {"kind":"h2","text":"Why this matters"},
    {"kind":"p","text":"San Miguel sits inside the restricted zone (within 100km of any border, 50km of any coast), so foreign nationals cannot hold direct title. You hold property either through a fideicomiso (a 50-year renewable bank trust) or through a Mexican corporation that you control. The choice has real consequences for cost, taxes, exit flexibility, and reporting."},
    {"kind":"h2","text":"Fideicomiso: the default"},
    {"kind":"p","text":"A fideicomiso is a trust agreement with a Mexican bank as trustee. You are the beneficiary; you have full use, sale, and inheritance rights. Setup runs $1,800-$2,500 USD; annual maintenance is $550-$750. Permits expire after 50 years but renew indefinitely with no real obstacle."},
    {"kind":"h2","text":"Corporation: when it makes sense"},
    {"kind":"p","text":"A Sociedad Anónima de Capital Variable (SA de CV) lets you hold property directly with no trustee. Better for: portfolios of 3+ properties, properties used commercially (full-time STR is a grey area), or buyers planning to operate other Mexican businesses. Worse for: simple second-home buyers, who pay more in annual accounting and corporate taxes than they save."},
    {"kind":"callout","tone":"green","text":"Our rule of thumb: under $1.5M and a single property — fideicomiso. Over $2M or 3+ properties — corporation. Between those, it depends on tax residency and exit horizon."},
    {"kind":"h2","text":"The tax delta nobody talks about"},
    {"kind":"p","text":"On exit, fideicomiso sales are taxed at the personal capital gains rate (25-35% federal, with the 700,000 UDI primary residence exemption). Corporate sales are taxed at the 30% corporate rate but the corporation can deduct depreciation, repairs, and operating losses from the gain. For high-income properties, the corporate route can save 8-12% of net proceeds — but only if you have been depreciating properly the whole time."},
    {"kind":"h2","text":"What we do for clients"},
    {"kind":"p","text":"We refer to two notarios in SMA and two tax attorneys depending on structure. We do not earn referral fees on either. Most clients close on a fideicomiso in 6-8 weeks; corporate setups add 3-4 weeks for SAT registration."}
  ]'::jsonb,
  '["closing-timeline","iva-isr-cap-gains","q1-market-report"]'::jsonb
),
-- 3
(
  'casa-aldama-y1',
  'Casa Aldama: $312K gross in year one — the full breakdown',
  'Case Study',
  'A 3BR colonial on Calle Aldama, acquired October 2024 for $1.06M.',
  null, true, '2026-04-04T00:00:00Z',
  'A 3BR colonial on Calle Aldama, acquired October 2024 for $1.06M. We are publishing the full year-one P&L, occupancy month-by-month, and the four operational decisions that drove the result.',
  'LRM Operations', null, 11, '#2A2722',
  '[
    {"kind":"h2","text":"The acquisition"},
    {"kind":"p","text":"Casa Aldama came to us off-market through a notario relationship. Closed at $1,062,500 against an asking of $1,150,000, with $48,000 of immediate furnishing and finish work. The thesis: Centro location, 3BR (the highest-yielding configuration in our data), and a private outdoor space — the three filters that make wedding-season pricing achievable."},
    {"kind":"stats","items":[
      {"val":"$1.06M","label":"All-in basis","delta":"incl. $48K capex"},
      {"val":"$312K","label":"Year-one gross","delta":"247 nights booked"},
      {"val":"68.4%","label":"Occupancy Y1","delta":"vs 62.4% market"},
      {"val":"8.7%","label":"Net yield Y1","delta":"after all expenses"}
    ]},
    {"kind":"h2","text":"Month-by-month occupancy"},
    {"kind":"p","text":"November and December delivered the result. Both months ran above 92% occupancy at peak ADR ($612 average). January was strong on the strength of two weddings booking the full property. The shoulder months (May-Sep) ran 48-58% — below market average — and we will look at why."},
    {"kind":"h2","text":"Four decisions that mattered"},
    {"kind":"p","text":"(1) We launched on Booking.com and Airbnb on the same day, three months before any peak booking — this seeded enough reviews to compete during shoulder season. (2) We priced 8% above the same-block comp set in October-November and 6% below from June-September. (3) We added a private chef partnership with a local cook for groups of 6+ — added $1,400 per booking on average. (4) We rejected three booking requests in February that asked us to host bachelorette parties; preserving the listing reputation was worth more than $9K of revenue."},
    {"kind":"callout","tone":"sand","text":"The headline number is gross. After management fees (LRM at 18%), property tax, utilities, supplies, and the amortized capex, net yield was 8.7% on basis — strong, but below the 9.2% you see quoted in market reports."},
    {"kind":"h2","text":"What we would do differently"},
    {"kind":"p","text":"Two things. First, we underspent on photography — the Y1 listing used phone shots from the prior owner. The professional reshoot in March lifted booking conversion ~14%. Second, we should have launched the dynamic-pricing layer in month one rather than month four. The Y1 number leaves $30-40K of revenue on the table."}
  ]'::jsonb,
  '["atascadero-3yr-pl","how-owners-use-homes","q1-market-report"]'::jsonb
),
-- 4
(
  'iva-isr-cap-gains',
  'IVA, ISR, and the 4% capital gains threshold every SMA owner should know',
  'Tax & Ownership',
  'Mexican tax law for foreign property owners is less complicated than it looks — but the cost of ignoring it is high.',
  null, true, '2026-03-28T00:00:00Z',
  'Mexican tax law for foreign property owners is less complicated than it looks — but the cost of ignoring it is high. Three things matter: IVA on rental income, ISR withholding, and the capital gains math at exit.',
  'Justin Vargas', 'Founder, LRM', 14, '#1F3A2E',
  '[
    {"kind":"h2","text":"IVA on rental income"},
    {"kind":"p","text":"Rental income from a furnished property is subject to 16% IVA (value-added tax). If you rent unfurnished and primarily for residential use, IVA does not apply. For STR/vacation rentals, you collect 16% from guests and remit it monthly to SAT. Booking.com and Airbnb withhold and remit on your behalf — but only if you have given them your RFC (tax ID)."},
    {"kind":"h2","text":"ISR (income tax)"},
    {"kind":"p","text":"Foreign owners pay either 25% on gross rental income (no deductions) or sign up for the optional regime that allows deductions and applies the standard income-tax brackets. For most STR operators, the optional regime is materially better: 18-22% effective on net is common after deducting management fees, depreciation, and operating costs."},
    {"kind":"callout","tone":"green","text":"The single most expensive mistake foreign owners make: not registering for an RFC, then paying 25% gross withholding for years. Set up the RFC in week one. It costs nothing."},
    {"kind":"h2","text":"Capital gains at exit"},
    {"kind":"p","text":"Mexican capital gains is calculated on the difference between deed value at acquisition and deed value at sale, indexed to inflation (the INPC factor). For non-residents, the rate is 25% on gross or 35% on the gain — taxpayer elects which. For tax residents (you spent 183+ days in Mexico in the year), the personal-residence exemption can shield up to ~$700,000 USD of gain."},
    {"kind":"h2","text":"The 4% you have probably heard about"},
    {"kind":"p","text":"There is a notario-applied flat rate of 4% on gross sale price that some buyers and sellers default to. It is a withholding for ISR, not the final tax. You can either accept it (simplest, sometimes overpays) or file a return claiming actual gain (more paperwork, sometimes refunds you 2-3% of sale price). For sales over $500K, almost always worth filing."},
    {"kind":"h2","text":"What we recommend"},
    {"kind":"p","text":"We refer all clients to one of two SMA-based fiscal accountants. Setup is roughly $400 USD; ongoing monthly bookkeeping plus monthly IVA/ISR filings runs $180-$240. That is the right number to budget. Self-filing across borders is a recipe for missed deadlines and SAT audits."}
  ]'::jsonb,
  '["fideicomiso-vs-corp","closing-timeline"]'::jsonb
),
-- 5
(
  'neighborhoods-ranked',
  'The 6 SMA neighborhoods, ranked by gross rental yield (2026 edition)',
  'Investment Guide',
  'We track ADR, occupancy, and price-per-square-meter across six SMA neighborhoods every quarter.',
  null, true, '2026-03-21T00:00:00Z',
  'We track ADR, occupancy, and price-per-square-meter across six SMA neighborhoods every quarter. Here is the 2026 ranking, with the trade-offs each one represents.',
  'LRM Acquisitions', null, 8, '#C9A55A',
  '[
    {"kind":"h2","text":"Methodology"},
    {"kind":"p","text":"Yield = (ADR × occupancy × 365) / acquisition price, gross of management. Numbers are LRM portfolio data + AirDNA market data, weighted by listing count. n=312 LRM properties, n=2,847 AirDNA market."},
    {"kind":"stats","items":[
      {"val":"#1","label":"Centro","delta":"9.8% gross yield"},
      {"val":"#2","label":"Atascadero","delta":"9.1% gross yield"},
      {"val":"#3","label":"Guadiana","delta":"8.4% gross yield"},
      {"val":"#4","label":"San Antonio","delta":"7.9% gross yield"}
    ]},
    {"kind":"h2","text":"Centro: the premium that is worth it"},
    {"kind":"p","text":"Centro lots cost 35-45% more per square meter than Atascadero, but ADR is 42% higher and occupancy is 8 points higher. Net yield comes out ahead. Caveat: Centro inventory has tightened most aggressively, so you are paying tomorrow''s prices today."},
    {"kind":"h2","text":"Atascadero: the value play"},
    {"kind":"p","text":"Mostly larger lots, mostly newer construction. Better for 4BR+ properties hosting families. Lower ADR but higher absolute revenue per door, and meaningfully cheaper basis. Our highest-volume acquisition area."},
    {"kind":"h2","text":"San Antonio and Guadiana: situational"},
    {"kind":"p","text":"Both work for specific theses (long-term rentals, residency-focused buyers, owner-heavy use). Pure-yield buyers should not start here."}
  ]'::jsonb,
  '["casa-aldama-y1","q1-market-report"]'::jsonb
),
-- 6
(
  'how-owners-use-homes',
  'How owners actually use their SMA second home: data from 47 LRM clients',
  'Lifestyle',
  'We surveyed 47 owner-investors about their actual usage patterns.',
  null, true, '2026-03-14T00:00:00Z',
  'We surveyed 47 owner-investors about their actual usage patterns. The answers were not what we expected.',
  'LRM Operations', null, 7, '#3F6B55',
  '[
    {"kind":"h2","text":"The headline finding"},
    {"kind":"p","text":"Owners spend an average of 38 nights per year in their SMA property — far less than the 60-90 nights most underwriting models assume. The result: better STR economics than projected, but more wear and tear from owner stays than expected."},
    {"kind":"h2","text":"When owners actually visit"},
    {"kind":"p","text":"74% of owner stays happen during shoulder seasons (May-October). Owners are smart enough not to block peak revenue weeks. The remaining 26% cluster around major holidays and family events."},
    {"kind":"h2","text":"What this means for underwriting"},
    {"kind":"p","text":"If you are modeling owner blockouts at 60+ nights and assuming peak-season blocking, you are likely understating yield by 6-8%. Use 40 nights, mostly shoulder season, as a more realistic input."}
  ]'::jsonb,
  '["casa-aldama-y1","neighborhoods-ranked"]'::jsonb
),
-- 7
(
  'atascadero-3yr-pl',
  'A $1.2M Atascadero buy: 3-year P&L from acquisition to stabilization',
  'Case Study',
  'Three years of full P&L on a $1.2M Atascadero acquisition.',
  null, true, '2026-03-07T00:00:00Z',
  'Three years of full P&L on a $1.2M Atascadero acquisition — including the rough Year 1 we do not usually publicize.',
  'LRM Operations', null, 13, '#B08A3E',
  '[
    {"kind":"h2","text":"Why we are publishing this"},
    {"kind":"p","text":"Most case studies show the wins. This one ran a Year-1 net yield of 4.2% — well below pro forma. We want to show what happens when launch goes wrong, and how Year-2/3 recovered."},
    {"kind":"stats","items":[
      {"val":"4.2%","label":"Y1 net yield","delta":"below 7% pro forma"},
      {"val":"8.1%","label":"Y2 net yield","delta":"after operational fixes"},
      {"val":"9.6%","label":"Y3 net yield","delta":"stabilized"},
      {"val":"$1.20M","label":"Acquisition basis","delta":"4BR Atascadero"}
    ]},
    {"kind":"h2","text":"What went wrong in Year 1"},
    {"kind":"p","text":"Three issues. The previous owner''s WiFi setup was not fit for working remote (60% of Atascadero guests work remotely). The pool maintenance contract was inadequate; we had two outages in peak season costing $11K in refunds. And the original photography emphasized the views but missed the kitchen and outdoor spaces guests actually search for."},
    {"kind":"h2","text":"The fixes"},
    {"kind":"p","text":"Fiber install ($2,400 capex), new pool service ($340/mo vs $180/mo), professional reshoot ($1,800). Total Y2 capex: $5,800. Net yield delta: $32K incremental revenue. Six-month payback."},
    {"kind":"h2","text":"The lesson"},
    {"kind":"p","text":"Year 1 underperformance is recoverable if you diagnose fast. The mistake is to assume the model was wrong; usually it is the operations."}
  ]'::jsonb,
  '["casa-aldama-y1","q1-market-report"]'::jsonb
),
-- 8
(
  'wedding-season-adr',
  'Why the wedding-season ADR premium is widening (and what to do)',
  'Market Report',
  'The Nov-Mar premium over shoulder months is now 32%, up from 26% in 2024.',
  null, true, '2026-02-28T00:00:00Z',
  'The Nov-Mar premium over shoulder months is now 32%, up from 26% in 2024. Three drivers, three actions.',
  'LRM Acquisitions', null, 6, '#1F3A2E',
  '[
    {"kind":"h2","text":"The data"},
    {"kind":"p","text":"Across our 312-property panel, peak ADR (Nov-Mar weighted) is now 32% above shoulder ADR (May-Sep weighted). In 2024 the gap was 26%. In 2022, it was 19%."},
    {"kind":"h2","text":"Why"},
    {"kind":"p","text":"Destination weddings have grown ~14% YoY in SMA. Inventory has tightened. And shoulder-season demand has softened slightly — fewer remote workers extending stays, more shorter weekend trips."},
    {"kind":"h2","text":"What to do"},
    {"kind":"p","text":"If you own: lean harder into peak pricing. Most owners under-price the Nov-Mar window by 8-12%. If you are buying: weight your underwriting toward properties that book well at peak (3-4BR, good outdoor space, walkable) over properties that book steadily."}
  ]'::jsonb,
  '["q1-market-report","neighborhoods-ranked"]'::jsonb
),
-- 9
(
  'closing-timeline',
  'Closing in San Miguel: a step-by-step timeline from offer to handover',
  'Buyer Education',
  'Six to eight weeks, six checkpoints, four parties.',
  null, true, '2026-02-21T00:00:00Z',
  'Six to eight weeks, six checkpoints, four parties. Here is what each one does and where things tend to go sideways.',
  'Justin Vargas', 'Founder, LRM', 10, '#2A2722',
  '[
    {"kind":"h2","text":"The four parties"},
    {"kind":"p","text":"Buyer, seller, notario público, and the trustee bank (if fideicomiso). Real-estate agents in Mexico do not draft contracts — that is the notario''s job. Your agent helps you negotiate; the notario carries legal weight."},
    {"kind":"h2","text":"The six checkpoints"},
    {"kind":"p","text":"(1) Letter of intent + earnest money to escrow — week 1. (2) Title search and tax audit by notario — week 2-3. (3) SRE permit application for fideicomiso — week 3-4. (4) Bank trust setup — week 4-6. (5) Final deed signing at notario — week 6-7. (6) Handover and utilities transfer — week 7-8."},
    {"kind":"h2","text":"Where things go wrong"},
    {"kind":"p","text":"Four common snags: predial (property tax) arrears the seller did not disclose, water-bill surprises, undocumented additions that complicate the title search, and trustee-bank delays around US holidays. Build 2 weeks of slack into the timeline."}
  ]'::jsonb,
  '["fideicomiso-vs-corp","iva-isr-cap-gains"]'::jsonb
)
on conflict (slug) do nothing;
