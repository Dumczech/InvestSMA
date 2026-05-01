import { getSupabaseServerClient } from '@/lib/supabase/server';
import { properties as fallbackProperties } from '@/data/properties';
import type { MarketMetric, Trend, Unit } from '@/types/market';

const hasEnv=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function getHomepageContent(){
  if(!hasEnv()) return {hero:{headline:'Invest in San Miguel de Allende’s Most Desirable Luxury Rental Market',subheadline:'Access real rental performance data, curated acquisition opportunities, and turnkey management from one of San Miguel’s leading luxury rental operators.'},metrics:[{label:'Luxury units managed',value:'45+'},{label:'Guest database',value:'10,000+'},{label:'Direct booking network',value:'Strong'},{label:'Concierge & operations',value:'Full team'}],usingMock:true};
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('site_content').select('key,value').in('key',['homepage_hero','homepage_metrics']);
  // value is typed as Json; the CMS stores arbitrary editor-shaped objects so
  // we narrow at the boundary instead of polluting the schema with view-models.
  const hero=(data?.find(d=>d.key==='homepage_hero')?.value as { headline?: string; subheadline?: string } | undefined) || {};
  const metricsValue=data?.find(d=>d.key==='homepage_metrics')?.value as { items?: unknown[] } | undefined;
  const metrics=metricsValue?.items || [];
  return {hero:{headline:hero.headline||'',subheadline:hero.subheadline||''},metrics,usingMock:false};
}

// Global property image fallback used by every property card / memo when the
// row's `images` array is empty. Stored in site_content so admins can swap a
// single URL and update every fallback site-wide. Defaults to a stable
// Unsplash photo so the page never renders an empty box.
const DEFAULT_PROPERTY_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&h=1000&fit=crop&q=80';

export async function getDefaultPropertyImage(): Promise<string> {
  if (!hasEnv()) return DEFAULT_PROPERTY_IMAGE_FALLBACK;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'default_property_image')
    .maybeSingle();
  const url = (data?.value as { url?: string } | null)?.url;
  return typeof url === 'string' && url.trim() ? url : DEFAULT_PROPERTY_IMAGE_FALLBACK;
}

function rowToProperty(r: any, fallbackImage: string) {
  const dbImages = Array.isArray(r.images) ? r.images.filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0) : [];
  const heroImage = typeof r.hero_image === 'string' && r.hero_image.trim() ? r.hero_image : null;
  const images = (heroImage ? [heroImage, ...dbImages.filter((u: string) => u !== heroImage)] : dbImages);
  return {
    slug: r.slug,
    name: r.name,
    neighborhood: r.neighborhood,
    price: r.price_usd ? `$${Number(r.price_usd).toLocaleString()}` : 'TBD',
    bedrooms: r.bedrooms || 0,
    adr: `$${r.adr_low || 0}–$${r.adr_high || 0}`,
    annualGross: `$${r.annual_gross_low || 0}–$${r.annual_gross_high || 0}`,
    upgradePotential: r.upgrade_potential || 'Operational optimization',
    thesis: r.investment_thesis || 'Data-backed opportunity',
    occupancy: r.occupancy_assumption || 'TBD',
    strategy: r.strategy || 'LRM strategy',
    seasonality: r.seasonality || 'Seasonality upside',
    risks: Array.isArray(r.risks) ? r.risks : ['Pending'],
    images: images.length ? images : [fallbackImage],
    score: typeof r.score === 'number' ? r.score : undefined,
    baths: typeof r.baths === 'number' ? r.baths : undefined,
    sqm: typeof r.sqm === 'number' ? r.sqm : undefined,
    rooftop: typeof r.rooftop === 'boolean' ? r.rooftop : undefined,
    accent2: typeof r.accent2 === 'string' && r.accent2 ? r.accent2 : undefined,
    style: (r.style === 'colonial' || r.style === 'hacienda' || r.style === 'villa') ? r.style : undefined,
    heroImage: heroImage || undefined,
  };
}

