'use client';

import { useMemo, useState } from 'react';
import { Button, Checkbox, Field, Select, StatusPill, TextArea, TextInput, Toast } from '../_components/forms';

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  published: boolean;
  created_at: string;
};

const CATEGORIES = [
  'Market reports',
  'Buyer education',
  'Investment guides',
  'Case studies',
  'News',
] as const;

type Category = (typeof CATEGORIES)[number] | 'Other';

type Draft = {
  slug: string;
  title: string;
  category: Category;
  excerpt: string;
  body: string;
  published: boolean;
};

const EMPTY: Draft = {
  slug: '', title: '', category: 'Market reports',
  excerpt: '', body: '', published: false,
};

function rowToDraft(r: ArticleRow): Draft {
  const cat = (CATEGORIES as readonly string[]).includes(r.category) ? (r.category as Category) : 'Other';
  return {
    slug: r.slug,
    title: r.title,
    category: cat,
    excerpt: r.excerpt ?? '',
    body: r.body ?? '',
    published: r.published,
  };
}

export default function ArticlesClient({ initialRows }: { initialRows: ArticleRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [editingSlug, setEditingSlug] = useState<string | null>(initialRows[0]?.slug ?? null);
  const [draft, setDraft] = useState<Draft>(initialRows[0] ? rowToDraft(initialRows[0]) : EMPTY);
  const [customCategory, setCustomCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const editing = useMemo(() => rows.find(r => r.slug === editingSlug) ?? null, [rows, editingSlug]);

  const select = (slug: string) => {
    setToast(null);
    const row = rows.find(r => r.slug === slug);
    if (!row) return;
    setEditingSlug(slug);
    setDraft(rowToDraft(row));
    setCustomCategory(row.category && !(CATEGORIES as readonly string[]).includes(row.category) ? row.category : '');
  };

  const startNew = () => {
    setToast(null);
    setEditingSlug(null);
    setDraft(EMPTY);
    setCustomCategory('');
  };

  const save = async () => {
    setToast(null);
    if (!draft.slug.trim() || !draft.title.trim()) {
      setToast({ tone: 'err', msg: 'Slug and title are required.' });
      return;
    }
    const finalCategory = draft.category === 'Other' ? customCategory.trim() : draft.category;
    if (!finalCategory) {
      setToast({ tone: 'err', msg: 'Category is required.' });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        slug: draft.slug.trim(),
        title: draft.title.trim(),
        category: finalCategory,
        excerpt: draft.excerpt.trim() || null,
        body: draft.body.trim() || null,
        published: draft.published,
      };
      const r = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      setToast({ tone: 'ok', msg: `Saved "${payload.title}".` });
      setRows(prev => {
        const next = prev.filter(p => p.slug !== payload.slug);
        const synthetic: ArticleRow = {
          id: editing?.id ?? `tmp-${payload.slug}`,
          created_at: editing?.created_at ?? new Date().toISOString(),
          ...payload,
        };
        return [synthetic, ...next];
      });
      setEditingSlug(payload.slug);
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
      <aside className='card' style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px' }}>
          <span className='muted' style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Articles
          </span>
          <Button variant='ghost' size='sm' onClick={startNew}>+ New</Button>
        </div>
        {rows.length === 0 && (
          <div className='muted' style={{ fontSize: 13, padding: '0 8px' }}>No articles yet — click <em>New</em>.</div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map(r => (
            <li key={r.slug}>
              <button
                onClick={() => select(r.slug)}
                className='btn btn-ghost'
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: editingSlug === r.slug ? 'var(--bg-subtle)' : 'transparent',
                  borderColor: editingSlug === r.slug ? 'var(--border)' : 'transparent',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', minWidth: 0 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {r.title}
                  </span>
                  <span className='muted' style={{ fontSize: 11 }}>{r.category} · {r.slug}</span>
                </span>
                <StatusPill status={r.published ? 'published' : 'draft'} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className='card' style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className='grid gap-3 md:grid-cols-2'>
          <Field label='Slug' hint='URL-safe identifier'>
            <TextInput value={draft.slug} onChange={v => setField('slug', v)} placeholder='sma-investment-trends-2026' />
          </Field>
          <Field label='Category'>
            <Select<Category>
              value={draft.category}
              onChange={v => setField('category', v)}
              options={[
                ...CATEGORIES.map(c => ({ value: c as Category, label: c })),
                { value: 'Other', label: 'Other (custom)' },
              ]}
            />
          </Field>
        </div>

        {draft.category === 'Other' && (
          <Field label='Custom category'>
            <TextInput value={customCategory} onChange={setCustomCategory} placeholder='e.g. Operations playbook' />
          </Field>
        )}

        <Field label='Title'>
          <TextInput value={draft.title} onChange={v => setField('title', v)} placeholder='Is San Miguel a Good Real Estate Investment?' />
        </Field>

        <Field label='Excerpt' hint='Short summary shown on /insights cards'>
          <TextArea value={draft.excerpt} onChange={v => setField('excerpt', v)} rows={2} />
        </Field>

        <Field label='Body' hint='Full article content (Markdown / plain text)'>
          <TextArea value={draft.body} onChange={v => setField('body', v)} rows={12} />
        </Field>

        <Checkbox checked={draft.published} onChange={v => setField('published', v)} label='Published (visible on /insights)' />

        <div className='flex items-center gap-2'>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Update article' : 'Create article'}
          </Button>
          {editing && (
            <span className='muted' style={{ fontSize: 12 }}>
              Created {new Date(editing.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {toast && <Toast tone={toast.tone}>{toast.msg}</Toast>}
      </section>
    </div>
  );
}
