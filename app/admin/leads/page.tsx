import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';

export const dynamic = 'force-dynamic';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  buyer_type: string | null;
  source_page: string | null;
  created_at: string;
};

async function load(): Promise<Lead[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('leads')
      .select('id,name,email,phone,budget,timeline,buyer_type,source_page,created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as Lead[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const leads = await load();
  return (
    <div className='main'>
      <Topbar crumbs={['Leads']}>
        <button className='btn btn-sm'><Icon name='download' /> Export CSV</button>
      </Topbar>
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Leads</h1>
            <p className='page-subtitle'>
              Inbound from <code>/contact</code> and the ROI calculator gate. Most-recent 100 shown.
            </p>
          </div>
        </div>
        {leads.length === 0 ? (
          <div className='empty'>
            <div className='empty-icon'><Icon name='leads' /></div>
            <h3>No leads yet</h3>
            <p>The first inbound from <code>/contact</code> will appear here.</p>
          </div>
        ) : (
          <div className='table-wrap'>
            <div className='table-scroll'>
              <table>
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Budget</th>
                    <th>Timeline</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id}>
                      <td className='muted' style={{ whiteSpace: 'nowrap' }}>
                        {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 500 }}>{l.name}</td>
                      <td>{l.email}</td>
                      <td className='muted'>{l.phone ?? '—'}</td>
                      <td className='muted'>{l.budget ?? '—'}</td>
                      <td className='muted'>{l.timeline ?? '—'}</td>
                      <td className='muted'>{l.source_page ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
