import Link from 'next/link';
import { Topbar, Icon } from '../AdminShell';
import type { ReactNode } from 'react';

// Reusable shell for admin routes that don't have a full implementation
// yet. Renders the design's empty-state pattern with a Topbar so navigation
// + breadcrumbs remain consistent.

type IconName = Parameters<typeof Icon>[0]['name'];

export function AdminPlaceholder({
  crumbs, title, subtitle, icon, body, action,
}: {
  crumbs: string[];
  title: string;
  subtitle: string;
  icon: IconName;
  body?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className='main'>
      <Topbar crumbs={crumbs} />
      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>{title}</h1>
            <p className='page-subtitle'>{subtitle}</p>
          </div>
        </div>
        <div className='empty'>
          <div className='empty-icon'><Icon name={icon} /></div>
          <h3>Coming soon</h3>
          <p>This module is queued in the design bundle and will be built out in a follow-up. Navigation + chrome are live.</p>
          {body}
          {action && (
            <Link href={action.href} className='btn btn-primary btn-sm'>
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
