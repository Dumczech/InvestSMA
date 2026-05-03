// Schema-driven editing for site_content keys. Each known key declares
// a list of FieldSpecs describing its JSON shape; SchemaForm walks the
// list and renders an appropriate input per leaf. Unknown keys still
// fall back to the raw-JSON textarea in ContentCmsClient.

export type FieldSpec =
  | { kind: 'string'; key: string; label: string; hint?: string; placeholder?: string }
  | { kind: 'text'; key: string; label: string; hint?: string; placeholder?: string; rows?: number }
  | { kind: 'number'; key: string; label: string; hint?: string }
  | { kind: 'boolean'; key: string; label: string; hint?: string }
  | { kind: 'array<string>'; key: string; label: string; hint?: string; itemLabel?: string }
  | { kind: 'array<number>'; key: string; label: string; hint?: string; itemLabel?: string }
  | { kind: 'array<object>'; key: string; label: string; hint?: string; itemFields: FieldSpec[]; itemTitleKey?: string; itemLabel?: string }
  | { kind: 'object'; key: string; label: string; fields: FieldSpec[] };

// Build an empty default object from a FieldSpec[] — used when the
// admin clicks a template button for a key that doesn't yet exist.
export function defaultsFromSchema(fields: FieldSpec[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.kind) {
      case 'string':
      case 'text':
        out[f.key] = '';
        break;
      case 'number':
        out[f.key] = 0;
        break;
      case 'boolean':
        out[f.key] = false;
        break;
      case 'array<string>':
        out[f.key] = [''];
        break;
      case 'array<number>':
        out[f.key] = [0];
        break;
      case 'array<object>':
        out[f.key] = [defaultsFromSchema(f.itemFields)];
        break;
      case 'object':
        out[f.key] = defaultsFromSchema(f.fields);
        break;
    }
  }
  return out;
}

// ============================================================
// Re-usable item field sets
// ============================================================

const STAT_VL: FieldSpec[] = [
  { kind: 'string', key: 'v', label: 'Value', placeholder: '11' },
  { kind: 'string', key: 'l', label: 'Label', placeholder: 'Years operating SMA' },
];

const TITLE_DESC: FieldSpec[] = [
  { kind: 'string', key: 't', label: 'Title' },
  { kind: 'text', key: 'd', label: 'Description', rows: 3 },
];

// ============================================================
// Schemas — keyed by site_content.key
// ============================================================

