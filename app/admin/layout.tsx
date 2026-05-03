import './admin.css';
import { Sidebar } from './AdminShell';

// Admin uses a totally different design system than the public site —
// light theme, fixed sidebar, ops-dashboard chrome. admin.css is loaded
// here (instead of in the root layout) so it only applies to /admin/*.
//
// Each admin page is responsible for its own <Topbar> + page content
// (so different pages can render different breadcrumbs and topbar
// actions).

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='app'>
      <Sidebar />
      {children}
    </div>
  );
}
