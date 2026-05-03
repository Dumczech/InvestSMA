import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Gated Access']}
      title='Gated Access'
      subtitle='Investor access grants — who can see off-market memos, full reports, etc. Pulls from gated_access_grants.'
      icon='link'
    />
  );
}