export const KEY_SCHEMAS: Record<string, FieldSpec[]> = {
  // ---------- editorial data ----------

  homepage_hero_image: [
    { kind: 'string', key: 'url', label: 'Image URL', hint: 'Full https URL to a hero image (1600w+ recommended)' },
  ],

  homepage_credibility: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Stats',
      hint: 'Track Record stats shown after the homepage hero (4 recommended)',
      itemTitleKey: 'num',
      itemFields: [
        { kind: 'string', key: 'num', label: 'Number', placeholder: '312' },
        { kind: 'text', key: 'label', label: 'Label', hint: 'Use \\n for line breaks', rows: 2 },
      ],
    },
  ],

  homepage_videos: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Video tiles',
      hint: 'Homepage Video Library (3 recommended)',
      itemTitleKey: 'title',
      itemFields: [
        { kind: 'string', key: 'id', label: 'ID', placeholder: 'v1' },
        { kind: 'string', key: 'title', label: 'Title' },
        { kind: 'string', key: 'dur', label: 'Duration', placeholder: '8:42' },
        { kind: 'string', key: 'img', label: 'Thumbnail URL' },
        { kind: 'string', key: 'cat', label: 'Category', placeholder: 'Market Update' },
      ],
    },
  ],

  homepage_occupancy_chart: [
    { kind: 'string', key: 'fig_label', label: 'Figure label', placeholder: 'Fig. 01 · Seasonal Occupancy' },
    { kind: 'string', key: 'title', label: 'Chart title' },
    { kind: 'string', key: 'annual_avg', label: 'Annual average', placeholder: '62.4%' },
    { kind: 'array<string>', key: 'months', label: 'Month labels', hint: '12 single-letter labels' },
    { kind: 'array<number>', key: 'data', label: 'Occupancy values', hint: '12 numbers (0-100)' },
  ],

  homepage_nbhd_comparison: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Neighborhoods',
      itemTitleKey: 'name',
      itemFields: [
        { kind: 'string', key: 'name', label: 'Name', placeholder: 'Centro Histórico' },
        { kind: 'number', key: 'adr', label: 'ADR ($)', hint: 'Avg daily rate' },
        { kind: 'number', key: 'yield', label: 'Yield (%)' },
      ],
    },
  ],

  ticker_items: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Ticker items',
      hint: 'Bloomberg-style top marquee (all pages)',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'label', label: 'Label', placeholder: 'SMA·OCC' },
        { kind: 'string', key: 'val', label: 'Value', placeholder: '62.4%' },
        { kind: 'string', key: 'delta', label: 'Delta', placeholder: '+3.1%' },
        { kind: 'boolean', key: 'up', label: 'Trending up?' },
      ],
    },
  ],

  nav_pages: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Nav links',
      hint: 'Top navigation (all pages). The "id" is also used to highlight the active link.',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'id', label: 'ID', placeholder: 'home' },
        { kind: 'string', key: 'label', label: 'Label', placeholder: 'Home' },
        { kind: 'string', key: 'href', label: 'Path', placeholder: '/' },
      ],
    },
  ],

  footer_config: [
    { kind: 'text', key: 'tagline', label: 'Tagline (long)', rows: 3 },
    { kind: 'array<string>', key: 'chips', label: 'Brand chips', hint: 'e.g. Operator-led, Real Data' },
    {
      kind: 'array<object>',
      key: 'explore',
      label: 'Explore links',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'label', label: 'Label' },
        { kind: 'string', key: 'href', label: 'Href', hint: 'Internal path or full URL' },
      ],
    },
    {
      kind: 'array<object>',
      key: 'resources',
      label: 'Resources links',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'label', label: 'Label' },
        { kind: 'string', key: 'href', label: 'Href' },
      ],
    },
    {
      kind: 'array<object>',
      key: 'contact',
      label: 'Contact links',
      hint: 'Leave href empty for plain text (e.g. address line)',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'label', label: 'Label' },
        { kind: 'string', key: 'href', label: 'Href (optional)', hint: 'Use mailto:/tel: for contact info' },
      ],
    },
    { kind: 'string', key: 'copyright', label: 'Copyright line' },
    { kind: 'string', key: 'tagline_short', label: 'Footer note (short)' },
  ],

  about_page: [
    {
      kind: 'array<object>',
      key: 'stats',
      label: 'Hero stats',
      itemTitleKey: 'l',
      itemFields: STAT_VL,
    },
    {
      kind: 'array<object>',
      key: 'are_not',
      label: '"We are not" items',
      itemTitleKey: 't',
      itemFields: TITLE_DESC,
    },
    {
      kind: 'array<object>',
      key: 'are',
      label: '"We are" items',
      itemTitleKey: 't',
      itemFields: TITLE_DESC,
    },
    {
      kind: 'array<object>',
      key: 'stack',
      label: 'Operations stack phases',
      itemTitleKey: 'phase',
      itemFields: [
        { kind: 'string', key: 'phase', label: 'Phase name', placeholder: 'Acquisition' },
        { kind: 'array<string>', key: 'items', label: 'Bullets' },
      ],
    },
  ],

  contact_form_options: [
    { kind: 'array<string>', key: 'interests', label: 'Interest options', hint: 'Step 03 multi-select' },
    { kind: 'array<string>', key: 'budgets', label: 'Budget tiers', hint: 'Step 02 buttons' },
    { kind: 'array<string>', key: 'timelines', label: 'Timeline options', hint: 'Step 02 buttons' },
  ],

  insights_categories: [
    {
      kind: 'array<object>',
      key: 'items',
      label: 'Categories',
      hint: 'Future filter chips on /insights',
      itemTitleKey: 'label',
      itemFields: [
        { kind: 'string', key: 'id', label: 'ID', placeholder: 'market' },
        { kind: 'string', key: 'label', label: 'Label', placeholder: 'Market Reports' },
        { kind: 'string', key: 'matches', label: 'Matches category (optional)', hint: 'Article category to filter by, or leave blank for "all"' },
      ],
    },
  ],

  memo_editorial: [
    { kind: 'array<string>', key: 'monthly_labels', label: 'Month labels', hint: '12 strings, e.g. JAN, FEB, ...' },
    { kind: 'array<number>', key: 'seasonality', label: 'Seasonality (occ %)', hint: '12 numbers (0-100)' },
    { kind: 'array<number>', key: 'adr_factor', label: 'ADR factor by month', hint: '12 numbers (multiplier vs base, e.g. 1.2)' },
    {
      kind: 'array<object>',
      key: 'thesis',
      label: 'Investment thesis points',
      hint: 'Use {neighborhood} token to substitute the property neighborhood',
      itemTitleKey: 't',
      itemFields: TITLE_DESC,
    },
    {
      kind: 'array<object>',
      key: 'upgrades',
      label: 'Recommended upgrades',
      itemTitleKey: 'item',
      itemFields: [
        { kind: 'string', key: 'item', label: 'Upgrade name' },
        { kind: 'number', key: 'cost', label: 'Cost ($)' },
        { kind: 'string', key: 'lift', label: 'Lift', placeholder: '+$48 ADR' },
        { kind: 'string', key: 'payback', label: 'Payback', placeholder: '2.1 yr' },
      ],
    },
    {
      kind: 'array<object>',
      key: 'management',
      label: 'Management phases',
      itemTitleKey: 'phase',
      itemFields: [
        { kind: 'string', key: 'phase', label: 'Phase' },
        { kind: 'array<string>', key: 'items', label: 'Bullets' },
      ],
    },
    {
      kind: 'array<object>',
      key: 'management_stats',
      label: 'Management stats',
      itemTitleKey: 'l',
      itemFields: STAT_VL,
    },
    {
      kind: 'array<object>',
      key: 'risks',
      label: 'Risks',
      itemTitleKey: 't',
      itemFields: TITLE_DESC,
    },
    {
      kind: 'array<object>',
      key: 'seasonal_events',
      label: 'Seasonal events',
      itemTitleKey: 'period',
      itemFields: [
        { kind: 'string', key: 'period', label: 'Period', placeholder: 'Día de Muertos' },
        { kind: 'string', key: 'date', label: 'Dates', placeholder: 'Oct 28 – Nov 4' },
        { kind: 'string', key: 'adr', label: 'Peak ADR', placeholder: '$680' },
        { kind: 'string', key: 'occ', label: 'Occupancy', placeholder: '92%' },
        { kind: 'string', key: 'notes', label: 'Notes' },
      ],
    },
  ],

  // ---------- prose ----------

  homepage_copy: [
    { kind: 'string', key: 'hero_eyebrow', label: 'Hero eyebrow' },
    { kind: 'string', key: 'hero_headline_pre', label: 'Hero headline (pre)' },
    { kind: 'string', key: 'hero_headline_italic', label: 'Hero headline (italic)' },
    { kind: 'string', key: 'hero_headline_post', label: 'Hero headline (post)' },
    { kind: 'text', key: 'hero_paragraph', label: 'Hero paragraph', rows: 3 },
    { kind: 'string', key: 'hero_cta_primary_label', label: 'Primary CTA label' },
    { kind: 'string', key: 'hero_cta_primary_href', label: 'Primary CTA href' },
    { kind: 'string', key: 'hero_cta_secondary_label', label: 'Secondary CTA label' },
    { kind: 'string', key: 'hero_cta_secondary_href', label: 'Secondary CTA href' },
    { kind: 'string', key: 'hero_card_eyebrow', label: 'Hero card eyebrow' },
    { kind: 'string', key: 'hero_card_updated', label: 'Hero card timestamp' },
    {
      kind: 'array<object>',
      key: 'hero_card_stats',
      label: 'Hero card stats',
      itemTitleKey: 'l',
      itemFields: [
        { kind: 'string', key: 'l', label: 'Label' },
        { kind: 'string', key: 'v', label: 'Value' },
        { kind: 'string', key: 'd', label: 'Delta' },
        { kind: 'boolean', key: 'up', label: 'Trending up?' },
      ],
    },
    { kind: 'text', key: 'hero_card_footer', label: 'Hero card footer', rows: 2 },
    { kind: 'string', key: 'credibility_eyebrow', label: 'Credibility eyebrow' },
    { kind: 'string', key: 'credibility_title_pre', label: 'Credibility title (pre)' },
    { kind: 'string', key: 'credibility_title_italic', label: 'Credibility title (italic)' },
    { kind: 'string', key: 'credibility_title_post', label: 'Credibility title (post)' },
    { kind: 'string', key: 'featured_eyebrow', label: 'Featured eyebrow' },
    { kind: 'string', key: 'featured_title_pre', label: 'Featured title (pre)' },
    { kind: 'string', key: 'featured_title_italic', label: 'Featured title (italic)' },
    { kind: 'text', key: 'featured_lede', label: 'Featured lede', rows: 3 },
    { kind: 'string', key: 'featured_footnote', label: 'Featured footnote' },
    { kind: 'string', key: 'featured_cta_label', label: 'Featured CTA label' },
    { kind: 'string', key: 'market_eyebrow', label: 'Market eyebrow' },
    { kind: 'string', key: 'market_title_pre', label: 'Market title (pre)' },
    { kind: 'string', key: 'market_title_italic', label: 'Market title (italic)' },
    { kind: 'text', key: 'market_lede', label: 'Market lede', rows: 3 },
    { kind: 'string', key: 'market_source', label: 'Market source line' },
    { kind: 'string', key: 'market_cta_label', label: 'Market CTA label' },
    { kind: 'string', key: 'nbhd_chart_label', label: 'Neighborhood chart label' },
    { kind: 'string', key: 'nbhd_chart_title', label: 'Neighborhood chart title' },
    { kind: 'string', key: 'legend_peak', label: 'Legend (peak)' },
    { kind: 'string', key: 'legend_shoulder', label: 'Legend (shoulder)' },
    { kind: 'string', key: 'video_eyebrow', label: 'Video eyebrow' },
    { kind: 'string', key: 'video_title_pre', label: 'Video title (pre)' },
    { kind: 'string', key: 'video_title_italic', label: 'Video title (italic)' },
    { kind: 'text', key: 'video_lede', label: 'Video lede', rows: 3 },
    { kind: 'string', key: 'insights_eyebrow', label: 'Insights eyebrow' },
    { kind: 'string', key: 'insights_title', label: 'Insights title' },
    { kind: 'string', key: 'insights_cta_label', label: 'Insights CTA label' },
    { kind: 'string', key: 'lead_eyebrow', label: 'Lead capture eyebrow' },
    { kind: 'string', key: 'lead_title_pre', label: 'Lead title (pre)' },
    { kind: 'string', key: 'lead_title_italic', label: 'Lead title (italic)' },
    { kind: 'text', key: 'lead_paragraph', label: 'Lead paragraph', rows: 3 },
    { kind: 'array<string>', key: 'lead_benefits', label: 'Lead benefits' },
    { kind: 'string', key: 'lead_form_eyebrow', label: 'Lead form eyebrow' },
    { kind: 'string', key: 'lead_form_cta_label', label: 'Lead form CTA label' },
    { kind: 'string', key: 'lead_form_footnote', label: 'Lead form footnote' },
  ],

  about_copy: [
    { kind: 'array<string>', key: 'topbar', label: 'Topbar items', hint: '3 short labels' },
    { kind: 'string', key: 'hero_eyebrow', label: 'Hero eyebrow' },
    { kind: 'text', key: 'hero_headline_pre', label: 'Hero headline (pre)', hint: 'Use \\n for line breaks', rows: 3 },
    { kind: 'string', key: 'hero_headline_italic', label: 'Hero headline (italic)' },
    { kind: 'text', key: 'hero_paragraph', label: 'Hero paragraph', rows: 4 },
    { kind: 'string', key: 'positioning_eyebrow', label: 'Positioning eyebrow' },
    { kind: 'string', key: 'positioning_title_pre', label: 'Positioning title (pre)' },
    { kind: 'string', key: 'positioning_title_italic', label: 'Positioning title (italic)' },
    { kind: 'string', key: 'positioning_title_post', label: 'Positioning title (post)' },
    { kind: 'string', key: 'are_not_label', label: '"We are not" header' },
    { kind: 'string', key: 'are_label', label: '"We are" header' },
    { kind: 'string', key: 'stack_eyebrow', label: 'Stack eyebrow' },
    { kind: 'string', key: 'stack_title_pre', label: 'Stack title (pre)' },
    { kind: 'string', key: 'stack_title_italic', label: 'Stack title (italic)' },
    { kind: 'text', key: 'stack_lede', label: 'Stack lede', rows: 3 },
    { kind: 'string', key: 'closing_eyebrow', label: 'Closing eyebrow' },
    { kind: 'text', key: 'closing_title_pre', label: 'Closing title (pre)', hint: 'Use \\n for line breaks', rows: 2 },
    { kind: 'string', key: 'closing_title_italic', label: 'Closing title (italic)' },
    { kind: 'text', key: 'closing_paragraph', label: 'Closing paragraph', rows: 3 },
    { kind: 'string', key: 'closing_cta_apply_label', label: 'Apply CTA label' },
    { kind: 'string', key: 'closing_cta_read_label', label: 'Read CTA label' },
  ],

  contact_copy: [
    { kind: 'string', key: 'hero_eyebrow', label: 'Hero eyebrow' },
    { kind: 'string', key: 'hero_headline_pre', label: 'Hero headline (pre)' },
    { kind: 'string', key: 'hero_headline_italic', label: 'Hero headline (italic)' },
    { kind: 'text', key: 'hero_paragraph', label: 'Hero paragraph', rows: 3 },
    {
      kind: 'array<object>',
      key: 'hero_stats',
      label: 'Hero stats',
      itemTitleKey: 'l',
      itemFields: STAT_VL,
    },
    { kind: 'string', key: 'step_1_eyebrow', label: 'Step 1 eyebrow' },
    { kind: 'string', key: 'step_1_title', label: 'Step 1 title' },
    { kind: 'string', key: 'step_1_label_name', label: 'Step 1 — Name field label' },
    { kind: 'string', key: 'step_1_label_email', label: 'Step 1 — Email field label' },
    { kind: 'string', key: 'step_1_label_phone', label: 'Step 1 — Phone field label' },
    { kind: 'string', key: 'step_2_eyebrow', label: 'Step 2 eyebrow' },
    { kind: 'string', key: 'step_2_title', label: 'Step 2 title' },
    { kind: 'string', key: 'step_2_label_budget', label: 'Step 2 — Budget label' },
    { kind: 'string', key: 'step_2_label_timeline', label: 'Step 2 — Timeline label' },
    { kind: 'string', key: 'step_3_eyebrow', label: 'Step 3 eyebrow' },
    { kind: 'string', key: 'step_3_title', label: 'Step 3 title' },
    { kind: 'string', key: 'step_3_label_interests', label: 'Step 3 — Interests label' },
    { kind: 'string', key: 'step_3_label_message', label: 'Step 3 — Message label' },
    { kind: 'text', key: 'step_3_message_placeholder', label: 'Step 3 — Message placeholder', rows: 2 },
    { kind: 'string', key: 'submit_label', label: 'Submit button label' },
    { kind: 'text', key: 'submit_footnote', label: 'Submit footnote', rows: 2 },
    {
      kind: 'array<object>',
      key: 'trust_signals',
      label: 'Trust signals (3 cards below form)',
      itemTitleKey: 't',
      itemFields: TITLE_DESC,
    },
    { kind: 'string', key: 'submitted_title', label: 'Success page title' },
    { kind: 'text', key: 'submitted_paragraph', label: 'Success page paragraph', rows: 3 },
    { kind: 'string', key: 'submitted_cta_browse_label', label: 'Success — Browse CTA' },
    { kind: 'string', key: 'submitted_cta_market_label', label: 'Success — Market CTA' },
  ],

  insights_copy: [
    { kind: 'string', key: 'hero_eyebrow', label: 'Hero eyebrow' },
    { kind: 'string', key: 'hero_headline_pre', label: 'Hero headline (pre)' },
    { kind: 'string', key: 'hero_headline_italic', label: 'Hero headline (italic)' },
    { kind: 'text', key: 'hero_paragraph', label: 'Hero paragraph', rows: 3 },
    { kind: 'string', key: 'subscribe_placeholder', label: 'Subscribe input placeholder' },
    { kind: 'string', key: 'subscribe_label', label: 'Subscribe button label' },
    { kind: 'string', key: 'featured_label', label: 'Featured row label' },
    { kind: 'text', key: 'empty_state', label: 'Empty state message', rows: 2 },
    { kind: 'string', key: 'gated_eyebrow', label: 'Gated download eyebrow' },
    { kind: 'string', key: 'gated_title_pre', label: 'Gated title (pre)' },
    { kind: 'string', key: 'gated_title_italic', label: 'Gated title (italic)' },
    { kind: 'text', key: 'gated_paragraph', label: 'Gated paragraph', rows: 3 },
    { kind: 'string', key: 'gated_cta_label', label: 'Gated CTA label' },
  ],

  memo_copy: [
    { kind: 'string', key: 'topbar_back_label', label: 'Topbar back link' },
    { kind: 'string', key: 'topbar_center_label', label: 'Topbar center label' },
    { kind: 'string', key: 'deal_terms_eyebrow', label: 'Deal terms eyebrow' },
    { kind: 'string', key: 'deal_cta_label', label: 'Deal CTA label' },
    { kind: 'string', key: 'deal_cta_footnote', label: 'Deal CTA footnote' },
    { kind: 'string', key: 'thesis_title', label: 'Thesis title' },
    { kind: 'text', key: 'thesis_subtitle', label: 'Thesis subtitle', rows: 2 },
    { kind: 'string', key: 'revenue_title', label: 'Revenue title' },
    { kind: 'text', key: 'revenue_subtitle', label: 'Revenue subtitle', rows: 2 },
    { kind: 'string', key: 'seasonal_title', label: 'Seasonal title' },
    { kind: 'text', key: 'seasonal_subtitle', label: 'Seasonal subtitle', rows: 2 },
    { kind: 'array<string>', key: 'seasonal_cols', label: 'Seasonal table columns', hint: '5 column headers' },
    { kind: 'string', key: 'upgrades_title', label: 'Upgrades title' },
    { kind: 'string', key: 'upgrades_summary_label', label: 'Upgrades summary label' },
    { kind: 'string', key: 'upgrades_summary_caption', label: 'Upgrades summary caption' },
    { kind: 'string', key: 'upgrades_lift_label', label: 'Upgrades lift label' },
    { kind: 'string', key: 'upgrades_lift_value', label: 'Upgrades lift value' },
    { kind: 'string', key: 'upgrades_payback_label', label: 'Upgrades payback label' },
    { kind: 'string', key: 'upgrades_payback_value', label: 'Upgrades payback value' },
    { kind: 'string', key: 'management_title', label: 'Management title' },
    { kind: 'text', key: 'management_subtitle', label: 'Management subtitle', rows: 2 },
    { kind: 'string', key: 'risks_title', label: 'Risks title' },
    { kind: 'text', key: 'risks_subtitle', label: 'Risks subtitle', rows: 2 },
    { kind: 'string', key: 'comps_title', label: 'Comps title' },
    { kind: 'text', key: 'comps_subtitle', label: 'Comps subtitle', rows: 2 },
    { kind: 'string', key: 'comps_gated_label', label: 'Comps gated label' },
    { kind: 'string', key: 'comps_gated_caption', label: 'Comps gated caption' },
    { kind: 'string', key: 'comps_unlock_label', label: 'Comps unlock CTA' },
    { kind: 'string', key: 'cta_topbar_label', label: 'CTA section topbar label' },
    { kind: 'string', key: 'cta_topbar_response', label: 'CTA section topbar response' },
    { kind: 'text', key: 'cta_headline_pre', label: 'CTA headline (pre)', hint: 'Use \\n for line breaks', rows: 3 },
    { kind: 'string', key: 'cta_headline_italic', label: 'CTA headline (italic)' },
    { kind: 'text', key: 'cta_paragraph', label: 'CTA paragraph', rows: 4 },
    {
      kind: 'array<object>',
      key: 'cta_steps',
      label: 'CTA steps (3 cards)',
      itemTitleKey: 't',
      itemFields: [
        { kind: 'string', key: 'n', label: 'Number', placeholder: '01' },
        { kind: 'string', key: 't', label: 'Title' },
        { kind: 'string', key: 'd', label: 'Description' },
      ],
    },
    { kind: 'string', key: 'cta_compare_label', label: 'CTA compare label' },
    { kind: 'string', key: 'cta_footnote', label: 'CTA footnote' },
    { kind: 'string', key: 'cta_shown_label', label: 'CTA "shown" label' },
    { kind: 'string', key: 'cta_gated_label', label: 'CTA "gated" label' },
    { kind: 'array<string>', key: 'cta_shown', label: 'CTA shown items' },
    { kind: 'array<string>', key: 'cta_gated', label: 'CTA gated items' },
  ],
};

