'use client';

import './admin.css';
import { usePathname } from 'next/navigation';
import { Sidebar } from './AdminShell';

// Admin uses a totally different design system than the public site —
// light theme, fixed sidebar, ops-dashboard chrome. admin.css is loaded
// here (instead of in the root layout) so it only applies to /admin/*.
//
// Each admin page is responsible for its own <Topbar> + page content
// (so different pages can render different breadcrumbs and topbar
// actions). The login page is the exception: it renders standalone
// (no sidebar) on a dark background per the design.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isLogin = pathname.startsWith('/admin/login');
  if (isLogin) return <>{children}</>;
  return (
    <div className='app'>
      <Sidebar />
      {children}
    </div>
  );
}
