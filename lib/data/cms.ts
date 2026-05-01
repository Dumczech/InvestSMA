import { getSupabaseServerClient } from '@/lib/supabase/server';
import { properties as fallbackProperties } from '@/data/properties';

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
