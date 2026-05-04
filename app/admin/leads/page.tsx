import { getSupabaseServerClient } from '@/lib/supabase/server';
import LeadsClient, { type Lead } from './LeadsClient';

export const dynamic = 'force-dynamic';

async function load(): Promise<Lead[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('leads')
      .select('id,name,email,phone,budget,timeline,buyer_type,neighborhoods,message,source_page,status,source,assigned_to,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as Lead[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const leads = await load();
  return <LeadsClient initialLeads={leads} />;
}
