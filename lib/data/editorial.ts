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
