import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Market Data']}
      title='Market Data Warehouse'
      subtitle='Browse the market_*_performance tables, audit imports, publish batches.'
      icon='chart'
      action={{ label: 'Run an import →', href: '/admin/import-center' }}
    />
  );
}
