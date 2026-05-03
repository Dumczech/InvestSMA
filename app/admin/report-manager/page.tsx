import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Report Manager']}
      title='Report Manager'
      subtitle='Schedule + generate quarterly + ad-hoc reports. Outputs into market_reports.'
      icon='file'
      action={{ label: 'Edit reports →', href: '/admin/market-reports' }}
    />
  );
}
