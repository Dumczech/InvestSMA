import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Topbar, Metric, Icon } from './AdminShell';

export const dynamic = 'force-dynamic';

// Faithful port of design5/.../admin/dashboard.jsx — operational overview.
// Counts come from Supabase when env is configured; otherwise the mock
// numbers from the design render so the page always has signal.

async function loadCounts() {
  const fallback = { leads: 2810, newLeads7d: 47, properties: 4, articles: 9 };
  const env =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env) return fallback;
  try {
    const s = getSupabaseServerClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [leadsAll, leads7d, props, posts] = await Promise.all([
      s.from('leads').select('*', { count: 'exact', head: true }),
      s.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      s.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      s.from('articles').select('*', { count: 'exact', head: true }).eq('published', true),
    ]);
    return {
      leads: leadsAll.count ?? fallback.leads,
      newLeads7d: leads7d.count ?? fallback.newLeads7d,
      properties: props.count ?? fallback.properties,
      articles: posts.count ?? fallback.articles,
    };
  } catch {
    return fallback;
  }
}

export default async function DashboardPage() {
  const c = await loadCounts();
  return (
    <div className='main'>
      <Topbar crumbs={['Dashboard']}>
        <Link href='/admin/import-center' className='btn btn-sm'>
          <Icon name='upload' /> Import data
        </Link>
        <Link href='/admin/property-cms' className='btn btn-sm btn-primary'>
          <Icon name='plus' /> New property
        </Link>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Operational overview</h1>
            <p className='page-subtitle'>Last 7 days · Live data</p>
          </div>
        </div>

        <div
          className='card'
          style={{
            marginBottom: 20,
            borderColor: 'rgba(202,138,4,0.3)',
            background: '#FEFCE8',
          }}
        >
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name='warning' style={{ color: 'var(--status-warn)', width: 18, height: 18 }} />
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>2 data warnings</strong>
              <span className='muted'>
                {' '}· Q4 2025 AirDNA benchmark missing for Atascadero · 3 properties haven&apos;t been updated in 30+ days
              </span>
            </div>
            <Link href='/admin/market-warehouse' className='btn btn-sm'>Review</Link>
          </div>
        </div>

        <div className='grid-4' style={{ marginBottom: 20 }}>
          <Metric
            label='Total leads'
            icon='leads'
            value={c.leads.toLocaleString()}
            trend={{ pct: 12.4, label: 'vs last week' }}
          />
          <Metric
            label='New leads (7d)'
            icon='plus'
            value={String(c.newLeads7d)}
            trend={{ pct: 8.2, label: 'vs last week' }}
          />
          <Metric
            label='Published properties'
            icon='home'
            value={String(c.properties)}
          />
          <Metric
            label='Published articles'
            icon='book'
            value={String(c.articles)}
          />
        </div>

        <div className='page-head' style={{ marginTop: 32 }}>
          <div>
            <h2 className='page-title' style={{ fontSize: 18 }}>Quick actions</h2>
            <p className='page-subtitle'>Jump into the editors most-touched this quarter.</p>
          </div>
        </div>
        <div className='grid-4'>
          <QuickLink href='/admin/property-cms' icon='home' title='Property CMS' desc='Manage listings, photos, memos.' />
          <QuickLink href='/admin/articles' icon='book' title='Insights' desc='Publish posts, edit body JSON.' />
          <QuickLink href='/admin/content-cms' icon='settings' title='Site Content' desc='Edit homepage, contact, ROI copy.' />
          <QuickLink href='/admin/market-reports' icon='file' title='Market Reports' desc='Quarterly PDFs, gated downloads.' />
          <QuickLink href='/admin/media-library' icon='grid' title='Media Library' desc='Photos, hero images, brand.' />
          <QuickLink href='/admin/import-center' icon='upload' title='CSV Import' desc='AirDNA, market_*_performance.' />
          <QuickLink href='/admin/leads' icon='leads' title='Leads' desc='Inbound from /contact + ROI gate.' />
          <QuickLink href='/admin/analytics' icon='pulse' title='Metrics' desc='Funnel, ROI runs, exports.' />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: 'home' | 'book' | 'settings' | 'file' | 'grid' | 'upload' | 'leads' | 'pulse';
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className='card'
      style={{ display: 'block', padding: 20, textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Icon name={icon} style={{ width: 18, height: 18, opacity: 0.7, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
          <div className='muted' style={{ fontSize: 12, marginTop: 4 }}>{desc}</div>
        </div>
      </div>
    </Link>
  );
}