export async function getPublishedProperties(){
  if(!hasEnv()) return fallbackProperties;
  const supabase = getSupabaseServerClient();
  const [{ data }, fallbackImage] = await Promise.all([
    supabase.from('properties').select('*').eq('status', 'published'),
    getDefaultPropertyImage(),
  ]);
  if (!data?.length) return fallbackProperties;
  return data.map(r => rowToProperty(r, fallbackImage));
}

export async function getPublishedArticles(){
  if(!hasEnv()) return [];
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('articles').select('*').eq('published',true);
  return data ?? [];
}


export async function getPropertyBySlug(slug: string) {
  if (!hasEnv()) return fallbackProperties.find(p => p.slug === slug) ?? null;
  const supabase = getSupabaseServerClient();
  const [{ data }, fallbackImage] = await Promise.all([
    supabase.from('properties').select('*').eq('slug', slug).eq('status', 'published').maybeSingle(),
    getDefaultPropertyImage(),
  ]);
  if (!data) return fallbackProperties.find(p => p.slug === slug) ?? null;
  return rowToProperty(data, fallbackImage);
}

// ============================================================
// PR 3 additions — content blocks moved off hardcoded JSX.
// Each loader follows the same shape: read site_content row by key,
// fall back to the prior hardcoded copy when missing/empty so behavior
// is unchanged for environments that haven't yet seeded the row.
// ============================================================

const DEFAULT_HEADLINE_METRICS: MarketMetric[] = [
  { id: 'adr',       label: 'ADR',              period: 'Last 12M', lrmValue: 520, marketValue: 372,  unit: 'currency', delta: 148,  deltaPercent: 39.8, trend: 'up', source: 'LRM + AirDNA (sample)' },
  { id: 'occupancy', label: 'Occupancy',        period: 'Last 12M', lrmValue: 68,  marketValue: 62.4, unit: 'percent',  delta: 5.6,  deltaPercent: 9,    trend: 'up', source: 'LRM + AirDNA (sample)' },
  { id: 'revpar',    label: 'RevPAR',           period: 'Last 12M', lrmValue: 354, marketValue: 232,  unit: 'currency', delta: 122,  deltaPercent: 52.6, trend: 'up', source: 'LRM + AirDNA (sample)' },
  { id: 'direct',    label: 'Direct Booking %', period: 'Last 12M', lrmValue: 41,  marketValue: 24,   unit: 'percent',  delta: 17,   deltaPercent: 70.8, trend: 'up', source: 'LRM + market benchmark (sample)' },
];

function coerceMetric(raw: unknown): MarketMetric | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : null;
  const label = typeof r.label === 'string' ? r.label : null;
  const unit = (r.unit === 'currency' || r.unit === 'percent' || r.unit === 'number')
    ? r.unit as Unit
    : null;
  const trend = (r.trend === 'up' || r.trend === 'down' || r.trend === 'flat')
    ? r.trend as Trend
    : 'flat';
  if (!id || !label || !unit) return null;
  return {
    id, label, unit, trend,
    period: typeof r.period === 'string' ? r.period : 'Last 12M',
    lrmValue: Number(r.lrmValue ?? 0),
    marketValue: Number(r.marketValue ?? 0),
    delta: Number(r.delta ?? 0),
    deltaPercent: Number(r.deltaPercent ?? 0),
    source: typeof r.source === 'string' ? r.source : '',
  };
}

export async function getMarketHeadlineMetrics(): Promise<MarketMetric[]> {
  if (!hasEnv()) return DEFAULT_HEADLINE_METRICS;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'market_headline_metrics')
    .maybeSingle();
  const items = (data?.value as { items?: unknown[] } | null)?.items;
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_HEADLINE_METRICS;
  const coerced = items.map(coerceMetric).filter((m): m is MarketMetric => m !== null);
  return coerced.length ? coerced : DEFAULT_HEADLINE_METRICS;
}

export type ContactPageContent = {
  title: string;
  subtitle: string;
  fieldLabels: string[];
  messagePlaceholder: string;
  submitLabel: string;
};

