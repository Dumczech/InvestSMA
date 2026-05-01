import { getSupabaseServerClient } from '@/lib/supabase/server';
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
    <main className='mx-auto max-w-6xl p-6'>
      <h1 className='text-2xl'>Articles CMS</h1>
      <p className='mt-2 text-white/70'>
        Manage the cards on <code className='text-sand'>/insights</code>. Toggle <strong>Published</strong>{' '}
        to show/hide each article on the public site.
      </p>
      <ArticlesClient initialRows={rows} />
    </main>
  );
}
