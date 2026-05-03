import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Lead CRM']}
      title='Lead CRM'
      subtitle='Pipeline view of inbound leads — status, owner, last touch.'
      icon='leads'
      action={{ label: 'View leads list →', href: '/admin/leads' }}
    />
  );
}