// Sidebar metadata. Keeping this separate from the schema keeps the
// click-to-add UI flexible for future "section dividers" too.
export type KnownKeyMeta = {
  key: string;
  label: string;
  usedBy: string;
};

export const KNOWN_KEY_META: KnownKeyMeta[] = [
  { key: 'homepage_hero_image',     label: 'Homepage hero image',                usedBy: '/ — fullscreen Ken Burns background' },
  { key: 'homepage_credibility',    label: 'Homepage credibility stats',         usedBy: '/ — Track Record section' },
  { key: 'homepage_videos',         label: 'Homepage video tiles',               usedBy: '/ — Video Library section' },
  { key: 'homepage_occupancy_chart', label: 'Homepage occupancy chart',          usedBy: '/ — Market Intelligence chart' },
  { key: 'homepage_nbhd_comparison', label: 'Homepage neighborhood comparison', usedBy: '/ — ADR-by-district bars' },
  { key: 'homepage_copy',           label: 'Homepage prose',                     usedBy: '/ — every headline / lede / CTA' },
  { key: 'about_page',              label: 'About page editorial',               usedBy: '/about — stats + positioning + ops stack' },
  { key: 'about_copy',              label: 'About page prose',                   usedBy: '/about — topbar + headlines + ledes' },
  { key: 'contact_form_options',    label: 'Contact form options',               usedBy: '/contact — interest / budget / timeline buttons' },
  { key: 'contact_copy',            label: 'Contact page prose',                 usedBy: '/contact — hero + steps + success page' },
  { key: 'insights_categories',     label: 'Insights categories',                usedBy: '/insights — future category filter chips' },
  { key: 'insights_copy',           label: 'Insights page prose',                usedBy: '/insights — hero + subscribe + gated CTA' },
  { key: 'memo_editorial',          label: 'Property memo editorial defaults',   usedBy: '/properties/[slug] — thesis / upgrades / risks etc.' },
  { key: 'memo_copy',               label: 'Property memo prose',                usedBy: '/properties/[slug] — section titles + CTA copy' },
  { key: 'ticker_items',            label: 'Site ticker (marquee)',              usedBy: 'All pages — top Bloomberg-style ticker' },
  { key: 'nav_pages',                label: 'Site nav links',                    usedBy: 'All pages — top navigation' },
  { key: 'footer_config',           label: 'Site footer',                        usedBy: 'All pages — footer columns + copyright' },
];
