// Loaders for the 12 site_content keys that absorb editorial copy
// previously inlined in TSX. Each loader follows the same pattern: fetch
// the row, narrow the JSON, fall back to a typed default that matches
// the prior hardcoded values verbatim. Defaults keep mock-mode rendering
// identical when Supabase env vars are missing.

import { getSupabaseServerClient } from '@/lib/supabase/server';

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function readKey<T>(key: string): Promise<T | null> {
  if (!hasEnv()) return null;
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    return (data?.value as T | null) ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// Homepage
// ============================================================

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=2400&q=80';

export async function getHomepageHeroImage(): Promise<string> {
  const v = await readKey<{ url?: string }>('homepage_hero_image');
  return typeof v?.url === 'string' && v.url ? v.url : DEFAULT_HERO_IMAGE;
}

export type CredibilityStat = { num: string; label: string };
const DEFAULT_CREDIBILITY: CredibilityStat[] = [
  { num: '312',   label: 'Properties\ntracked' },
  { num: '$2.4B', label: 'AUM in San\nMiguel market' },
  { num: '11',    label: 'Years operating\nLRM portfolio' },
  { num: '94%',   label: 'Investor 2nd-\ntransaction rate' },
];
export async function getHomepageCredibility(): Promise<CredibilityStat[]> {
  const v = await readKey<{ items?: CredibilityStat[] }>('homepage_credibility');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_CREDIBILITY;
}

export type VideoTile = { id: string; title: string; dur: string; img: string; cat: string };
const DEFAULT_VIDEOS: VideoTile[] = [
  { id: 'v1', title: 'Q1 Market Update — what shifted',         dur: '8:42',  img: 'https://images.unsplash.com/photo-1555881400-69d63dca8a91?auto=format&fit=crop&w=1200&q=80', cat: 'Market Update' },
  { id: 'v2', title: 'Inside Casa Solana — full property tour', dur: '12:18', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', cat: 'Property Tour' },
  { id: 'v3', title: 'How LRM manages a 5-property portfolio',  dur: '14:05', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', cat: 'Operator Series' },
];
export async function getHomepageVideos(): Promise<VideoTile[]> {
  const v = await readKey<{ items?: VideoTile[] }>('homepage_videos');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_VIDEOS;
}

export type OccupancyChart = {
  fig_label: string;
  title: string;
  annual_avg: string;
  months: string[];
  data: number[];
};
const DEFAULT_OCCUPANCY: OccupancyChart = {
  fig_label: 'Fig. 01 · Seasonal Occupancy',
  title: '2025 average — 4-bedroom SMA',
  annual_avg: '62.4%',
  months: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  data: [78, 82, 76, 64, 52, 48, 54, 56, 58, 68, 81, 86],
};
export async function getHomepageOccupancyChart(): Promise<OccupancyChart> {
  const v = await readKey<Partial<OccupancyChart>>('homepage_occupancy_chart');
  if (!v) return DEFAULT_OCCUPANCY;
  return {
    fig_label: v.fig_label || DEFAULT_OCCUPANCY.fig_label,
    title: v.title || DEFAULT_OCCUPANCY.title,
    annual_avg: v.annual_avg || DEFAULT_OCCUPANCY.annual_avg,
    months: Array.isArray(v.months) && v.months.length ? v.months : DEFAULT_OCCUPANCY.months,
    data: Array.isArray(v.data) && v.data.length ? v.data : DEFAULT_OCCUPANCY.data,
  };
}

export type NbhdComparisonRow = { name: string; adr: number; yield: number };
const DEFAULT_NBHD: NbhdComparisonRow[] = [
  { name: 'Centro Histórico', adr: 418, yield: 9.8 },
  { name: 'Atascadero',       adr: 362, yield: 8.4 },
  { name: 'San Antonio',      adr: 294, yield: 9.2 },
  { name: 'Los Frailes',      adr: 312, yield: 7.6 },
  { name: 'El Chorro',        adr: 486, yield: 8.9 },
];
export async function getHomepageNbhdComparison(): Promise<NbhdComparisonRow[]> {
  const v = await readKey<{ items?: NbhdComparisonRow[] }>('homepage_nbhd_comparison');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_NBHD;
}

// ============================================================
// Site chrome
// ============================================================

export type TickerItem = { label: string; val: string; delta: string; up: boolean };
const DEFAULT_TICKER: TickerItem[] = [
  { label: 'SMA·OCC',          val: '62.4%',      delta: '+3.1%',      up: true  },
  { label: 'CENTRO·ADR',       val: '$418',       delta: '+8.2%',      up: true  },
  { label: 'ATASCADERO·ADR',   val: '$362',       delta: '+5.4%',      up: true  },
  { label: 'SAN ANTONIO·ADR',  val: '$294',       delta: '+2.1%',      up: true  },
  { label: 'YOY·VISITORS',     val: '+11.8%',     delta: '↑',          up: true  },
  { label: 'AVG·STAY',         val: '4.1 nights', delta: '+0.3',       up: true  },
  { label: 'CAP·RATE·LUX',     val: '6.8%',       delta: '−0.2%',      up: false },
  { label: 'GROSS·YIELD',      val: '9.2%',       delta: '+0.4%',      up: true  },
  { label: 'PEAK·NOV-MAR',     val: '78% OCC',    delta: '↑',          up: true  },
  { label: 'INVENTORY',        val: '–4.2%',      delta: 'tightening', up: false },
];
export async function getTickerItems(): Promise<TickerItem[]> {
  const v = await readKey<{ items?: TickerItem[] }>('ticker_items');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_TICKER;
}

export type NavPage = { id: string; label: string; href: string };
const DEFAULT_NAV: NavPage[] = [
  { id: 'home',       label: 'Home',            href: '/' },
  { id: 'properties', label: 'Properties',      href: '/properties' },
  { id: 'market',     label: 'Market Data',     href: '/market-data' },
  { id: 'roi',        label: 'ROI Calculator',  href: '/roi-calculator' },
  { id: 'insights',   label: 'Insights',        href: '/insights' },
  { id: 'contact',    label: 'Investor Access', href: '/contact' },
];
export async function getNavPages(): Promise<NavPage[]> {
  const v = await readKey<{ items?: NavPage[] }>('nav_pages');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_NAV;
}

export type FooterLink = { label: string; href?: string };
export type FooterConfig = {
  tagline: string;
  chips: string[];
  explore: FooterLink[];
  resources: FooterLink[];
  contact: FooterLink[];
  copyright: string;
  tagline_short: string;
};
const DEFAULT_FOOTER: FooterConfig = {
  tagline:
    'A research and lead-gen platform for investors evaluating turnkey luxury rental properties in San Miguel de Allende. Operated by Luxury Rental Management.',
  chips: ['Operator-led', 'Real Data'],
  explore: [
    { label: 'Featured Properties', href: '/properties' },
    { label: 'Market Data',         href: '/market-data' },
    { label: 'ROI Calculator',      href: '/roi-calculator' },
    { label: 'Insights & Reports',  href: '/insights' },
  ],
  resources: [
    { label: "Buyer's Guide",      href: '/insights' },
    { label: 'Q1 Market Report',   href: '/insights' },
    { label: 'Tax & Ownership',    href: '/insights' },
    { label: 'Case Studies',       href: '/insights' },
  ],
  contact: [
    { label: 'Request Access',                href: '/contact' },
    { label: 'justin@luxrentalmgmt.com',      href: 'mailto:justin@luxrentalmgmt.com' },
    { label: '+1 (512) 366-2801',             href: 'tel:+15123662801' },
    { label: 'San Miguel de Allende, GTO' },
  ],
  copyright: '© 2026 Luxury Rental Management · justin@luxrentalmgmt.com · +1 (512) 366-2801',
  tagline_short: 'Estimates are directional only — not guaranteed.',
};
export async function getFooterConfig(): Promise<FooterConfig> {
  const v = await readKey<Partial<FooterConfig>>('footer_config');
  if (!v) return DEFAULT_FOOTER;
  return {
    tagline: v.tagline || DEFAULT_FOOTER.tagline,
    chips: Array.isArray(v.chips) && v.chips.length ? v.chips : DEFAULT_FOOTER.chips,
    explore: Array.isArray(v.explore) && v.explore.length ? v.explore : DEFAULT_FOOTER.explore,
    resources: Array.isArray(v.resources) && v.resources.length ? v.resources : DEFAULT_FOOTER.resources,
    contact: Array.isArray(v.contact) && v.contact.length ? v.contact : DEFAULT_FOOTER.contact,
    copyright: v.copyright || DEFAULT_FOOTER.copyright,
    tagline_short: v.tagline_short || DEFAULT_FOOTER.tagline_short,
  };
}

// ============================================================
// /about
// ============================================================

export type AboutContent = {
  stats: Array<{ v: string; l: string }>;
  are_not: Array<{ t: string; d: string }>;
  are: Array<{ t: string; d: string }>;
  stack: Array<{ phase: string; items: string[] }>;
};
const DEFAULT_ABOUT: AboutContent = {
  stats: [
    { v: '11',    l: 'Years operating SMA' },
    { v: '40+',   l: 'LRM portfolio doors' },
    { v: '$280K', l: 'Avg. gross / property' },
  ],
  are_not: [
    { t: 'A real estate brokerage',    d: "We don't represent buyers or sellers in transactions, and we don't collect a brokerage commission on your purchase." },
    { t: 'A passive financial advisor', d: "We're not licensed financial advisors. We don't package securities or run pooled funds." },
    { t: 'A speculation play',          d: "We don't make calls based on macro sentiment or where prices \"should\" be in five years." },
  ],
  are: [
    { t: 'Operators',              d: 'We run a portfolio of high-end short-term rentals in SMA every day. The data flowing through our system is what informs every recommendation.' },
    { t: 'A management platform',  d: 'Through Luxury Rental Management, we execute the full operational stack — design, listing, pricing, distribution, guest experience.' },
    { t: 'Aligned by performance', d: "Our income depends on the property performing after it's purchased. That keeps the incentives clean." },
  ],
  stack: [
    { phase: 'Acquisition',   items: ['Off-market sourcing', 'Underwriting + memo', 'Notario + fideicomiso intro'] },
    { phase: 'Stabilization', items: ['Design refresh + furnishing', 'Pro photo + 360° tour', 'OTA + direct site live'] },
    { phase: 'Operations',    items: ['24/7 bilingual concierge', 'Dynamic pricing weekly', 'Quarterly owner reporting'] },
    { phase: 'Optimization',  items: ['Annual ADR/occ review', 'Capex ROI tracking', 'Tax-efficient distributions'] },
  ],
};
export async function getAboutContent(): Promise<AboutContent> {
  const v = await readKey<Partial<AboutContent>>('about_page');
  if (!v) return DEFAULT_ABOUT;
  return {
    stats: Array.isArray(v.stats) && v.stats.length ? v.stats : DEFAULT_ABOUT.stats,
    are_not: Array.isArray(v.are_not) && v.are_not.length ? v.are_not : DEFAULT_ABOUT.are_not,
    are: Array.isArray(v.are) && v.are.length ? v.are : DEFAULT_ABOUT.are,
    stack: Array.isArray(v.stack) && v.stack.length ? v.stack : DEFAULT_ABOUT.stack,
  };
}

// ============================================================
// /contact
// ============================================================

export type ContactFormOptions = {
  interests: string[];
  budgets: string[];
  timelines: string[];
};
const DEFAULT_CONTACT_OPTS: ContactFormOptions = {
  interests: [
    'Second home (primary use)',
    'Pure investment property',
    'Hybrid personal-use + rental',
    'Off-market / pre-listing access',
    'Portfolio (3+ properties)',
    'Just doing research',
  ],
  budgets: ['$500K–$1M', '$1M–$2M', '$2M–$5M', '$5M+'],
  timelines: ['0–3 mo', '3–6 mo', '6–12 mo', '12+ mo', 'Researching'],
};
export async function getContactFormOptions(): Promise<ContactFormOptions> {
  const v = await readKey<Partial<ContactFormOptions>>('contact_form_options');
  if (!v) return DEFAULT_CONTACT_OPTS;
  return {
    interests: Array.isArray(v.interests) && v.interests.length ? v.interests : DEFAULT_CONTACT_OPTS.interests,
    budgets: Array.isArray(v.budgets) && v.budgets.length ? v.budgets : DEFAULT_CONTACT_OPTS.budgets,
    timelines: Array.isArray(v.timelines) && v.timelines.length ? v.timelines : DEFAULT_CONTACT_OPTS.timelines,
  };
}

// ============================================================
// /insights
// ============================================================

export type InsightsCategory = { id: string; label: string; matches: string | null };
const DEFAULT_INSIGHTS_CATS: InsightsCategory[] = [
  { id: 'all',       label: 'All Insights',        matches: null },
  { id: 'market',    label: 'Market Reports',      matches: 'Market Report' },
  { id: 'guide',     label: 'Investment Guides',   matches: 'Investment Guide' },
  { id: 'buyer',     label: 'Buyer Education',     matches: 'Buyer Education' },
  { id: 'case',      label: 'Case Studies',        matches: 'Case Study' },
  { id: 'tax',       label: 'Tax & Ownership',     matches: 'Tax & Ownership' },
  { id: 'lifestyle', label: 'Second-Home Living',  matches: 'Lifestyle' },
];
export async function getInsightsCategories(): Promise<InsightsCategory[]> {
  const v = await readKey<{ items?: InsightsCategory[] }>('insights_categories');
  return Array.isArray(v?.items) && v.items.length ? v.items : DEFAULT_INSIGHTS_CATS;
}

// ============================================================
// /properties/[slug] (memo) editorial defaults
// ============================================================

export type MemoEditorial = {
  monthly_labels: string[];
  seasonality: number[];
  adr_factor: number[];
  thesis: Array<{ t: string; d: string }>;
  upgrades: Array<{ item: string; cost: number; lift: string; payback: string }>;
  management: Array<{ phase: string; items: string[] }>;
  management_stats: Array<{ v: string; l: string }>;
  risks: Array<{ t: string; d: string }>;
  seasonal_events: Array<{ period: string; date: string; adr: string; occ: string; notes: string }>;
};
const DEFAULT_MEMO: MemoEditorial = {
  monthly_labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  seasonality: [88, 84, 76, 64, 48, 42, 56, 58, 54, 64, 78, 92],
  adr_factor: [1.2, 1.15, 1.05, 0.92, 0.78, 0.72, 0.85, 0.85, 0.82, 0.95, 1.18, 1.35],
  thesis: [
    { t: 'Location alpha',       d: '{neighborhood} commands premium ADR vs SMA average. Walkable to Jardín, Parroquia, and the principal restaurant corridor.' },
    { t: 'Inventory scarcity',   d: 'Active inventory in this segment fell 4.2% YoY. Only 11 luxury 4BD+ properties traded in Q1 2026.' },
    { t: 'Demand tailwind',      d: 'Wedding season + Día de Muertos + Christmas occupy 78% of November–March nights at premium ADR.' },
    { t: 'Operator advantage',   d: 'LRM portfolio properties generate 18% higher RevPAR vs. owner-operated peers — verified across 312 units.' },
  ],
  upgrades: [
    { item: 'Rooftop terrace expansion + plunge pool', cost: 65000, lift: '+$48 ADR',   payback: '2.1 yr' },
    { item: 'Primary suite refresh + linens',          cost: 22000, lift: '+$22 ADR',   payback: '1.4 yr' },
    { item: 'Outdoor kitchen / fire pit',              cost: 28000, lift: '+$18 ADR',   payback: '2.2 yr' },
    { item: 'Pro photography + LRM staging',           cost: 8000,  lift: '+8% occ',    payback: '0.6 yr' },
  ],
  management: [
    { phase: 'Acquisition',   items: ['Title clearance via Mexican notary', 'Fideicomiso setup (60 days)', 'Inventory + condition audit'] },
    { phase: 'Stabilization', items: ['LRM design refresh (90 days)', 'Pro photo + 360° tour', 'OTA listings + direct site live'] },
    { phase: 'Operations',    items: ['24/7 guest concierge (bilingual)', 'Dynamic pricing — adjusted weekly', 'Quarterly owner reporting'] },
    { phase: 'Optimization',  items: ['Annual ADR & occupancy review', 'Upgrade ROI tracking', 'Tax-efficient distribution planning'] },
  ],
  management_stats: [
    { v: '22%',    l: 'LRM mgmt fee' },
    { v: '4–6 wks', l: 'To first guest' },
    { v: '47',     l: 'Active LRM properties' },
    { v: '18%',    l: 'RevPAR vs. owner-op' },
  ],
  risks: [
    { t: 'Regulatory',           d: 'SMA municipality is reviewing short-term rental licensing. We model 6% annual licensing/registration cost as a contingency, even though current law does not require it.' },
    { t: 'FX exposure',          d: 'Owner P&L is reported in MXN. We hedge 50% of distributions via forward contracts; net peso volatility historically ±4% annualized on yields.' },
    { t: 'Concentration',        d: 'A material portion of demand originates from US/Canada. We model a 12% revenue haircut in a recession scenario but historical SMA performance has decoupled from US metro markets.' },
    { t: 'Operator dependency',  d: 'Property economics rely on LRM (or comparable) management. Owner-operator path is supported but reduces projected RevPAR by ~18%.' },
  ],
  seasonal_events: [
    { period: 'Día de Muertos',     date: 'Oct 28 – Nov 4',       adr: '$680', occ: '92%', notes: 'Books 6mo out' },
    { period: 'Christmas / NYE',    date: 'Dec 18 – Jan 4',       adr: '$820', occ: '96%', notes: 'Multi-week stays' },
    { period: 'Wedding peak',       date: 'Feb – Apr weekends',   adr: '$640', occ: '88%', notes: 'Full-property buyouts' },
    { period: 'Independence Day',   date: 'Sep 13 – 17',          adr: '$480', occ: '85%', notes: 'Domestic demand' },
  ],
};
export async function getMemoEditorial(): Promise<MemoEditorial> {
  const v = await readKey<Partial<MemoEditorial>>('memo_editorial');
  if (!v) return DEFAULT_MEMO;
  return {
    monthly_labels: Array.isArray(v.monthly_labels) && v.monthly_labels.length ? v.monthly_labels : DEFAULT_MEMO.monthly_labels,
    seasonality: Array.isArray(v.seasonality) && v.seasonality.length ? v.seasonality : DEFAULT_MEMO.seasonality,
    adr_factor: Array.isArray(v.adr_factor) && v.adr_factor.length ? v.adr_factor : DEFAULT_MEMO.adr_factor,
    thesis: Array.isArray(v.thesis) && v.thesis.length ? v.thesis : DEFAULT_MEMO.thesis,
    upgrades: Array.isArray(v.upgrades) && v.upgrades.length ? v.upgrades : DEFAULT_MEMO.upgrades,
    management: Array.isArray(v.management) && v.management.length ? v.management : DEFAULT_MEMO.management,
    management_stats: Array.isArray(v.management_stats) && v.management_stats.length ? v.management_stats : DEFAULT_MEMO.management_stats,
    risks: Array.isArray(v.risks) && v.risks.length ? v.risks : DEFAULT_MEMO.risks,
    seasonal_events: Array.isArray(v.seasonal_events) && v.seasonal_events.length ? v.seasonal_events : DEFAULT_MEMO.seasonal_events,
  };
}

// ============================================================
// Page-level prose ("copy") — headlines, ledes, CTA labels, bullet
// lists. One key per page. Headlines that contain an italic span
// are stored as separate `_pre` / `_italic` / `_post` fields so the
// typography survives admin edits.
// ============================================================

// `loose<T>` returns the parsed JSON merged onto defaults. Strings
// keep their default if the override is missing or empty; arrays keep
// their default if the override is missing or empty.
function mergeCopy<T extends Record<string, unknown>>(defaults: T, v: Partial<T> | null): T {
  if (!v) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const k of Object.keys(defaults)) {
    const dv = (defaults as Record<string, unknown>)[k];
    const ov = (v as Record<string, unknown>)[k];
    if (ov === undefined || ov === null) continue;
    if (typeof dv === 'string') {
      if (typeof ov === 'string' && ov.length) out[k] = ov;
    } else if (Array.isArray(dv)) {
      if (Array.isArray(ov) && ov.length) out[k] = ov;
    } else if (typeof dv === 'object') {
      if (typeof ov === 'object') out[k] = ov;
    } else {
      out[k] = ov;
    }
  }
  return out as T;
}

// ----- Homepage copy --------------------------------------------------------

export type HeroCardStat = { l: string; v: string; d: string; up: boolean };
export type HomepageCopy = {
  hero_eyebrow: string;
  hero_headline_pre: string;
  hero_headline_italic: string;
  hero_headline_post: string;
  hero_paragraph: string;
  hero_cta_primary_label: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_href: string;
  hero_card_eyebrow: string;
  hero_card_updated: string;
  hero_card_stats: HeroCardStat[];
  hero_card_footer: string;
  credibility_eyebrow: string;
  credibility_title_pre: string;
  credibility_title_italic: string;
  credibility_title_post: string;
  featured_eyebrow: string;
  featured_title_pre: string;
  featured_title_italic: string;
  featured_lede: string;
  featured_footnote: string;
  featured_cta_label: string;
  market_eyebrow: string;
  market_title_pre: string;
  market_title_italic: string;
  market_lede: string;
  market_source: string;
  market_cta_label: string;
  nbhd_chart_label: string;
  nbhd_chart_title: string;
  legend_peak: string;
  legend_shoulder: string;
  video_eyebrow: string;
  video_title_pre: string;
  video_title_italic: string;
  video_lede: string;
  insights_eyebrow: string;
  insights_title: string;
  insights_cta_label: string;
  lead_eyebrow: string;
  lead_title_pre: string;
  lead_title_italic: string;
  lead_paragraph: string;
  lead_benefits: string[];
  lead_form_eyebrow: string;
  lead_form_cta_label: string;
  lead_form_footnote: string;
};
const DEFAULT_HOMEPAGE_COPY: HomepageCopy = {
  hero_eyebrow: 'San Miguel de Allende · Vol. 04 · Q1 2026',
  hero_headline_pre: "Invest in San Miguel's most",
  hero_headline_italic: 'desirable luxury rental',
  hero_headline_post: ' market.',
  hero_paragraph:
    'Real ADR data. Turnkey LRM management. Income-producing second homes underwritten with the rigor of an institutional fund — not a brokerage pitch.',
  hero_cta_primary_label: 'See Featured Opportunities →',
  hero_cta_primary_href: '/properties',
  hero_cta_secondary_label: 'Calculate Your ROI',
  hero_cta_secondary_href: '/roi-calculator',
  hero_card_eyebrow: 'Q1 2026 · Snapshot',
  hero_card_updated: 'Updated 04·28',
  hero_card_stats: [
    { l: 'Avg occupancy', v: '62.4%', d: '+3.1', up: true },
    { l: 'Centro ADR', v: '$418', d: '+8.2%', up: true },
    { l: 'YoY visitors', v: '+11.8%', d: '↑', up: true },
    { l: 'Gross yield', v: '9.2%', d: '+0.4', up: true },
  ],
  hero_card_footer: 'Aggregated across 312 LRM-managed and tracked properties in Q1.',
  credibility_eyebrow: '02 · Track Record',
  credibility_title_pre: 'The data behind ',
  credibility_title_italic: 'every',
  credibility_title_post: ' investment memo.',
  featured_eyebrow: '03 · Active Opportunities',
  featured_title_pre: 'Underwritten,',
  featured_title_italic: 'turnkey-ready.',
  featured_lede:
    'Off-market and selectively-listed properties with full investment memos, ADR projections, and a defined upgrade thesis. We turn down ~40 properties for every one we accept onto the platform.',
  featured_footnote: '+3 more on the platform · 14 off-market deals available with investor access',
  featured_cta_label: 'All Properties →',
  market_eyebrow: '04 · Market Intelligence',
  market_title_pre: 'Proprietary data,',
  market_title_italic: 'not realtor lore.',
  market_lede:
    'We track ADR, occupancy, and seasonal demand across 312 properties in San Miguel — the only dataset of its kind. A summary view below; the full report ships to verified investors.',
  market_source: 'Source: LRM proprietary index · n=312 · Q1 2024 — Q1 2026',
  market_cta_label: 'Full Market Dashboard →',
  nbhd_chart_label: 'Fig. 02 · Neighborhoods',
  nbhd_chart_title: 'ADR by district',
  legend_peak: 'PEAK · NOV–MAR',
  legend_shoulder: 'SHOULDER · APR–OCT',
  video_eyebrow: '05 · Video Library',
  video_title_pre: 'Watch the',
  video_title_italic: 'homework.',
  video_lede:
    'Quarterly market updates, full property tours, and operator-series interviews. We publish what we see on the ground — not curated marketing.',
  insights_eyebrow: '07 · Latest insights',
  insights_title: 'From the desk.',
  insights_cta_label: 'All insights →',
  lead_eyebrow: '06 · Investor Access',
  lead_title_pre: 'The full underwriting',
  lead_title_italic: 'is gated.',
  lead_paragraph:
    'Verified investors receive: full Q1 2026 market report (52 pages), off-market property memos, ROI underwriting models, and a direct line to our acquisition team.',
  lead_benefits: [
    'Q1 2026 SMA Market Report (52pp)',
    '14 off-market property memos',
    'Quarterly investor briefing call',
    'Direct line to LRM acquisitions',
  ],
  lead_form_eyebrow: 'Request Investor Access',
  lead_form_cta_label: 'Open the full form →',
  lead_form_footnote: 'Reviewed within 24h · Not all applicants qualified',
};
export async function getHomepageCopy(): Promise<HomepageCopy> {
  const v = await readKey<Partial<HomepageCopy>>('homepage_copy');
  return mergeCopy(DEFAULT_HOMEPAGE_COPY, v);
}

// ----- About copy -----------------------------------------------------------

export type AboutCopy = {
  topbar: string[];
  hero_eyebrow: string;
  hero_headline_pre: string;
  hero_headline_italic: string;
  hero_paragraph: string;
  positioning_eyebrow: string;
  positioning_title_pre: string;
  positioning_title_italic: string;
  positioning_title_post: string;
  are_not_label: string;
  are_label: string;
  stack_eyebrow: string;
  stack_title_pre: string;
  stack_title_italic: string;
  stack_lede: string;
  closing_eyebrow: string;
  closing_title_pre: string;
  closing_title_italic: string;
  closing_paragraph: string;
  closing_cta_apply_label: string;
  closing_cta_read_label: string;
};
const DEFAULT_ABOUT_COPY: AboutCopy = {
  topbar: ['§ About InvestSMA', 'Operators · not brokers', 'Est. via Luxury Rental Mgmt'],
  hero_eyebrow: 'About · 01',
  hero_headline_pre: "We don't help you\nbuy property.\n",
  hero_headline_italic: 'We help you build a performing asset.',
  hero_paragraph:
    'Most opportunities in San Miguel look good on paper. Few are structured, positioned, and operated in a way that delivers what investors expect. That gap — between a clean acquisition and a performing asset — is what we close.',
  positioning_eyebrow: '02 · Positioning',
  positioning_title_pre: 'What we ',
  positioning_title_italic: 'are',
  positioning_title_post: " and aren't.",
  are_not_label: 'WE ARE NOT',
  are_label: 'WE ARE',
  stack_eyebrow: '03 · Operations stack',
  stack_title_pre: 'Four phases.',
  stack_title_italic: 'One operator.',
  stack_lede:
    "From acquisition to exit, the same team — and the same data — runs every phase. That's how we keep the projection-to-reality variance below 8%.",
  closing_eyebrow: '04 · Next step',
  closing_title_pre: 'The portfolio is small\n',
  closing_title_italic: 'by design.',
  closing_paragraph:
    "We add roughly one investor per quarter. Tell us what you're looking for and we'll respond within 24 hours.",
  closing_cta_apply_label: 'Apply for access →',
  closing_cta_read_label: 'Read our notes',
};
export async function getAboutCopy(): Promise<AboutCopy> {
  const v = await readKey<Partial<AboutCopy>>('about_copy');
  return mergeCopy(DEFAULT_ABOUT_COPY, v);
}

// ----- Contact copy ---------------------------------------------------------

export type ContactStat = { v: string; l: string };
export type TrustSignal = { t: string; d: string };
export type ContactCopy = {
  hero_eyebrow: string;
  hero_headline_pre: string;
  hero_headline_italic: string;
  hero_paragraph: string;
  hero_stats: ContactStat[];
  step_1_eyebrow: string;
  step_1_title: string;
  step_1_label_name: string;
  step_1_label_email: string;
  step_1_label_phone: string;
  step_2_eyebrow: string;
  step_2_title: string;
  step_2_label_budget: string;
  step_2_label_timeline: string;
  step_3_eyebrow: string;
  step_3_title: string;
  step_3_label_interests: string;
  step_3_label_message: string;
  step_3_message_placeholder: string;
  submit_label: string;
  submit_footnote: string;
  trust_signals: TrustSignal[];
  submitted_title: string;
  submitted_paragraph: string;
  submitted_cta_browse_label: string;
  submitted_cta_market_label: string;
};
const DEFAULT_CONTACT_COPY: ContactCopy = {
  hero_eyebrow: 'Investor Access · Application',
  hero_headline_pre: 'Apply for',
  hero_headline_italic: 'investor access.',
  hero_paragraph:
    "We work with a limited number of investors per quarter. Tell us about your goals — we'll respond within 24 hours.",
  hero_stats: [
    { v: '24h', l: 'Avg response' },
    { v: '47', l: 'Active investors' },
    { v: '$2.4B', l: 'AUM' },
  ],
  step_1_eyebrow: 'Step 01 of 03',
  step_1_title: 'Tell us who you are.',
  step_1_label_name: 'Full name',
  step_1_label_email: 'Email',
  step_1_label_phone: 'Phone',
  step_2_eyebrow: 'Step 02 of 03',
  step_2_title: 'Investment profile.',
  step_2_label_budget: 'Budget range',
  step_2_label_timeline: 'Buying timeline',
  step_3_eyebrow: 'Step 03 of 03',
  step_3_title: 'What are you looking for?',
  step_3_label_interests: 'Interests · select all',
  step_3_label_message: 'Anything else? (optional)',
  step_3_message_placeholder: 'Specific neighborhoods, must-have features, or context we should know...',
  submit_label: 'Request Investor Access →',
  submit_footnote: 'Reviewed within 24h · No broker referrals · Discretion guaranteed',
  trust_signals: [
    { t: 'No broker referrals', d: 'Your information stays with the LRM acquisition team. We never sell or share leads.' },
    { t: '24-hour response', d: 'A real human responds within one business day. Not a drip sequence.' },
    { t: 'Off-market access', d: 'Verified investors see 14 properties not listed on the public catalog.' },
  ],
  submitted_title: 'Application received.',
  submitted_paragraph:
    'Our acquisition team will review and respond within 24 hours. Check your inbox for next steps.',
  submitted_cta_browse_label: 'Browse Properties',
  submitted_cta_market_label: 'See Market Data',
};
export async function getContactCopy(): Promise<ContactCopy> {
  const v = await readKey<Partial<ContactCopy>>('contact_copy');
  return mergeCopy(DEFAULT_CONTACT_COPY, v);
}

// ----- Insights copy --------------------------------------------------------

export type InsightsCopy = {
  hero_eyebrow: string;
  hero_headline_pre: string;
  hero_headline_italic: string;
  hero_paragraph: string;
  subscribe_placeholder: string;
  subscribe_label: string;
  featured_label: string;
  empty_state: string;
  gated_eyebrow: string;
  gated_title_pre: string;
  gated_title_italic: string;
  gated_paragraph: string;
  gated_cta_label: string;
};
const DEFAULT_INSIGHTS_COPY: InsightsCopy = {
  hero_eyebrow: 'Field Notes',
  hero_headline_pre: 'Insights',
  hero_headline_italic: 'from the field.',
  hero_paragraph:
    'Quarterly market reports, buyer education, tax guidance, case studies. Written by the LRM acquisition team — published every two weeks.',
  subscribe_placeholder: 'your@email.com',
  subscribe_label: 'Subscribe →',
  featured_label: 'Featured this week',
  empty_state: 'No published insights yet — apply the seed migration to surface 9 designed posts.',
  gated_eyebrow: 'Gated · Free',
  gated_title_pre: 'The 52-page Q1',
  gated_title_italic: 'SMA Market Report.',
  gated_paragraph:
    'Full neighborhood-by-neighborhood ADR breakdown, transaction comps, regulatory outlook, and a 2027 forecast. Sent as PDF.',
  gated_cta_label: 'Download Free →',
};
export async function getInsightsCopy(): Promise<InsightsCopy> {
  const v = await readKey<Partial<InsightsCopy>>('insights_copy');
  return mergeCopy(DEFAULT_INSIGHTS_COPY, v);
}

// ----- Memo (property page) copy --------------------------------------------

export type CtaStep = { n: string; t: string; d: string };
export type MemoCopy = {
  topbar_back_label: string;
  topbar_center_label: string;
  deal_terms_eyebrow: string;
  deal_cta_label: string;
  deal_cta_footnote: string;
  thesis_title: string;
  thesis_subtitle: string;
  revenue_title: string;
  revenue_subtitle: string;
  seasonal_title: string;
  seasonal_subtitle: string;
  seasonal_cols: string[];
  upgrades_title: string;
  upgrades_summary_label: string;
  upgrades_summary_caption: string;
  upgrades_lift_label: string;
  upgrades_lift_value: string;
  upgrades_payback_label: string;
  upgrades_payback_value: string;
  management_title: string;
  management_subtitle: string;
  risks_title: string;
  risks_subtitle: string;
  comps_title: string;
  comps_subtitle: string;
  comps_gated_label: string;
  comps_gated_caption: string;
  comps_unlock_label: string;
  cta_topbar_label: string;
  cta_topbar_response: string;
  cta_headline_pre: string;
  cta_headline_italic: string;
  cta_paragraph: string;
  cta_steps: CtaStep[];
  cta_compare_label: string;
  cta_footnote: string;
  cta_shown_label: string;
  cta_gated_label: string;
  cta_shown: string[];
  cta_gated: string[];
};
const DEFAULT_MEMO_COPY: MemoCopy = {
  topbar_back_label: '← All Properties',
  topbar_center_label: 'Underwriting Package · By Request',
  deal_terms_eyebrow: 'Deal terms',
  deal_cta_label: 'Request full underwriting →',
  deal_cta_footnote: 'RETURNS WITHIN 48 HRS · 12-PAGE PDF · NDA-PROTECTED',
  thesis_title: 'Investment thesis',
  thesis_subtitle: 'Four reasons we accepted this onto the platform.',
  revenue_title: 'Revenue assumptions',
  revenue_subtitle: 'Underwritten at base case. Bull and bear scenarios in full model.',
  seasonal_title: 'Seasonal revenue opportunity',
  seasonal_subtitle: 'Four windows where SMA ADR routinely exceeds $600 and occupancy clears 85%.',
  seasonal_cols: ['Window', 'Dates', 'Peak ADR', 'Occupancy', 'Notes'],
  upgrades_title: 'Recommended upgrades',
  upgrades_summary_label: 'Upgrade summary',
  upgrades_summary_caption: 'Total recommended capex',
  upgrades_lift_label: 'ADR uplift (Y2)',
  upgrades_lift_value: '+$88 / night',
  upgrades_payback_label: 'Blended payback',
  upgrades_payback_value: '1.8 years',
  management_title: 'LRM management strategy',
  management_subtitle: 'The four-phase operator playbook applied to every property on the platform.',
  risks_title: 'Risks & considerations',
  risks_subtitle: "What could go wrong, and how we've underwritten around it.",
  comps_title: 'Comparable transactions',
  comps_subtitle:
    'Five trades within 1 km, last 12 months. First three shown — full set with addresses, brokers, and seller motivation in the gated package.',
  comps_gated_label: 'Gated · 2 of 5 trades',
  comps_gated_caption: 'Off-market trades disclosed in the full underwriting package.',
  comps_unlock_label: 'Unlock comp set →',
  cta_topbar_label: '§ Request the full underwriting package',
  cta_topbar_response: 'Avg response · 36 hrs',
  cta_headline_pre: "You've seen the\nsummary.\n",
  cta_headline_italic: 'Now see the model.',
  cta_paragraph:
    'The page above is a teaser — sized for diligence, not for closing. The full package goes line-by-line through assumptions, comps, capex, structure, and tax. We send it within 48 hours after a 10-minute qualification call.',
  cta_steps: [
    { n: '01', t: 'Request', d: 'Form below · 2 min' },
    { n: '02', t: 'Qualify', d: '10-min intro call' },
    { n: '03', t: 'Receive', d: 'Full package · 48 hrs' },
  ],
  cta_compare_label: 'Compare other listings',
  cta_footnote: 'NDA-PROTECTED · ACCREDITED INVESTORS · NO COST TO RECEIVE',
  cta_shown_label: 'Public preview',
  cta_gated_label: 'Gated',
  cta_shown: [
    'Investment thesis (4-bullet summary)',
    'Revenue range, occupancy, base-case Y2 gross',
    'Seasonality curve (12-month chart)',
    'Capex thesis + estimated upgrade budget',
    '3 of 5 comparable trades',
  ],
  cta_gated: [
    'Full Excel model · base / bull / bear with sensitivity',
    'All 5 comps with addresses, brokers, seller motivation',
    'Capex schedule with vendor quotes (line-item, not estimate)',
    'Property condition report + structural assessment',
    'Title search + ejido / fideicomiso review notes',
    'Tax structure recommendation (US + MX)',
    '30-min call with LRM acquisition lead',
  ],
};
export async function getMemoCopy(): Promise<MemoCopy> {
  const v = await readKey<Partial<MemoCopy>>('memo_copy');
  return mergeCopy(DEFAULT_MEMO_COPY, v);
}