const DEFAULT_CONTACT: ContactPageContent = {
  title: 'Request Investor Access',
  subtitle: 'Apply for curated opportunities, market intelligence, and underwriting support.',
  fieldLabels: ['Name', 'Email', 'Phone', 'Budget', 'Timeline', 'Buyer type', 'Interested neighborhoods'],
  messagePlaceholder: 'Message',
  submitLabel: 'Request Investor Access',
};

export async function getContactContent(): Promise<ContactPageContent> {
  if (!hasEnv()) return DEFAULT_CONTACT;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'contact_page')
    .maybeSingle();
  const v = data?.value as Partial<ContactPageContent> | null;
  if (!v) return DEFAULT_CONTACT;
  return {
    title: v.title || DEFAULT_CONTACT.title,
    subtitle: v.subtitle || DEFAULT_CONTACT.subtitle,
    fieldLabels: Array.isArray(v.fieldLabels) && v.fieldLabels.length ? v.fieldLabels : DEFAULT_CONTACT.fieldLabels,
    messagePlaceholder: v.messagePlaceholder || DEFAULT_CONTACT.messagePlaceholder,
    submitLabel: v.submitLabel || DEFAULT_CONTACT.submitLabel,
  };
}

const DEFAULT_INSIGHTS_FALLBACK = [
  'Is San Miguel de Allende a Good Real Estate Investment?',
  'What Kind of Rental Revenue Can a Luxury Home Generate in San Miguel?',
  'Why Large Homes Outperform During Peak Season',
  'Second Home vs. Investment Property in Mexico',
  'How LRM Evaluates an Investment Property',
];

export async function getInsightsFallbackTitles(): Promise<string[]> {
  if (!hasEnv()) return DEFAULT_INSIGHTS_FALLBACK;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'insights_fallback_titles')
    .maybeSingle();
  const items = (data?.value as { items?: unknown[] } | null)?.items;
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_INSIGHTS_FALLBACK;
  return items.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

export type RoiCalculatorContent = {
  title: string;
  subtitle: string;
  inputs: string[];
  submitLabel: string;
  gate: {
    title: string;
    fields: string[];
    sampleResult: string;
  };
};

const DEFAULT_ROI: RoiCalculatorContent = {
  title: 'ROI Potential Calculator',
  subtitle: 'Directional underwriting to frame positioning and next steps.',
  inputs: [
    'Purchase budget',
    'Down payment %',
    'Bedroom count',
    'Property condition',
    'Upgrade budget',
    'Personal-use days/year',
    'Target positioning: mid-market/luxury/ultra-luxury',
  ],
  submitLabel: 'Run Analysis',
  gate: {
    title: 'Investor Access Required',
    fields: [
      'Name',
      'Email',
      'Phone',
      'Budget',
      'Buying timeline',
      'Interested in: Second home / Investment property / Hybrid personal-use property / Off-market deals',
    ],
    sampleResult: 'Estimated ADR: $900–$1,450 · Occupancy: 60–70% · Annual Gross: $240K–$410K · Suggested positioning: Luxury · Next step: Request underwriting call.',
  },
};

export async function getRoiCalculatorContent(): Promise<RoiCalculatorContent> {
  if (!hasEnv()) return DEFAULT_ROI;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'roi_calculator')
    .maybeSingle();
  const v = data?.value as (Partial<RoiCalculatorContent> & { gate?: Partial<RoiCalculatorContent['gate']> }) | null;
  if (!v) return DEFAULT_ROI;
  return {
    title: v.title || DEFAULT_ROI.title,
    subtitle: v.subtitle || DEFAULT_ROI.subtitle,
    inputs: Array.isArray(v.inputs) && v.inputs.length ? v.inputs : DEFAULT_ROI.inputs,
    submitLabel: v.submitLabel || DEFAULT_ROI.submitLabel,
    gate: {
      title: v.gate?.title || DEFAULT_ROI.gate.title,
      fields: Array.isArray(v.gate?.fields) && v.gate.fields.length ? v.gate.fields : DEFAULT_ROI.gate.fields,
      sampleResult: v.gate?.sampleResult || DEFAULT_ROI.gate.sampleResult,
    },
  };
}
