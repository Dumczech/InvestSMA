-- Seeds 5 site_content keys holding the *prose* (headlines, ledes, CTA
-- labels, paragraph copy, bullet lists) for the public pages — homepage,
-- about, contact, insights, and the property memo. Each row matches the
-- prior hardcoded values byte-for-byte so behavior is unchanged at
-- deploy. Admins edit each from /admin/content-cms.
--
-- Headlines that include an italic span are split into `pre` / `italic`
-- / `post` strings so the typography is preserved when admins edit.
--
-- ON CONFLICT DO NOTHING preserves any existing admin edits on re-apply.

insert into public.site_content (key, value)
values
-- 1. Homepage prose
(
  'homepage_copy',
  '{
    "hero_eyebrow": "San Miguel de Allende · Vol. 04 · Q1 2026",
    "hero_headline_pre": "Invest in San Miguel''s most",
    "hero_headline_italic": "desirable luxury rental",
    "hero_headline_post": " market.",
    "hero_paragraph": "Real ADR data. Turnkey LRM management. Income-producing second homes underwritten with the rigor of an institutional fund — not a brokerage pitch.",
    "hero_cta_primary_label": "See Featured Opportunities →",
    "hero_cta_primary_href": "/properties",
    "hero_cta_secondary_label": "Calculate Your ROI",
    "hero_cta_secondary_href": "/roi-calculator",
    "hero_card_eyebrow": "Q1 2026 · Snapshot",
    "hero_card_updated": "Updated 04·28",
    "hero_card_stats": [
      {"l":"Avg occupancy","v":"62.4%","d":"+3.1","up":true},
      {"l":"Centro ADR","v":"$418","d":"+8.2%","up":true},
      {"l":"YoY visitors","v":"+11.8%","d":"↑","up":true},
      {"l":"Gross yield","v":"9.2%","d":"+0.4","up":true}
    ],
    "hero_card_footer": "Aggregated across 312 LRM-managed and tracked properties in Q1.",
    "credibility_eyebrow": "02 · Track Record",
    "credibility_title_pre": "The data behind ",
    "credibility_title_italic": "every",
    "credibility_title_post": " investment memo.",
    "featured_eyebrow": "03 · Active Opportunities",
    "featured_title_pre": "Underwritten,",
    "featured_title_italic": "turnkey-ready.",
    "featured_lede": "Off-market and selectively-listed properties with full investment memos, ADR projections, and a defined upgrade thesis. We turn down ~40 properties for every one we accept onto the platform.",
    "featured_footnote": "+3 more on the platform · 14 off-market deals available with investor access",
    "featured_cta_label": "All Properties →",
    "market_eyebrow": "04 · Market Intelligence",
    "market_title_pre": "Proprietary data,",
    "market_title_italic": "not realtor lore.",
    "market_lede": "We track ADR, occupancy, and seasonal demand across 312 properties in San Miguel — the only dataset of its kind. A summary view below; the full report ships to verified investors.",
    "market_source": "Source: LRM proprietary index · n=312 · Q1 2024 — Q1 2026",
    "market_cta_label": "Full Market Dashboard →",
    "nbhd_chart_label": "Fig. 02 · Neighborhoods",
    "nbhd_chart_title": "ADR by district",
    "legend_peak": "PEAK · NOV–MAR",
    "legend_shoulder": "SHOULDER · APR–OCT",
    "video_eyebrow": "05 · Video Library",
    "video_title_pre": "Watch the",
    "video_title_italic": "homework.",
    "video_lede": "Quarterly market updates, full property tours, and operator-series interviews. We publish what we see on the ground — not curated marketing.",
    "insights_eyebrow": "07 · Latest insights",
    "insights_title": "From the desk.",
    "insights_cta_label": "All insights →",
    "lead_eyebrow": "06 · Investor Access",
    "lead_title_pre": "The full underwriting",
    "lead_title_italic": "is gated.",
    "lead_paragraph": "Verified investors receive: full Q1 2026 market report (52 pages), off-market property memos, ROI underwriting models, and a direct line to our acquisition team.",
    "lead_benefits": [
      "Q1 2026 SMA Market Report (52pp)",
      "14 off-market property memos",
      "Quarterly investor briefing call",
      "Direct line to LRM acquisitions"
    ],
    "lead_form_eyebrow": "Request Investor Access",
    "lead_form_cta_label": "Open the full form →",
    "lead_form_footnote": "Reviewed within 24h · Not all applicants qualified"
  }'::jsonb
),
-- 2. About page prose
(
  'about_copy',
  '{
    "topbar": ["§ About InvestSMA", "Operators · not brokers", "Est. via Luxury Rental Mgmt"],
    "hero_eyebrow": "About · 01",
    "hero_headline_pre": "We don''t help you\nbuy property.\n",
    "hero_headline_italic": "We help you build a performing asset.",
    "hero_paragraph": "Most opportunities in San Miguel look good on paper. Few are structured, positioned, and operated in a way that delivers what investors expect. That gap — between a clean acquisition and a performing asset — is what we close.",
    "positioning_eyebrow": "02 · Positioning",
    "positioning_title_pre": "What we ",
    "positioning_title_italic": "are",
    "positioning_title_post": " and aren''t.",
    "are_not_label": "WE ARE NOT",
    "are_label": "WE ARE",
    "stack_eyebrow": "03 · Operations stack",
    "stack_title_pre": "Four phases.",
    "stack_title_italic": "One operator.",
    "stack_lede": "From acquisition to exit, the same team — and the same data — runs every phase. That''s how we keep the projection-to-reality variance below 8%.",
    "closing_eyebrow": "04 · Next step",
    "closing_title_pre": "The portfolio is small\n",
    "closing_title_italic": "by design.",
    "closing_paragraph": "We add roughly one investor per quarter. Tell us what you''re looking for and we''ll respond within 24 hours.",
    "closing_cta_apply_label": "Apply for access →",
    "closing_cta_read_label": "Read our notes"
  }'::jsonb
),
-- 3. Contact page prose
(
  'contact_copy',
  '{
    "hero_eyebrow": "Investor Access · Application",
    "hero_headline_pre": "Apply for",
    "hero_headline_italic": "investor access.",
    "hero_paragraph": "We work with a limited number of investors per quarter. Tell us about your goals — we''ll respond within 24 hours.",
    "hero_stats": [
      {"v":"24h","l":"Avg response"},
      {"v":"47","l":"Active investors"},
      {"v":"$2.4B","l":"AUM"}
    ],
    "step_1_eyebrow": "Step 01 of 03",
    "step_1_title": "Tell us who you are.",
    "step_1_label_name": "Full name",
    "step_1_label_email": "Email",
    "step_1_label_phone": "Phone",
    "step_2_eyebrow": "Step 02 of 03",
    "step_2_title": "Investment profile.",
    "step_2_label_budget": "Budget range",
    "step_2_label_timeline": "Buying timeline",
    "step_3_eyebrow": "Step 03 of 03",
    "step_3_title": "What are you looking for?",
    "step_3_label_interests": "Interests · select all",
    "step_3_label_message": "Anything else? (optional)",
    "step_3_message_placeholder": "Specific neighborhoods, must-have features, or context we should know...",
    "submit_label": "Request Investor Access →",
    "submit_footnote": "Reviewed within 24h · No broker referrals · Discretion guaranteed",
    "trust_signals": [
      {"t":"No broker referrals","d":"Your information stays with the LRM acquisition team. We never sell or share leads."},
      {"t":"24-hour response","d":"A real human responds within one business day. Not a drip sequence."},
      {"t":"Off-market access","d":"Verified investors see 14 properties not listed on the public catalog."}
    ],
    "submitted_title": "Application received.",
    "submitted_paragraph": "Our acquisition team will review and respond within 24 hours. Check your inbox for next steps.",
    "submitted_cta_browse_label": "Browse Properties",
    "submitted_cta_market_label": "See Market Data"
  }'::jsonb
),
-- 4. Insights page prose
(
  'insights_copy',
  '{
    "hero_eyebrow": "Field Notes",
    "hero_headline_pre": "Insights",
    "hero_headline_italic": "from the field.",
    "hero_paragraph": "Quarterly market reports, buyer education, tax guidance, case studies. Written by the LRM acquisition team — published every two weeks.",
    "subscribe_placeholder": "your@email.com",
    "subscribe_label": "Subscribe →",
    "featured_label": "Featured this week",
    "empty_state": "No published insights yet — apply the seed migration to surface 9 designed posts.",
    "gated_eyebrow": "Gated · Free",
    "gated_title_pre": "The 52-page Q1",
    "gated_title_italic": "SMA Market Report.",
    "gated_paragraph": "Full neighborhood-by-neighborhood ADR breakdown, transaction comps, regulatory outlook, and a 2027 forecast. Sent as PDF.",
    "gated_cta_label": "Download Free →"
  }'::jsonb
),
-- 5. Property memo prose (per-section labels and prose)
(
  'memo_copy',
  '{
    "topbar_back_label": "← All Properties",
    "topbar_center_label": "Underwriting Package · By Request",
    "deal_terms_eyebrow": "Deal terms",
    "deal_cta_label": "Request full underwriting →",
    "deal_cta_footnote": "RETURNS WITHIN 48 HRS · 12-PAGE PDF · NDA-PROTECTED",
    "thesis_title": "Investment thesis",
    "thesis_subtitle": "Four reasons we accepted this onto the platform.",
    "revenue_title": "Revenue assumptions",
    "revenue_subtitle": "Underwritten at base case. Bull and bear scenarios in full model.",
    "seasonal_title": "Seasonal revenue opportunity",
    "seasonal_subtitle": "Four windows where SMA ADR routinely exceeds $600 and occupancy clears 85%.",
    "seasonal_cols": ["Window", "Dates", "Peak ADR", "Occupancy", "Notes"],
    "upgrades_title": "Recommended upgrades",
    "upgrades_summary_label": "Upgrade summary",
    "upgrades_summary_caption": "Total recommended capex",
    "upgrades_lift_label": "ADR uplift (Y2)",
    "upgrades_lift_value": "+$88 / night",
    "upgrades_payback_label": "Blended payback",
    "upgrades_payback_value": "1.8 years",
    "management_title": "LRM management strategy",
    "management_subtitle": "The four-phase operator playbook applied to every property on the platform.",
    "risks_title": "Risks & considerations",
    "risks_subtitle": "What could go wrong, and how we''ve underwritten around it.",
    "comps_title": "Comparable transactions",
    "comps_subtitle": "Five trades within 1 km, last 12 months. First three shown — full set with addresses, brokers, and seller motivation in the gated package.",
    "comps_gated_label": "Gated · 2 of 5 trades",
    "comps_gated_caption": "Off-market trades disclosed in the full underwriting package.",
    "comps_unlock_label": "Unlock comp set →",
    "cta_topbar_label": "§ Request the full underwriting package",
    "cta_topbar_response": "Avg response · 36 hrs",
    "cta_headline_pre": "You''ve seen the\nsummary.\nNow see the model.",
    "cta_headline_italic": "Now see the model.",
    "cta_paragraph": "The page above is a teaser — sized for diligence, not for closing. The full package goes line-by-line through assumptions, comps, capex, structure, and tax. We send it within 48 hours after a 10-minute qualification call.",
    "cta_steps": [
      {"n":"01","t":"Request","d":"Form below · 2 min"},
      {"n":"02","t":"Qualify","d":"10-min intro call"},
      {"n":"03","t":"Receive","d":"Full package · 48 hrs"}
    ],
    "cta_compare_label": "Compare other listings",
    "cta_footnote": "NDA-PROTECTED · ACCREDITED INVESTORS · NO COST TO RECEIVE",
    "cta_shown_label": "Public preview",
    "cta_gated_label": "Gated",
    "cta_shown": [
      "Investment thesis (4-bullet summary)",
      "Revenue range, occupancy, base-case Y2 gross",
      "Seasonality curve (12-month chart)",
      "Capex thesis + estimated upgrade budget",
      "3 of 5 comparable trades"
    ],
    "cta_gated": [
      "Full Excel model · base / bull / bear with sensitivity",
      "All 5 comps with addresses, brokers, seller motivation",
      "Capex schedule with vendor quotes (line-item, not estimate)",
      "Property condition report + structural assessment",
      "Title search + ejido / fideicomiso review notes",
      "Tax structure recommendation (US + MX)",
      "30-min call with LRM acquisition lead"
    ]
  }'::jsonb
)
on conflict (key) do nothing;
