import { getSupabaseServerClient } from '@/lib/supabase/server';
export default async function Page(){
  let count: number | string = 'N/A';
  try { const supabase=getSupabaseServerClient(); const { count: c } = await supabase.from('market_reports').select('*',{count:'exact',head:true}); count=c ?? 0; } catch {}
  return <main className='mx-auto max-w-5xl p-6'><h1 className='text-2xl capitalize'>market-reports Admin</h1><p className='mt-2 text-white/70'>Total records: {count}</p><p className='text-xs text-white/50 mt-4'>TODO: add create/edit flows, CSV imports, and report downloads.</p></main>
}
