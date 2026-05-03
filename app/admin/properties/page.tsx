import { AdminPlaceholder } from '../_components/AdminPlaceholder';

// `Properties` admin top-level — a redirect/index. The real CRUD lives at
// /admin/property-cms. This page exists for the sidebar nav and offers a
// shortcut.

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Properties']}
      title='Properties'
      subtitle='Manage the public catalog. Editor lives at /admin/property-cms.'
      icon='home'
      action={{ label: 'Open Property CMS →', href: '/admin/property-cms' }}
    />
  );
}
