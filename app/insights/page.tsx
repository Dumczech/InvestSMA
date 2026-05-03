import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts, type PostMeta } from '@/lib/data/posts';
import { Disclaimer, StickyCTA } from '@/components/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investment Insights | InvestSMA',
  description:
    'San Miguel de Allende vacation rental investment guides, market reports, case studies, and tax guidance — published every two weeks.',
};

const CATS: Array<{ id: string; label: string; matches: (p: PostMeta) => boolean }> = [
  { id: 'all', label: 'All Insights', matches: () => true },
  { id: 'market', label: 'Market Reports', matches: p => p.category === 'Market Report' },
  { id: 'guide', label: 'Investment Guides', matches: p => p.category === 'Investment Guide' },
  { id: 'buyer', label: 'Buyer Education', matches: p => p.category === 'Buyer Education' },
  { id: 'case', label: 'Case Studies', matches: p => p.category === 'Case Study' },
  { id: 'tax', label: 'Tax & Ownership', matches: p => p.category === 'Tax & Ownership' },
  { id: 'lifestyle', label: 'Second-Home Living', matches: p => p.category === 'Lifestyle' },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export default async function InsightsPage() {
  const posts = await getPublishedPosts();
  const featured = posts.slice(0, 2); // first 2 sorted-by-date posts get featured treatment
  return (
    <div className='doc-page' data-screen-label='Insights'>
      <Hero />
      <Featured posts={featured} />
      <PostGrid posts={posts} />
      <GatedDownload />
      <Disclaimer />
      <StickyCTA label='Subscribe to weekly briefing' cta='Subscribe' href='/contact' />
    </div>
  );
}

function Hero() {
  return (
    <section
      className='surface-dark'
      style={{ background: '#14130F', color: '#F5EFE2', padding: '64px 0' }}
    >
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64, alignItems: 'end' }}
          className='hero-grid'
        >
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>Field Notes</div>
            <h1
              className='display'
              style={{
                fontSize: 'clamp(48px, 6vw, 88px)',
                margin: '16px 0 0',
                letterSpacing: '-0.025em',
                lineHeight: 0.98,
              }}
            >
              Insights
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>from the field.</span>
            </h1>
            <p
              style={{
                marginTop: 24,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'rgba(245,239,226,0.78)',
                maxWidth: 540,
              }}
            >
              Quarterly market reports, buyer education, tax guidance, case studies. Written by
              the LRM acquisition team — published every two weeks.
            </p>
          </div>
          <form
            action='/contact'
            style={{ display: 'flex', gap: 8, alignSelf: 'end', flexWrap: 'wrap' }}
          >
            <input
              type='email'
              name='email'
              placeholder='your@email.com'
              style={{
                background: 'rgba(245,239,226,0.05)',
                border: '1px solid rgba(245,239,226,0.2)',
                padding: '12px 16px',
                color: '#F5EFE2',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                minWidth: 220,
                outline: 'none',
              }}
            />
            <button className='btn btn-gold' type='submit'>Subscribe →</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Featured({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) return null;
  return (
    <section style={{ background: '#FBF8F0', padding: '64px 0 32px' }}>
      <div className='container'>
        <div className='data-label' style={{ marginBottom: 24 }}>Featured this week</div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}
          className='featured-grid'
        >
          {posts.map(p => (
            <FeaturedCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ p }: { p: PostMeta }) {
  return (
    <Link
      href={`/insights/${p.slug}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
    >
      <div
        style={{ height: 320, background: p.accent, position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${p.accent} 0%, #14130F 100%)`,
          }}
        />
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}
          preserveAspectRatio='xMidYMid slice'
        >
          <pattern id={`p-${p.slug}`} x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'>
            <line x1='0' y1='0' x2='0' y2='40' stroke='#C9A55A' strokeWidth='0.5' />
            <line x1='0' y1='0' x2='40' y2='0' stroke='#C9A55A' strokeWidth='0.5' />
          </pattern>
          <rect width='100%' height='100%' fill={`url(#p-${p.slug})`} />
        </svg>
        <div style={{ position: 'absolute', top: 24, left: 24 }}>
          <span
            className='chip'
            style={{ background: 'rgba(245,239,226,0.95)', color: '#14130F', borderColor: 'transparent' }}
          >
            {p.category}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, color: '#F5EFE2' }}>
          <div className='display' style={{ fontSize: 28, lineHeight: 1.1 }}>{p.title}</div>
          <div
            className='mono'
            style={{
              fontSize: 11,
              marginTop: 16,
              letterSpacing: '0.1em',
              opacity: 0.7,
            }}
          >
            {fmtDate(p.date)} · {p.readMinutes} min
          </div>
        </div>
      </div>
    </Link>
  );
}

function PostGrid({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) {
    return (
      <section style={{ background: '#FBF8F0', padding: '48px 0 100px' }}>
        <div className='container'>
          <div className='lede'>No published insights yet — apply the seed migration to surface 9 designed posts.</div>
        </div>
      </section>
    );
  }
  return (
    <section style={{ background: '#FBF8F0', padding: '48px 0 100px' }}>
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}
          className='post-grid'
        >
          {posts.map(p => (
            <PostCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ p }: { p: PostMeta }) {
  return (
    <Link
      href={`/insights/${p.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        borderTop: '1px solid rgba(20,19,15,0.15)',
        paddingTop: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <span
          className='mono'
          style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B08A3E' }}
        >
          {p.category}
        </span>
        <span className='mono' style={{ fontSize: 10, opacity: 0.5 }}>{p.readMinutes} min</span>
      </div>
      <div className='display' style={{ fontSize: 22, lineHeight: 1.2, minHeight: 80 }}>
        {p.title}
      </div>
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid rgba(20,19,15,0.08)',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#3A362F',
        }}
      >
        <span>{fmtDate(p.date)}</span>
        <span style={{ color: '#14130F' }}>Read →</span>
      </div>
    </Link>
  );
}

function GatedDownload() {
  return (
    <section
      className='surface-dark'
      style={{ background: '#1F3A2E', color: '#F5EFE2', padding: '120px 0' }}
    >
      <div className='container'>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 64, alignItems: 'center' }}
          className='gated-grid'
        >
          <div>
            <div className='lead-num' style={{ color: '#C9A55A' }}>Gated · Free</div>
            <h2
              className='display'
              style={{
                fontSize: 'clamp(40px, 5vw, 72px)',
                margin: '12px 0 24px',
                lineHeight: 0.98,
              }}
            >
              The 52-page Q1
              <br />
              <span className='display-italic' style={{ color: '#D9CFB8' }}>SMA Market Report.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.78, maxWidth: 520 }}>
              Full neighborhood-by-neighborhood ADR breakdown, transaction comps, regulatory
              outlook, and a 2027 forecast. Sent as PDF.
            </p>
          </div>
          <Link href='/contact?intent=report' className='btn btn-gold' style={{ justifySelf: 'end' }}>
            Download Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
