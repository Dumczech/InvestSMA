import { getSupabaseServerClient } from '@/lib/supabase/server';
import { properties as fallbackProperties } from '@/data/properties';

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Default content used when Supabase env vars are absent or the matching
// site_content row is missing. Defaults are kept identical to the original
// hardcoded copy so the page is unchanged in mock mode.
const DEFAULT_HOMEPAGE = {
  hero: {
    headline: 'Invest in San Miguel de Allende’s Most Desirable Luxury Rental Market',
    subheadline:
      'Access real rental performance data, curated acquisition opportunities, and turnkey management from one of San Miguel’s leading luxury rental operators.',
  },
  metrics: [
    { label: 'Luxury units managed', value: '45+' },
    { label: 'Guest database',      value: '10,000+' },
    { label: 'Direct booking network', value: 'Strong' },
    { label: 'Concierge & operations', value: 'Full team' },
  ] as Array<{ label: string; value: string }>,
  marketSnapshot: {
    title: 'Market Index Snapshot (Compare View)',
    comparisons: [
      { label: 'ADR',       lrm: '$520', market: '$372'  },
      { label: 'Occupancy', lrm: '68%',  market: '62.4%' },
      { label: 'RevPAR',    lrm: '$354', market: '$232'  },
    ],
    ctaLabel: 'Open Full Dashboard',
    ctaHref: '/market-data',
  },
  gatedCta: {
    title: 'Gated Market Report',
    body: 'Access institutional-grade San Miguel luxury rental signals.',
    ctaLabel: 'Request access',
    ctaHref: '/contact',
  },
};

export type HomepageMarketSnapshot = {
  title: string;
  comparisons: Array<{ label: string; lrm: string; market: string }>;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageGatedCta = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageContent = {
  hero: { headline: string; subheadline: string };
  metrics: Array<{ label: string; value: string }>;
  marketSnapshot: HomepageMarketSnapshot;
  gatedCta: HomepageGatedCta;
  usingMock: boolean;
};

export async function getHomepageContent(): Promise<HomepageContent> {
  if (!hasEnv()) {
    return { ...DEFAULT_HOMEPAGE, usingMock: true };
  }

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('site_content')
    .select('key,value')
    .in('key', ['homepage_hero', 'homepage_metrics', 'homepage_market_snapshot', 'homepage_gated_cta']);

  // value is stored as Json; the CMS keeps arbitrary editor-shaped objects so
  // we narrow at the boundary instead of polluting the schema with view-models.
  const byKey = (k: string) => data?.find(d => d.key === k)?.value;

  const heroRaw = byKey('homepage_hero') as { headline?: string; subheadline?: string } | undefined;
  const metricsRaw = byKey('homepage_metrics') as { items?: Array<{ label: string; value: string }> } | undefined;
  const snapshotRaw = byKey('homepage_market_snapshot') as Partial<HomepageMarketSnapshot> | undefined;
  const gatedRaw = byKey('homepage_gated_cta') as Partial<HomepageGatedCta> | undefined;

  return {
    hero: {
      headline: heroRaw?.headline || DEFAULT_HOMEPAGE.hero.headline,
      subheadline: heroRaw?.subheadline || DEFAULT_HOMEPAGE.hero.subheadline,
    },
    metrics: metricsRaw?.items?.length ? metricsRaw.items : [...DEFAULT_HOMEPAGE.metrics],
    marketSnapshot: {
      title: snapshotRaw?.title || DEFAULT_HOMEPAGE.marketSnapshot.title,
      comparisons: snapshotRaw?.comparisons?.length
        ? snapshotRaw.comparisons
        : [...DEFAULT_HOMEPAGE.marketSnapshot.comparisons],
      ctaLabel: snapshotRaw?.ctaLabel || DEFAULT_HOMEPAGE.marketSnapshot.ctaLabel,
      ctaHref: snapshotRaw?.ctaHref || DEFAULT_HOMEPAGE.marketSnapshot.ctaHref,
    },
    gatedCta: {
      title: gatedRaw?.title || DEFAULT_HOMEPAGE.gatedCta.title,
      body: gatedRaw?.body || DEFAULT_HOMEPAGE.gatedCta.body,
      ctaLabel: gatedRaw?.ctaLabel || DEFAULT_HOMEPAGE.gatedCta.ctaLabel,
      ctaHref: gatedRaw?.ctaHref || DEFAULT_HOMEPAGE.gatedCta.ctaHref,
    },
    usingMock: false,
  };
}

export async function getPublishedProperties() {
  if (!hasEnv()) return fallbackProperties;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('properties').select('*').eq('status', 'published');
  if (!data?.length) return fallbackProperties;
  return data.map((r: any) => ({
    slug: r.slug,
    name: r.name,
    neighborhood: r.neighborhood,
    price: r.price_usd ? `$${Number(r.price_usd).toLocaleString()}` : 'TBD',
    bedrooms: r.bedrooms || 0,
    adr: `$${r.adr_low || 0}–$${r.adr_high || 0}`,
    annualGross: `$${r.annual_gross_low || 0}–$${r.annual_gross_high || 0}`,
    upgradePotential: 'Operational optimization',
    thesis: 'Data-backed opportunity',
    occupancy: 'TBD',
    strategy: 'LRM strategy',
    seasonality: 'Seasonality upside',
    risks: ['Pending'],
    images: ['/hero1.jpg'],
  }));
}

export async function getPublishedArticles() {
  if (!hasEnv()) return [];
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('articles').select('*').eq('published', true);
  return data ?? [];
}

export async function getPropertyBySlug(slug: string) {
  if (!hasEnv()) return fallbackProperties.find(p => p.slug === slug) ?? null;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (!data) return fallbackProperties.find(p => p.slug === slug) ?? null;
  return {
    slug: data.slug,
    name: data.name,
    neighborhood: data.neighborhood,
    price: data.price_usd ? `$${Number(data.price_usd).toLocaleString()}` : 'TBD',
    bedrooms: data.bedrooms || 0,
    adr: `$${data.adr_low || 0}–$${data.adr_high || 0}`,
    annualGross: `$${data.annual_gross_low || 0}–$${data.annual_gross_high || 0}`,
    upgradePotential: data.upgrade_potential || 'Operational optimization',
    thesis: data.investment_thesis || 'Data-backed opportunity',
    occupancy: data.occupancy_assumption || 'TBD',
    strategy: data.strategy || 'LRM strategy',
    seasonality: data.seasonality || 'Seasonality upside',
    risks: Array.isArray(data.risks) ? data.risks : ['Pending'],
    images: Array.isArray(data.images) && data.images.length ? data.images : ['/hero1.jpg'],
  };
}
