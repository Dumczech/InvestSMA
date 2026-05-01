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

export async function getPublishedProperties(){
  if(!hasEnv()) return fallbackProperties;
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('properties').select('*').eq('status','published');
  if(!data?.length) return fallbackProperties;
  return data.map((r:any)=>({slug:r.slug,name:r.name,neighborhood:r.neighborhood,price:r.price_usd?`$${Number(r.price_usd).toLocaleString()}`:'TBD',bedrooms:r.bedrooms||0,adr:`$${r.adr_low||0}–$${r.adr_high||0}`,annualGross:`$${r.annual_gross_low||0}–$${r.annual_gross_high||0}`,upgradePotential:'Operational optimization',thesis:'Data-backed opportunity',occupancy:'TBD',strategy:'LRM strategy',seasonality:'Seasonality upside',risks:['Pending'],images:['/hero1.jpg']}));
}

export async function getPublishedArticles(){
  if(!hasEnv()) return [];
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('articles').select('*').eq('published',true);
  return data ?? [];
}


export async function getPropertyBySlug(slug:string){
  if(!hasEnv()) return fallbackProperties.find((p)=>p.slug===slug) ?? null;
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('properties').select('*').eq('slug',slug).eq('status','published').maybeSingle();
  if(!data) return fallbackProperties.find((p)=>p.slug===slug) ?? null;
  return {
    slug:data.slug,
    name:data.name,
    neighborhood:data.neighborhood,
    price:data.price_usd?`$${Number(data.price_usd).toLocaleString()}`:'TBD',
    bedrooms:data.bedrooms||0,
    adr:`$${data.adr_low||0}–$${data.adr_high||0}`,
    annualGross:`$${data.annual_gross_low||0}–$${data.annual_gross_high||0}`,
    upgradePotential:data.upgrade_potential||'Operational optimization',
    thesis:data.investment_thesis||'Data-backed opportunity',
    occupancy:data.occupancy_assumption||'TBD',
    strategy:data.strategy||'LRM strategy',
    seasonality:data.seasonality||'Seasonality upside',
    risks:Array.isArray(data.risks)?data.risks:['Pending'],
    images:Array.isArray(data.images)&&data.images.length?data.images:['/hero1.jpg']
  };
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

// ============================================================
// Legal page content (Disclosures + Terms of Use).
// Each clause is shaped exactly like the design's source-of-truth array.
// ============================================================

export type LegalClause = {
  n: string;          // "01", "02", ...
  t: string;          // title
  d: string;          // body paragraph
  list?: string[];    // optional bulleted sub-items (e.g. limitation of liability)
};

export type LegalContent = {
  disclosures: LegalClause[];
  terms: LegalClause[];
  lastUpdated: string;  // ISO date
  docCode: string;      // "INV-LGL-2026-Q2"
  version: string;      // "v1.0"
};

const DEFAULT_DISCLOSURES: LegalClause[] = [
  { n: '01', t: 'Not a real estate brokerage',
    d: 'InvestSMA is not a licensed real estate broker or agent. We do not represent buyers or sellers in real estate transactions. We may refer clients to licensed agents or collaborate with agents selected by the client, but we do not participate in brokerage activities or earn commissions from the sale of real estate unless explicitly disclosed.' },
  { n: '02', t: 'No investment, legal, or tax advice',
    d: 'All information provided by InvestSMA is for informational purposes only. Nothing on this website or in our communications should be interpreted as investment, legal, or tax advice. Investors are responsible for conducting their own due diligence and should consult with licensed professionals before making any investment decisions.' },
  { n: '03', t: 'Performance and ROI projections',
    d: 'Any financial projections, income estimates, or return assumptions are based on historical operating data, market trends, and internal analysis. These projections are not guarantees of future performance. Actual results may vary significantly due to market conditions, property-specific factors, regulatory changes, and other variables outside of our control.' },
  { n: '04', t: 'Operational performance',
    d: 'While Luxury Rental Management has a track record of strong performance across its portfolio, past performance is not indicative of future results. Individual property performance will depend on a variety of factors including location, design, pricing strategy, competition, and market demand.' },
  { n: '05', t: 'Third-party relationships',
    d: 'We may introduce clients to third-party service providers, including real estate agents, attorneys, designers, and contractors. These parties operate independently, and InvestSMA is not responsible for their actions, services, or outcomes.' },
  { n: '06', t: 'No guarantees',
    d: 'InvestSMA does not guarantee occupancy rates, rental income, property appreciation, or investment returns. All investments carry risk, and investors should be prepared for variability in performance.' },
  { n: '07', t: 'Investor responsibility',
    d: 'All investment decisions are made solely by the investor. By using this website or engaging with InvestSMA, you acknowledge that you are responsible for evaluating the risks and merits of any investment.' },
];

const DEFAULT_TERMS: LegalClause[] = [
  { n: '01', t: 'Use of information',
    d: 'The content on this website is provided for general informational purposes only. While InvestSMA aims to provide accurate and up-to-date information, we make no representations or warranties regarding the completeness, accuracy, or reliability of any content.' },
  { n: '02', t: 'No reliance',
    d: 'You agree not to rely solely on the information provided on this website when making investment decisions. Any reliance you place on such information is strictly at your own risk.' },
  { n: '03', t: 'No advisory relationship',
    d: 'Your use of this website or communication with InvestSMA does not create an advisory, fiduciary, or agency relationship. We do not act as your financial advisor, real estate broker, or legal representative.' },
  { n: '04', t: 'Limitation of liability',
    d: 'To the fullest extent permitted by law, InvestSMA and its affiliates shall not be liable for any direct, indirect, incidental, or consequential losses or damages arising from:',
    list: [
      'Use of or reliance on this website',
      'Investment decisions made based on our content',
      'Errors or omissions in information provided',
      'Actions taken by third-party service providers',
    ] },
  { n: '05', t: 'Third-party links and services',
    d: 'This website may contain links to third-party websites or references to third-party services. InvestSMA does not control or endorse these third parties and is not responsible for their content, services, or practices.' },
  { n: '06', t: 'Intellectual property',
    d: 'All content on this website, including text, branding, and materials, is the property of InvestSMA unless otherwise stated. You may not reproduce, distribute, or use this content without prior written permission.' },
  { n: '07', t: 'Modifications',
    d: 'InvestSMA reserves the right to update or modify these Terms of Use at any time without prior notice. Continued use of the website constitutes acceptance of any changes.' },
  { n: '08', t: 'Governing law',
    d: 'These Terms shall be governed by and interpreted in accordance with applicable laws, without regard to conflict of law principles.' },
];

const DEFAULT_LEGAL: LegalContent = {
  disclosures: DEFAULT_DISCLOSURES,
  terms: DEFAULT_TERMS,
  lastUpdated: '2026-04-30',
  docCode: 'INV-LGL-2026-Q2',
  version: 'v1.0',
};

function coerceClauses(raw: unknown): LegalClause[] | null {
  if (!Array.isArray(raw)) return null;
  const out: LegalClause[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (typeof r.n !== 'string' || typeof r.t !== 'string' || typeof r.d !== 'string') continue;
    const list = Array.isArray(r.list) ? r.list.filter((x): x is string => typeof x === 'string') : undefined;
    out.push({ n: r.n, t: r.t, d: r.d, ...(list && list.length ? { list } : {}) });
  }
  return out.length ? out : null;
}

export async function getLegalContent(): Promise<LegalContent> {
  if (!hasEnv()) return DEFAULT_LEGAL;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('key,value,updated_at')
    .in('key', ['legal_disclosures', 'legal_terms', 'legal_meta']);

  const findValue = (k: string) =>
    data?.find(d => d.key === k)?.value as Record<string, unknown> | undefined;

  const disclosuresRaw = findValue('legal_disclosures');
  const termsRaw = findValue('legal_terms');
  const metaRaw = findValue('legal_meta');

  const disclosures =
    coerceClauses((disclosuresRaw as { items?: unknown })?.items) ?? DEFAULT_DISCLOSURES;
  const terms =
    coerceClauses((termsRaw as { items?: unknown })?.items) ?? DEFAULT_TERMS;

  const lastUpdated =
    typeof metaRaw?.lastUpdated === 'string' ? metaRaw.lastUpdated : DEFAULT_LEGAL.lastUpdated;
  const docCode =
    typeof metaRaw?.docCode === 'string' ? metaRaw.docCode : DEFAULT_LEGAL.docCode;
  const version =
    typeof metaRaw?.version === 'string' ? metaRaw.version : DEFAULT_LEGAL.version;

  return { disclosures, terms, lastUpdated, docCode, version };
}

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
