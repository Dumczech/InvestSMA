// Property view-model returned by getPublishedProperties / getPropertyBySlug.
// Serializes `risks` and `images` to plain arrays of strings; UI components
// (PropertyCard, memo page) consume this shape rather than the raw DB row.

export type Property = {
  slug: string;
  name: string;
  neighborhood: string;
  price: string;
  bedrooms: number;
  adr: string;
  annualGross: string;
  upgradePotential: string;
  thesis: string;
  occupancy: string;
  strategy: string;
  seasonality: string;
  risks: string[];
  images: string[];
  // Design-bundle additions — optional so the existing fallback data can
  // omit them without compile errors.
  score?: number;
  baths?: number;
  sqm?: number;
  rooftop?: boolean;
  accent2?: string;
  style?: 'colonial' | 'hacienda' | 'villa';
  heroImage?: string;
};
