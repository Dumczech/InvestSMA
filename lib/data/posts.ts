import { getSupabaseServerClient } from '@/lib/supabase/server';

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Section blocks the post detail page knows how to render. Mirrors the
// design's content shape; keep narrow types so /admin/articles edits get
// caught at the boundary instead of crashing the page.
export type PostSection =
  | { kind: 'h2'; text: string }
  | { kind: 'p'; text: string }
  | {
      kind: 'stats';
      items: Array<{ val: string; label: string; delta?: string }>;
    }
  | { kind: 'callout'; text: string; tone?: 'sand' | 'green' };

export type PostMeta = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO
  readMinutes: number;
  excerpt: string;
  accent: string;
};

export type PostDetail = PostMeta & {
  deck: string;
  author: string;
  authorRole: string | null;
  sections: PostSection[];
  related: string[];
};

const DEFAULT_ACCENT = '#1F3A2E';

function coerceSections(raw: unknown): PostSection[] {
  if (!Array.isArray(raw)) return [];
  const out: PostSection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (r.kind === 'h2' && typeof r.text === 'string') {
      out.push({ kind: 'h2', text: r.text });
    } else if (r.kind === 'p' && typeof r.text === 'string') {
      out.push({ kind: 'p', text: r.text });
    } else if (r.kind === 'stats' && Array.isArray(r.items)) {
      type StatItem = { val: string; label: string; delta?: string };
      const items: StatItem[] = [];
      for (const it of r.items) {
        if (!it || typeof it !== 'object') continue;
        const i = it as Record<string, unknown>;
        if (typeof i.val !== 'string' || typeof i.label !== 'string') continue;
        const stat: StatItem = { val: i.val, label: i.label };
        if (typeof i.delta === 'string') stat.delta = i.delta;
        items.push(stat);
      }
      if (items.length) out.push({ kind: 'stats', items });
    } else if (r.kind === 'callout' && typeof r.text === 'string') {
      out.push({
        kind: 'callout',
        text: r.text,
        tone: r.tone === 'green' || r.tone === 'sand' ? r.tone : undefined,
      });
    }
  }
  return out;
}

function rowToMeta(r: any): PostMeta {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.published_at || r.created_at,
    readMinutes: typeof r.read_minutes === 'number' ? r.read_minutes : 8,
    excerpt: r.excerpt || '',
    accent: typeof r.accent === 'string' && r.accent ? r.accent : DEFAULT_ACCENT,
  };
}

function rowToDetail(r: any): PostDetail {
  return {
    ...rowToMeta(r),
    deck: r.deck || r.excerpt || '',
    author: r.author || 'LRM Editorial',
    authorRole: r.author_role || null,
    sections: coerceSections(r.body_json),
    related: Array.isArray(r.related)
      ? r.related.filter((x: unknown): x is string => typeof x === 'string')
      : [],
  };
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  if (!hasEnv()) return [];
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false });
  return (data ?? []).map(rowToMeta);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!hasEnv()) return null;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (!data) return null;
  return rowToDetail(data);
}

export async function getRelatedPostsByIds(ids: string[]): Promise<PostMeta[]> {
  if (!hasEnv() || !ids.length) return [];
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .in('slug', ids)
    .eq('published', true);
  // Preserve the order specified in `ids` (used by the design's Related strip).
  const bySlug = new Map((data ?? []).map(r => [r.slug, rowToMeta(r)]));
  return ids.map(id => bySlug.get(id)).filter((x): x is PostMeta => x !== undefined);
}
