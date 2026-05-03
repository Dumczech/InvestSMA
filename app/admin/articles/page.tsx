import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Icon } from '../AdminShell';
import ArticlesClient, { type ArticleRow } from './ArticlesClient';

export const dynamic = 'force-dynamic';

async function loadArticles(): Promise<ArticleRow[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s.from('articles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ArticleRow[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadArticles();
  return (
    <div className='main'>
      <Topbar crumbs={['Insights']}>
        <button className='btn btn-sm btn-primary'><Icon name='plus' /> New article</button>
      </Topbar>
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Insights</h1>
            <p className='page-subtitle'>
              Editorial articles published on <code>/insights</code>. Toggle <code>Published</code> to show/hide each.
            </p>
          </div>
        </div>
        <ArticlesClient initialRows={rows} />
      </div>
    </div>
  );
}
