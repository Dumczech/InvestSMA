import Link from 'next/link';
import { platformModules } from '@/data/mockBackend';

const routeMap: Record<string,string> = {
  content_cms:'content-cms', property_cms:'property-cms', lead_crm:'lead-crm', market_data_warehouse:'market-warehouse', import_center:'import-center', media_library:'media-library', report_manager:'report-manager', user_roles_permissions:'roles-permissions', audit_logs:'audit-logs', analytics_tracking:'analytics', gated_content_access:'gated-access'
};

export default function AdminHome(){return <main className='mx-auto max-w-6xl p-6'><h1 className='text-3xl'>InvestSMA Modular Backend Console</h1><p className='text-white/70 mt-2'>Supabase/Postgres CMS + data platform modules.</p><div className='mt-6 grid gap-3 md:grid-cols-2'>{platformModules.map(m=><Link key={m.key} className='card p-4' href={`/admin/${routeMap[m.key]}`}><div className='text-sand'>{m.name}</div><div className='text-sm text-white/70'>{m.description}</div><div className='text-xs mt-1'>Status: {m.status}</div></Link>)}</div></main>}
