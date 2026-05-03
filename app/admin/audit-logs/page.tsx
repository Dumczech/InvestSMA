import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Audit Logs']}
      title='Audit Logs'
      subtitle='Mutations across the admin (who edited what, when). Pulls from audit_logs.'
      icon='list'
    />
  );
}
