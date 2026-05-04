'use client';

import { useMemo, useRef, useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/insights.jsx — table list view + 3-tab
// post editor (Content / SEO / Publish settings). Persists what the
// articles schema has (slug, title, category, excerpt, body, published,
// author, read_minutes, published_at). Design fields without backing
// columns yet (hero image, SEO title/desc/canonical, inline media,
// review status) render with TODO_SCHEMA notes.

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  published: boolean;
  author: string | null;
  read_minutes: number | null;
  published_at: string | null;
  created_at: string;
  // 20260504_articles_reports_metadata.sql
  hero_image_url: string | null;
  hero_alt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  review_status: 'draft' | 'review' | 'published' | null;
};

const CATEGORIES = [
  'Market Analysis',
  'Case Study',
  'Guide',
  'Neighborhoods',
  'Buyer Education',
  'Tax & Ownership',
  'Lifestyle',
] as const;

type Status = 'draft' | 'review' | 'published';

const STATUS_BADGE: Record<Status, 'success' | 'warn' | 'info'> = {
  draft: 'warn',
  review: 'info',
  published: 'success',
};

const STATUS_LABEL: Record<Status, string> = {
  draft: 'Draft',
  review: 'Needs review',
  published: 'Published',
};

function statusOfRow(r: ArticleRow): Status {
  // Prefer the explicit review_status column; fall back to the
  // published flag for rows written before the metadata migration.
  if (r.review_status === 'review' || r.review_status === 'draft' || r.review_status === 'published') {
    return r.review_status;
  }
  return r.published ? 'published' : 'draft';
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

// ---------------------------------------------------------------------------

type View = { kind: 'list' } | { kind: 'edit'; slug: string | null };

export default function ArticlesClient({ initialRows }: { initialRows: ArticleRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [view, setView] = useState<View>({ kind: 'list' });

  if (view.kind === 'edit') {
    const editing = view.slug ? rows.find(r => r.slug === view.slug) ?? null : null;
    return (
      <PostEditor
        editing={editing}
        onClose={() => setView({ kind: 'list' })}
        onSaved={(saved) => {
          setRows(prev => {
            const next = prev.filter(p => p.slug !== saved.slug);
            return [saved, ...next];
          });
          setView({ kind: 'edit', slug: saved.slug });
        }}
      />
    );
  }

  return (
    <ArticleListView
      rows={rows}
      onNew={() => setView({ kind: 'edit', slug: null })}
      onEdit={(slug) => setView({ kind: 'edit', slug })}
    />
  );
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function ArticleListView({
  rows, onNew, onEdit,
}: { rows: ArticleRow[]; onNew: () => void; onEdit: (slug: string) => void }) {
  const [filterCat, setFilterCat]       = useState<'all' | string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');

  const filtered = useMemo(() => rows.filter(r => {
    if (filterCat !== 'all' && r.category !== filterCat) return false;
    if (filterStatus !== 'all' && statusOfRow(r) !== filterStatus) return false;
    return true;
  }), [rows, filterCat, filterStatus]);

  const counts = useMemo(() => ({
    published: rows.filter(r => statusOfRow(r) === 'published').length,
    draft:     rows.filter(r => statusOfRow(r) === 'draft').length,
    review:    rows.filter(r => statusOfRow(r) === 'review').length,
  }), [rows]);

  return (
    <div className='main'>
      <Topbar crumbs={['Insights']}>
        <button className='btn btn-sm btn-primary' onClick={onNew}>
          <Icon name='plus' /> New post
        </button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Insights</h1>
            <p className='page-subtitle'>
              {rows.length} posts · {counts.published} published, {counts.draft} draft, {counts.review} in review
            </p>
          </div>
        </div>

        <div className='table-wrap'>
          <div className='table-toolbar'>
            <div className='left'>
              <select
                className='select'
                style={{ width: 180 }}
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
              >
                <option value='all'>All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                className='select'
                style={{ width: 160 }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as 'all' | Status)}
              >
                <option value='all'>All statuses</option>
                <option value='draft'>Draft</option>
                <option value='review'>Needs review</option>
                <option value='published'>Published</option>
              </select>
            </div>
          </div>

          <div className='table-scroll'>
            <table>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th className='num'>Read</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <button
                        className='row-link'
                        onClick={() => onEdit(p.slug)}
                        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}
                      >
                        {p.title}
                      </button>
                      <div className='row-sub mono' style={{ fontSize: 11 }}>/insights/{p.slug}</div>
                    </td>
                    <td><span className='badge badge-outline'>{p.category}</span></td>
                    <td><StatusBadge status={statusOfRow(p)} /></td>
                    <td style={{ fontSize: 12 }}>{p.author ?? '—'}</td>
                    <td className='num mono'>{p.read_minutes ? `${p.read_minutes} min` : '—'}</td>
                    <td className='mono' style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                      {fmtDate(p.published_at ?? p.created_at)}
                    </td>
                    <td>
                      <div className='row gap-4'>
                        <button className='btn btn-icon btn-ghost btn-sm' onClick={() => onEdit(p.slug)} title='Edit'><Icon name='edit' /></button>
                        <button className='btn btn-icon btn-ghost btn-sm' title='More'><Icon name='more' /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className='empty'>
                <div className='empty-icon'><Icon name='book' /></div>
                <h3>No posts match</h3>
                <p>Try changing the filters or write a new post.</p>
                <button className='btn btn-sm btn-primary' onClick={onNew}>New post</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

type EditorTab = 'content' | 'seo' | 'settings';

const EDITOR_TABS: Array<[EditorTab, string]> = [
  ['content',  'Content'],
  ['seo',      'SEO'],
  ['settings', 'Publish settings'],
];

type Draft = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  status: Status;
  author: string;
  publishedAt: string; // YYYY-MM-DD or ''
  heroImageUrl: string;
  heroAlt: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
};

function rowToDraft(r: ArticleRow): Draft {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    excerpt: r.excerpt ?? '',
    body: r.body ?? '',
    status: statusOfRow(r),
    author: r.author ?? 'Justin McCarter',
    publishedAt: r.published_at ? new Date(r.published_at).toISOString().slice(0, 10) : '',
    heroImageUrl: r.hero_image_url ?? '',
    heroAlt: r.hero_alt ?? '',
    seoTitle: r.seo_title ?? '',
    metaDescription: r.meta_description ?? '',
    canonicalUrl: r.canonical_url ?? '',
  };
}

const EMPTY_DRAFT: Draft = {
  slug: '', title: '', category: 'Market Analysis',
  excerpt: '', body: '', status: 'draft',
  author: 'Justin McCarter', publishedAt: '',
  heroImageUrl: '', heroAlt: '',
  seoTitle: '', metaDescription: '', canonicalUrl: '',
};

function draftToPayload(d: Draft) {
  const wordCount = d.body.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const strOrNull = (s: string) => (s.trim() ? s.trim() : null);
  return {
    slug: d.slug.trim(),
    title: d.title.trim(),
    category: d.category,
    excerpt: d.excerpt.trim() || null,
    body: d.body.trim() || null,
    published: d.status === 'published',
    review_status: d.status,
    author: d.author.trim() || null,
    read_minutes: readMinutes,
    published_at: d.publishedAt ? new Date(d.publishedAt).toISOString() : null,
    hero_image_url:   strOrNull(d.heroImageUrl),
    hero_alt:         strOrNull(d.heroAlt),
    seo_title:        strOrNull(d.seoTitle),
    meta_description: strOrNull(d.metaDescription),
    canonical_url:    strOrNull(d.canonicalUrl),
  };
}

function PostEditor({
  editing, onClose, onSaved,
}: {
  editing: ArticleRow | null;
  onClose: () => void;
  onSaved: (row: ArticleRow) => void;
}) {
  const [tab, setTab] = useState<EditorTab>('content');
  const [draft, setDraft] = useState<Draft>(editing ? rowToDraft(editing) : EMPTY_DRAFT);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft(d => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const wordCount = draft.body.trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 220));

  const insertAtCursor = (text: string) => {
    const ta = bodyRef.current;
    if (!ta) { update('body', draft.body + '\n' + text); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = draft.body.slice(0, start) + text + draft.body.slice(end);
    update('body', next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length, start + text.length); }, 0);
  };

  const save = async () => {
    setToast(null);
    if (!draft.slug.trim() || !draft.title.trim()) {
      setToast({ tone: 'err', msg: 'Slug and title are required.' });
      return;
    }
    setBusy(true);
    try {
      const payload = draftToPayload(draft);
      const r = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Save failed');
      const saved: ArticleRow = {
        id: editing?.id ?? `tmp-${payload.slug}`,
        created_at: editing?.created_at ?? new Date().toISOString(),
        ...payload,
      };
      onSaved(saved);
      setDirty(false);
      setToast({ tone: 'ok', msg: `Saved "${payload.title}".` });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setDraft(editing ? rowToDraft(editing) : EMPTY_DRAFT);
    setDirty(false);
    setToast(null);
  };

  const titlePreview = editing ? editing.title.slice(0, 40) + (editing.title.length > 40 ? '…' : '') : 'New post';

  return (
    <div className='main'>
      <Topbar crumbs={['Insights', titlePreview]}>
        <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{wordCount} words · {readMin} min read</span>
        <button className='btn btn-sm btn-ghost' onClick={onClose}><Icon name='close' /> Close</button>
        <button className='btn btn-sm'><Icon name='eye' /> Preview</button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <div className='row gap-8' style={{ marginBottom: 4 }}>
              <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{editing?.id?.slice(0, 8) ?? 'NEW'}</span>
              <StatusBadge status={draft.status} />
            </div>
            <input
              className='input'
              value={draft.title}
              onChange={e => update('title', e.target.value)}
              placeholder='Post title'
              style={{ fontSize: 22, fontWeight: 600, padding: '6px 8px', border: '1px solid transparent', background: 'transparent', maxWidth: 720 }}
            />
          </div>
        </div>

        <div className='tabs'>
          {EDITOR_TABS.map(([k, l]) => (
            <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
          ))}
        </div>

        {tab === 'content' && (
          <ContentTab
            draft={draft}
            update={update}
            bodyRef={bodyRef}
            insertAtCursor={insertAtCursor}
            wordCount={wordCount}
            readMin={readMin}
          />
        )}
        {tab === 'seo'      && <SeoTab draft={draft} update={update} />}
        {tab === 'settings' && <SettingsTab draft={draft} update={update} />}

        {toast && (
          <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
            {toast.msg}
          </div>
        )}
      </div>

      <div className='save-bar'>
        <div className={`status ${dirty ? '' : 'saved'}`}>
          <span className='dot' />
          <span>{dirty ? 'Unsaved changes' : (editing ? `Saved ${fmtDate(editing.created_at)}` : 'Not saved yet')}</span>
        </div>
        <div className='actions'>
          <button className='btn btn-sm' onClick={discard} disabled={!dirty || busy}>Discard</button>
          <button className='btn btn-sm btn-primary' onClick={save} disabled={!dirty || busy}>
            <Icon name='save' /> {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentTab({
  draft, update, bodyRef, insertAtCursor, wordCount, readMin,
}: {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  bodyRef: React.RefObject<HTMLTextAreaElement>;
  insertAtCursor: (s: string) => void;
  wordCount: number;
  readMin: number;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className='post-editor-grid'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className='card'>
          <div className='card-head'>
            <div>
              <h3 className='card-title'>Hero image</h3>
              <p className='card-subtitle'>1600×900 recommended · paste a Media Library path or absolute URL</p>
            </div>
          </div>
          <div className='card-body col gap-12'>
            <div className='field'>
              <label className='label'>Hero image URL</label>
              <input
                className='input'
                value={draft.heroImageUrl}
                onChange={e => update('heroImageUrl', e.target.value)}
                placeholder='insights/centro-q1/hero.jpg'
              />
            </div>
            <div className='field'>
              <label className='label'>Alt text <span className='help'>accessibility + SEO</span></label>
              <input
                className='input'
                value={draft.heroAlt}
                onChange={e => update('heroAlt', e.target.value)}
                placeholder='Aerial view of Centro at golden hour'
              />
            </div>
            {draft.heroImageUrl ? (
              <div style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.heroImageUrl.startsWith('http') ? draft.heroImageUrl : `/${draft.heroImageUrl.replace(/^\/+/, '')}`}
                  alt={draft.heroAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{ aspectRatio: '16/9', border: '2px dashed var(--border-strong)', borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--fg-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <Icon name='upload' style={{ width: 32, height: 32, opacity: 0.4, marginBottom: 6 }} />
                  <div style={{ fontSize: 12 }}>No hero image yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='card'>
          <div className='card-head'>
            <div>
              <h3 className='card-title'>Excerpt</h3>
              <p className='card-subtitle'>Shown in lists, search snippets, and social previews</p>
            </div>
            <span className='mono' style={{ fontSize: 11, color: draft.excerpt.length > 200 ? 'var(--status-danger)' : 'var(--fg-subtle)' }}>
              {draft.excerpt.length}/200
            </span>
          </div>
          <div className='card-body'>
            <textarea
              className='textarea'
              rows={2}
              value={draft.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              placeholder='One- or two-sentence summary.'
            />
          </div>
        </div>

        <div className='card'>
          <div className='card-head'>
            <h3 className='card-title'>Body</h3>
            <div className='row gap-4' style={{ flexWrap: 'wrap' }}>
              <button className='btn btn-icon btn-sm btn-ghost' title='Bold'   onClick={() => insertAtCursor('**bold**')}><strong>B</strong></button>
              <button className='btn btn-icon btn-sm btn-ghost' title='Italic' onClick={() => insertAtCursor('*italic*')}><em>I</em></button>
              <button className='btn btn-sm btn-ghost' onClick={() => insertAtCursor('\n## Heading\n')}>H2</button>
              <button className='btn btn-sm btn-ghost' onClick={() => insertAtCursor('\n### Subheading\n')}>H3</button>
              <button className='btn btn-icon btn-sm btn-ghost' title='Link'        onClick={() => insertAtCursor('[link text](https://)')}><Icon name='link' /></button>
              <button className='btn btn-icon btn-sm btn-ghost' title='Bullet list' onClick={() => insertAtCursor('\n- item\n- item\n')}><Icon name='list' /></button>
              <button className='btn btn-icon btn-sm btn-ghost' title='Quote'       onClick={() => insertAtCursor('\n> quote\n')}>&ldquo;</button>
            </div>
          </div>
          <div className='card-body'>
            <textarea
              ref={bodyRef}
              className='textarea'
              rows={20}
              value={draft.body}
              onChange={e => update('body', e.target.value)}
              placeholder='Write the post body. Markdown supported.'
              style={{ fontFamily: 'var(--f-mono)', fontSize: 13, lineHeight: 1.7 }}
            />
            <div className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 6 }}>
              Markdown · supports **bold**, *italic*, [links](), ## headings, &gt; quotes, - lists.
              Inline media (<code>[INLINE-IMAGE: token]</code>) requires the article_inline_media table to ship.
            </div>
          </div>
        </div>
      </div>

      {/* Right rail: live preview + stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
        <div className='card'>
          <div className='card-head'><h3 className='card-title' style={{ fontSize: 13 }}>Search preview</h3></div>
          <div className='card-body'>
            <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--f-mono)' }}>
              investsma.com › insights › {draft.slug || 'post-slug'}
            </div>
            <div style={{ color: '#1a0dab', fontSize: 16, fontWeight: 400, marginTop: 4, lineHeight: 1.3 }}>
              {draft.title || 'Post title'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4, lineHeight: 1.5 }}>
              {draft.excerpt || 'Excerpt appears here in search results…'}
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-head'><h3 className='card-title' style={{ fontSize: 13 }}>Social card</h3></div>
          <div className='card-body' style={{ padding: 0 }}>
            <div style={{ aspectRatio: '1.91', background: 'var(--bg-subtle)' }} />
            <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>investsma.com</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3, lineHeight: 1.35 }}>{draft.title || 'Post title'}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.4 }}>{draft.excerpt.slice(0, 90) || 'Excerpt…'}</div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-head'><h3 className='card-title' style={{ fontSize: 13 }}>Stats</h3></div>
          <div className='card-body' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
            <StatBox label='Words'      v={String(wordCount)} />
            <StatBox label='Read time'  v={`${readMin} min`} />
            <StatBox label='Category'   v={draft.category.slice(0, 12)} />
            <StatBox label='Status'     v={STATUS_LABEL[draft.status]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className='muted' style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div className='mono' style={{ fontWeight: 600, fontSize: 16 }}>{v}</div>
    </div>
  );
}

function SeoTab({
  draft, update,
}: {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
}) {
  return (
    <div className='card'>
      <div className='card-head'>
        <h3 className='card-title'>SEO</h3>
        <p className='card-subtitle'>Used for search engines and social sharing</p>
      </div>
      <div className='card-body col gap-16'>
        <div className='field'>
          <label className='label'>URL slug</label>
          <div className='input-group'>
            <div className='addon'>/insights/</div>
            <input className='input' value={draft.slug} onChange={e => update('slug', e.target.value)} />
          </div>
        </div>
        <div className='field'>
          <label className='label'>SEO title <span className='help'>{draft.seoTitle.length}/60</span></label>
          <input
            className='input'
            value={draft.seoTitle}
            onChange={e => update('seoTitle', e.target.value)}
            placeholder='Centro Q1 2026: ADR climbs 8.2% as inventory tightens'
          />
        </div>
        <div className='field'>
          <label className='label'>Meta description <span className='help'>{draft.metaDescription.length}/155</span></label>
          <textarea
            className='textarea'
            rows={2}
            value={draft.metaDescription}
            onChange={e => update('metaDescription', e.target.value)}
            placeholder="Centro's Q4 numbers tell a story of structural decoupling — and a widening spread that's hard to explain by seasonality alone."
          />
        </div>
        <div className='field'>
          <label className='label'>Canonical URL</label>
          <input
            className='input'
            value={draft.canonicalUrl}
            onChange={e => update('canonicalUrl', e.target.value)}
            placeholder='https://investsma.com/insights/centro-q1-2026'
          />
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  draft, update,
}: {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
}) {
  return (
    <div className='grid-2'>
      <div className='card'>
        <div className='card-head'>
          <h3 className='card-title'>Status</h3>
          <span className='card-subtitle'>review status not yet stored</span>
        </div>
        <div className='card-body col gap-8'>
          {(['draft', 'review', 'published'] as Status[]).map(v => (
            <label
              key={v}
              className='row gap-12'
              style={{
                padding: 12,
                border: `1px solid ${draft.status === v ? 'var(--fg)' : 'var(--border)'}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <input
                type='radio'
                name='ps'
                checked={draft.status === v}
                onChange={() => update('status', v)}
              />
              <StatusBadge status={v} />
            </label>
          ))}
        </div>
      </div>

      <div className='card'>
        <div className='card-head'><h3 className='card-title'>Metadata</h3></div>
        <div className='card-body col gap-12'>
          <div className='field'>
            <label className='label'>Category</label>
            <select className='select' value={draft.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className='field'>
            <label className='label'>Author</label>
            <input className='input' value={draft.author} onChange={e => update('author', e.target.value)} />
          </div>
          <div className='field'>
            <label className='label'>Publish date</label>
            <input
              type='date'
              className='input'
              value={draft.publishedAt}
              onChange={e => update('publishedAt', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
