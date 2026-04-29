import { getSupabaseServerClient } from '@/lib/supabase/server';
import { properties as fallbackProperties } from '@/data/properties';

const hasEnv=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function getHomepageContent(){
  if(!hasEnv()) return {hero:{headline:'Invest in San Miguel de Allende’s Most Desirable Luxury Rental Market',subheadline:'Access real rental performance data, curated acquisition opportunities, and turnkey management from one of San Miguel’s leading luxury rental operators.'},metrics:[{label:'Luxury units managed',value:'45+'},{label:'Guest database',value:'10,000+'},{label:'Direct booking network',value:'Strong'},{label:'Concierge & operations',value:'Full team'}],usingMock:true};
  const supabase=getSupabaseServerClient();
  const {data}=await supabase.from('site_content').select('key,value').in('key',['homepage_hero','homepage_metrics']);
  const hero=(data?.find((d:any)=>d.key==='homepage_hero')?.value) || {};
  const metrics=(data?.find((d:any)=>d.key==='homepage_metrics')?.value?.items) || [];
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
