import { getSupabaseServerClient } from '@/lib/supabase/server';
import ArticlesClient, { type ArticleRow } from './ArticlesClient';

export const dynamic = 'force-dynamic';

async function loadArticles(): Promise<ArticleRow[]> {
  try {
    const s = getSupabaseServerClient();
    const { data, error } = await s
      .from('articles')
      .select('id,slug,title,category,excerpt,body,published,author,read_minutes,published_at,created_at,hero_image_url,hero_alt,seo_title,meta_description,canonical_url,review_status')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ArticleRow[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadArticles();
  return <ArticlesClient initialRows={rows} />;
}
