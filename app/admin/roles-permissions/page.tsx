import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Roles & Permissions']}
      title='Roles & Permissions'
      subtitle='Manage user_roles + permissions for the admin console.'
      icon='settings'
    />
  );
}
