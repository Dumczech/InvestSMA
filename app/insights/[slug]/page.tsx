import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getRelatedPostsByIds, type PostSection, type PostMeta } from '@/lib/data/posts';
import { Disclaimer, StickyCTA } from '@/components/site';

export const dynamic = 'force-dynamic';

// Site origin used in SEO metadata + JSON-LD. Override via env at deploy
// time; falls back to the production domain.
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investsanmiguel.com').replace(/\/$/, '');

// Format dates for the design's "Apr 18, 2026" header.
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Insight not found · InvestSMA' };

  const url = `${SITE_ORIGIN}/insights/${slug}`;
  const description = post.deck || post.excerpt || post.title;
  const ogImage = `${SITE_ORIGIN}/og-default.jpg`;

  return {
    title: `${post.title} · InvestSMA`,
    description,
    keywords: [
      post.category,
      'San Miguel de Allende',
      'SMA investment',
      'luxury rental',
      'real estate Mexico',
    ].join(', '),
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'InvestSMA',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_ORIGIN}/insights/${slug}`;
  const description = post.deck || post.excerpt || post.title;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: post.title,
    description,
    image: `${SITE_ORIGIN}/og-default.jpg`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      ...(post.authorRole ? { jobTitle: post.authorRole } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'InvestSMA',
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/og-default.jpg` },
    },
    articleSection: post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_ORIGIN}/insights` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const related = await getRelatedPostsByIds(post.related);
  const initials = post.author
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2);
  const dateLabel = fmtDate(post.date);

  // TOC: only h2 sections, numbered.
  const tocSections = post.sections.filter((s): s is { kind: 'h2'; text: string } => s.kind === 'h2');

  return (
    <div className='doc-page' data-screen-label={`Post-${slug}`}>
      {/* JSON-LD: Article + BreadcrumbList. Inlined so it ships in the
          server-rendered HTML where crawlers can read it. */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ===== HERO ===== */}
      <section
        className='surface-dark'
        style={{
          background: '#14130F',
          color: '#F5EFE2',
          padding: '64px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${post.accent} 0%, #14130F 80%)`,
            opacity: 0.85,
          }}
        />
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}
          preserveAspectRatio='xMidYMid slice'
        >
          <pattern id='post-grid' x='0' y='0' width='48' height='48' patternUnits='userSpaceOnUse'>
            <line x1='0' y1='0' x2='0' y2='48' stroke='#C9A55A' strokeWidth='0.5' />
            <line x1='0' y1='0' x2='48' y2='0' stroke='#C9A55A' strokeWidth='0.5' />
          </pattern>
          <rect width='100%' height='100%' fill='url(#post-grid)' />
        </svg>
        <div className='container' style={{ position: 'relative' }}>
          <div
            className='mono'
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(245,239,226,0.6)',
              display: 'flex',
              gap: 12,
              marginBottom: 32,
              flexWrap: 'wrap',
            }}
          >
            <Link href='/insights' style={{ color: '#C9A55A' }}>
              ← All insights
            </Link>
            <span>·</span>
            <span>{post.category}</span>
            <span>·</span>
            <span>{dateLabel}</span>
            <span>·</span>
            <span>{post.readMinutes} min</span>
          </div>
          <h1
            className='display'
            style={{
              fontSize: 'clamp(40px, 5vw, 72px)',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              maxWidth: 1080,
              margin: 0,
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              marginTop: 32,
              fontSize: 20,
              lineHeight: 1.5,
              color: 'rgba(245,239,226,0.82)',
              maxWidth: 760,
              fontFamily: 'var(--f-display)',
              fontStyle: 'italic',
            }}
          >
            {post.deck}
          </p>
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              paddingTop: 24,
              borderTop: '1px solid rgba(245,239,226,0.15)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#C9A55A',
                display: 'grid',
                placeItems: 'center',
                color: '#14130F',
                fontFamily: 'var(--f-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                className='mono'
                style={{ fontSize: 12, color: '#F5EFE2', letterSpacing: '0.04em' }}
              >
                {post.author}
              </div>
              {post.authorRole && (
                <div
                  className='mono'
                  style={{
                    fontSize: 10,
                    color: 'rgba(245,239,226,0.55)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  {post.authorRole}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY ===== */}
      <article style={{ background: '#FBF8F0', padding: '80px 0' }}>
        <div
          className='container post-body-grid'
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 180px',
            gap: 48,
            maxWidth: 1180,
          }}
        >
          {/* Sticky TOC */}
          <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <div
              className='mono'
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#3A362F',
                marginBottom: 16,
              }}
            >
              In this piece
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {tocSections.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 14,
                    lineHeight: 1.3,
                    color: '#3A362F',
                  }}
                >
                  <span className='mono' style={{ fontSize: 10, color: '#B08A3E', marginRight: 8 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.text}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main column */}
          <div style={{ maxWidth: 720 }}>
            {post.sections.map((s, i) => (
              <PostSectionRenderer key={i} section={s} />
            ))}

            {/* End-of-article CTA */}
            <div
              style={{
                marginTop: 80,
                padding: '40px 36px',
                background: '#14130F',
                color: '#F5EFE2',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr',
                gap: 32,
                alignItems: 'center',
              }}
              className='post-cta'
            >
              <div>
                <div
                  className='mono'
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#C9A55A',
                  }}
                >
                  Next step
                </div>
                <div className='display' style={{ fontSize: 26, marginTop: 10, lineHeight: 1.15 }}>
                  Want this kind of analysis on a specific property?
                </div>
              </div>
              <Link
                href='/contact?intent=memo'
                className='btn btn-gold'
                style={{ justifySelf: 'end' }}
              >
                Request a memo →
              </Link>
            </div>
          </div>

          {/* Right rail spacer (matches the design's 3-column grid) */}
          <aside />
        </div>
      </article>

      {/* ===== RELATED ===== */}
      {related.length > 0 && (
        <section
          style={{
            background: '#FAF6EC',
            padding: '80px 0',
            borderTop: '1px solid rgba(20,19,15,0.1)',
          }}
        >
          <div className='container'>
            <div className='lead-num' style={{ marginBottom: 32 }}>Continue reading</div>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}
              className='related-grid'
            >
              {related.map(p => (
                <RelatedCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Disclaimer />
      <StickyCTA label='Get insights weekly' cta='Subscribe' href='/contact' />
    </div>
  );
}

function PostSectionRenderer({ section }: { section: PostSection }) {
  if (section.kind === 'h2') {
    return (
      <h2
        className='display'
        style={{
          fontSize: 36,
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          margin: '56px 0 20px',
          color: '#14130F',
        }}
      >
        {section.text}
      </h2>
    );
  }
  if (section.kind === 'p') {
    return (
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.7,
          color: '#2A2722',
          margin: '0 0 20px',
          fontFamily: 'var(--f-display)',
        }}
      >
        {section.text}
      </p>
    );
  }
  if (section.kind === 'stats') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          background: 'rgba(20,19,15,0.12)',
          border: '1px solid rgba(20,19,15,0.12)',
          margin: '40px 0',
        }}
      >
        {section.items.map((it, j) => (
          <div key={j} style={{ background: '#FBF8F0', padding: 24 }}>
            <div
              className='display tnum'
              style={{ fontSize: 36, color: '#14130F', letterSpacing: '-0.02em' }}
            >
              {it.val}
            </div>
            <div
              className='mono'
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#3A362F',
                marginTop: 6,
              }}
            >
              {it.label}
            </div>
            {it.delta && (
              <div
                className='mono'
                style={{ fontSize: 11, color: '#1F3A2E', marginTop: 8 }}
              >
                {it.delta}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (section.kind === 'callout') {
    const isGreen = section.tone === 'green';
    const bg = isGreen ? '#1F3A2E' : '#FAF6EC';
    const fg = isGreen ? '#F5EFE2' : '#14130F';
    const border = isGreen ? 'rgba(201,165,90,0.4)' : '#C9A55A';
    return (
      <div
        style={{
          background: bg,
          color: fg,
          padding: '32px 36px',
          margin: '40px 0',
          borderLeft: `3px solid ${border}`,
        }}
      >
        <div
          className='mono'
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C9A55A',
            marginBottom: 12,
          }}
        >
          Field note
        </div>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            margin: 0,
            fontFamily: 'var(--f-display)',
            fontStyle: 'italic',
          }}
        >
          {section.text}
        </p>
      </div>
    );
  }
  return null;
}

function RelatedCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderTop: '1px solid rgba(20,19,15,0.2)',
        paddingTop: 24,
      }}
    >
      <div
        className='mono'
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#B08A3E',
        }}
      >
        {post.category} · {post.readMinutes} min
      </div>
      <div className='display' style={{ fontSize: 22, marginTop: 14, lineHeight: 1.2 }}>
        {post.title}
      </div>
      <div
        className='mono'
        style={{
          fontSize: 11,
          marginTop: 20,
          color: '#3A362F',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{fmtDate(post.date)}</span>
        <span style={{ color: '#14130F' }}>Read →</span>
      </div>
    </Link>
  );
}
