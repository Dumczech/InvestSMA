// Icons — small inline SVGs used throughout admin
const Icon = ({ name, className = "icon", style }) => {
  const icons = {
    dashboard: <path d="M3 13h7V3H3zm0 8h7v-6H3zm10 0h7V11h-7zm0-18v6h7V3z" />,
    leads: <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
    home: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    chart: <path d="M3.5 18.49 9.5 12.48l4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />,
    calc: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6.34 14.66L11.25 19l-2.13-2.12L7 19l-1.41-1.41 2.12-2.13L5.59 13.34 7 11.93l2.12 2.12L11.25 11.93l1.41 1.41-2.12 2.13zM13 9h6v2h-6zm.5-3h5v1.5h-5z" />,
    book: <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5z" />,
    settings: <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />,
    file: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm-1 7V3.5L18.5 9z" />,
    download: <path d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z" />,
    upload: <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />,
    plus: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />,
    search: <path d="m15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0 -.7.7l.27.28v.79l5 4.99 1.49-1.49zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />,
    filter: <path d="M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z" />,
    edit: <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z" />,
    trash: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />,
    close: <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
    check: <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />,
    chevron: <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />,
    chevronDown: <path d="m6 9 6 6 6-6z" />,
    arrowRight: <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />,
    arrowUp: <path d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z" />,
    arrowDown: <path d="m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z" />,
    warning: <path d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />,
    info: <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />,
    bell: <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z" />,
    eye: <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
    copy: <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11z" />,
    more: <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />,
    refresh: <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />,
    save: <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3 3 3zm3-10H5V5h10z" />,
    link: <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />,
    bed: <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />,
    location: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />,
    calendar: <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14zM7 10h5v5H7z" />,
    money: <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />,
    tag: <path d="M21.41 11.58 12.83 3a2 2 0 0 0-1.41-.59H4c-1.1 0-2 .9-2 2v7.41c0 .55.22 1.05.59 1.42l8.58 8.58c.78.78 2.05.78 2.83 0l7.41-7.41c.79-.78.79-2.04 0-2.82zM5.5 7A1.5 1.5 0 1 1 7 5.5 1.5 1.5 0 0 1 5.5 7z" />,
    list: <path d="M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z" />,
    grid: <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />,
    play: <path d="M8 5v14l11-7z" />,
    building: <path d="M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z" />,
    image: <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z" />,
    folder: <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8z" />,
    external: <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />,
  };
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {icons[name] || null}
    </svg>
  );
};

// Sidebar nav config
const NAV = [
  { section: 'Operations', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'index.html' },
    { id: 'leads', label: 'Leads', icon: 'leads', href: 'leads.html', badge: 12 },
  ]},
  { section: 'Content', items: [
    { id: 'properties', label: 'Properties', icon: 'home', href: 'properties.html' },
    { id: 'reports', label: 'Reports', icon: 'file', href: 'reports.html' },
    { id: 'insights', label: 'Insights', icon: 'book', href: 'insights.html' },
    { id: 'media', label: 'Media Library', icon: 'grid', href: 'media.html' },
    { id: 'site', label: 'Site Assets', icon: 'settings', href: 'site.html' },
  ]},
  { section: 'Data', items: [
    { id: 'market', label: 'Market Data', icon: 'chart', href: 'market.html' },
    { id: 'airdna', label: 'AirDNA Benchmarks', icon: 'calc', href: 'airdna.html' },
    { id: 'import', label: 'CSV Import', icon: 'upload', href: 'import.html' },
  ]},
];

function Sidebar({ active }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="mark">i</span>
        <span>InvestSMA</span>
        <span className="env">Prod</span>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {NAV.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <a key={item.id} href={item.href} className={`sidebar-link ${active === item.id ? 'active' : ''}`}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </a>
            ))}
          </div>
        ))}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Account</div>
          <a href="#" className="sidebar-link">
            <Icon name="settings" />
            <span>Settings</span>
          </a>
          <a href="../index.html" className="sidebar-link">
            <Icon name="link" />
            <span>View public site</span>
          </a>
        </div>
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">JM</div>
        <div className="who">
          <div className="name">Justin McCarter</div>
          <div className="role">Owner · LRM</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs = [], children }) {
  return (
    <div className="topbar">
      <div className="breadcrumbs">
        <span>Admin</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className="sep">/</span>
            <span className={i === crumbs.length - 1 ? 'here' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        <Icon name="search" className="icon" />
        <input placeholder="Search leads, properties, reports…" />
        <span className="kbd">⌘K</span>
      </div>
      <div className="actions">
        {children}
        <button className="btn btn-icon btn-ghost" title="Notifications">
          <Icon name="bell" />
        </button>
      </div>
    </div>
  );
}

function Badge({ kind = 'neutral', dot, children }) {
  return <span className={`badge badge-${kind} ${dot ? 'dot' : ''}`}>{children}</span>;
}

function Modal({ title, desc, onClose, children, footer, danger }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title" style={{ color: danger ? 'var(--status-danger)' : null }}>{title}</h3>
          {desc && <p className="modal-desc">{desc}</p>}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon = 'list', title, desc, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'new': { kind: 'info', label: 'New', dot: true },
    'contacted': { kind: 'purple', label: 'Contacted', dot: true },
    'qualified': { kind: 'warn', label: 'Qualified', dot: true },
    'meeting': { kind: 'info', label: 'Meeting set', dot: true },
    'won': { kind: 'success', label: 'Won', dot: true },
    'lost': { kind: 'neutral', label: 'Lost', dot: true },
    'draft': { kind: 'neutral', label: 'Draft' },
    'review': { kind: 'warn', label: 'Needs review' },
    'verified': { kind: 'info', label: 'Verified' },
    'published': { kind: 'success', label: 'Published' },
    'imported': { kind: 'purple', label: 'Imported' },
    'archived': { kind: 'neutral', label: 'Archived' },
    'active': { kind: 'success', label: 'Active', dot: true },
    'inactive': { kind: 'neutral', label: 'Inactive', dot: true },
    'gated': { kind: 'warn', label: 'Gated' },
    'public': { kind: 'success', label: 'Public' },
  };
  const cfg = map[status] || { kind: 'neutral', label: status };
  return <Badge kind={cfg.kind} dot={cfg.dot}>{cfg.label}</Badge>;
}

function SaveBar({ dirty = false, onSave, onDiscard, lastSaved }) {
  return (
    <div className="save-bar">
      <div className={`status ${!dirty ? 'saved' : ''}`}>
        <span className="dot"></span>
        {dirty ? 'Unsaved changes' : `All changes saved · ${lastSaved || 'just now'}`}
      </div>
      <div className="actions">
        <button className="btn" onClick={onDiscard} disabled={!dirty}>Discard</button>
        <button className="btn">Save draft</button>
        <button className="btn btn-primary" onClick={onSave}>
          <Icon name="check" /> Publish
        </button>
      </div>
    </div>
  );
}

// Mock data
const LEADS_DATA = [
  { id: 'L-2810', name: 'Marcus Henderson', email: 'marcus.h@gmail.com', phone: '+1 415 555 0182', source: 'roi', budget: '2M-3M', timeline: '0-3mo', buyerType: 'Investor', status: 'qualified', created: '2026-01-22T14:21:00', assigned: 'Justin' },
  { id: 'L-2809', name: 'Priya Krishnan', email: 'priya.k@example.com', phone: '+44 7700 900123', source: 'memo', budget: '3M-5M', timeline: '0-3mo', buyerType: 'Family Office', status: 'meeting', created: '2026-01-22T11:08:00', assigned: 'Justin' },
  { id: 'L-2808', name: 'Carlos Mendoza', email: 'cmendoza@xyz.com', phone: '+52 55 1234 5678', source: 'organic', budget: '1M-2M', timeline: '3-6mo', buyerType: 'Second Home', status: 'new', created: '2026-01-22T09:44:00', assigned: '—' },
  { id: 'L-2807', name: 'Eleanor Whitfield', email: 'ew@whitfield.co', phone: '+1 312 555 0991', source: 'paid', budget: '5M+', timeline: '0-3mo', buyerType: 'Investor', status: 'contacted', created: '2026-01-21T17:32:00', assigned: 'Justin' },
  { id: 'L-2806', name: 'David Park', email: 'davidp@pf.io', phone: '+1 213 555 0114', source: 'referral', budget: '2M-3M', timeline: '6-12mo', buyerType: 'Investor', status: 'qualified', created: '2026-01-21T15:12:00', assigned: 'Maria' },
  { id: 'L-2805', name: 'Anya Volkova', email: 'anya@vk.com', phone: '+7 925 123 4567', source: 'roi', budget: '3M-5M', timeline: '0-3mo', buyerType: 'Family Office', status: 'won', created: '2026-01-21T10:01:00', assigned: 'Justin' },
  { id: 'L-2804', name: 'Thomas Reilly', email: 'treilly@gmail.com', phone: '+1 617 555 0288', source: 'organic', budget: '1M-2M', timeline: '12mo+', buyerType: 'Second Home', status: 'lost', created: '2026-01-20T16:48:00', assigned: 'Maria' },
  { id: 'L-2803', name: 'Sophia Berger', email: 'sophia.berger@example.de', phone: '+49 30 12345678', source: 'memo', budget: '2M-3M', timeline: '3-6mo', buyerType: 'Investor', status: 'contacted', created: '2026-01-20T14:22:00', assigned: 'Justin' },
  { id: 'L-2802', name: 'Hiro Tanaka', email: 'hiro@tnk.jp', phone: '+81 3 1234 5678', source: 'paid', budget: '5M+', timeline: '0-3mo', buyerType: 'Family Office', status: 'meeting', created: '2026-01-20T11:55:00', assigned: 'Justin' },
  { id: 'L-2801', name: 'Rachel Goldstein', email: 'rgold@example.com', phone: '+1 305 555 0143', source: 'direct', budget: '1M-2M', timeline: '0-3mo', buyerType: 'Second Home', status: 'qualified', created: '2026-01-19T18:10:00', assigned: 'Maria' },
  { id: 'L-2800', name: 'Liam O\'Brien', email: 'liam.ob@example.ie', phone: '+353 1 234 5678', source: 'roi', budget: '3M-5M', timeline: '6-12mo', buyerType: 'Investor', status: 'new', created: '2026-01-19T13:33:00', assigned: '—' },
  { id: 'L-2799', name: 'Aisha Mohamed', email: 'aisha@m.co', phone: '+971 4 123 4567', source: 'memo', budget: '5M+', timeline: '0-3mo', buyerType: 'Family Office', status: 'contacted', created: '2026-01-19T09:18:00', assigned: 'Justin' },
];

const PROPERTIES_DATA = [
  { id: 'P-014', thumb: 't1', name: 'Casa de los Olivos', neighborhood: 'Centro', beds: 6, price: 3850000, adrLow: 1850, adrHigh: 2400, revLow: 380000, revHigh: 520000, status: 'published', updated: '2026-01-21' },
  { id: 'P-013', thumb: 't2', name: 'Hacienda Las Cruces', neighborhood: 'Atascadero', beds: 8, price: 5200000, adrLow: 2400, adrHigh: 3200, revLow: 580000, revHigh: 740000, status: 'published', updated: '2026-01-20' },
  { id: 'P-012', thumb: 't3', name: 'Villa San Antonio', neighborhood: 'San Antonio', beds: 5, price: 2950000, adrLow: 1450, adrHigh: 1900, revLow: 290000, revHigh: 410000, status: 'review', updated: '2026-01-19' },
  { id: 'P-011', thumb: 't4', name: 'Casa del Mirador', neighborhood: 'Guadiana', beds: 7, price: 4400000, adrLow: 2100, adrHigh: 2800, revLow: 470000, revHigh: 620000, status: 'published', updated: '2026-01-18' },
  { id: 'P-010', thumb: 't5', name: 'Quinta Los Frailes', neighborhood: 'Los Frailes', beds: 6, price: 3200000, adrLow: 1700, adrHigh: 2200, revLow: 340000, revHigh: 470000, status: 'draft', updated: '2026-01-17' },
  { id: 'P-009', thumb: 't6', name: 'Casa de la Aurora', neighborhood: 'Centro', beds: 5, price: 2750000, adrLow: 1400, adrHigh: 1850, revLow: 280000, revHigh: 390000, status: 'published', updated: '2026-01-15' },
  { id: 'P-008', thumb: 't1', name: 'Hacienda El Recreo', neighborhood: 'Atascadero', beds: 9, price: 6800000, adrLow: 2900, adrHigh: 3900, revLow: 720000, revHigh: 950000, status: 'published', updated: '2026-01-14' },
  { id: 'P-007', thumb: 't2', name: 'Casa Tres Patios', neighborhood: 'Centro', beds: 6, price: 3450000, adrLow: 1750, adrHigh: 2300, revLow: 360000, revHigh: 490000, status: 'archived', updated: '2025-12-22' },
];

const fmt$ = n => '$' + n.toLocaleString('en-US');
const fmt$k = n => '$' + (n/1000).toFixed(0) + 'k';
const fmt$M = n => '$' + (n/1000000).toFixed(2) + 'M';
const sourceLabel = s => ({ organic: 'Organic', paid: 'Paid Ad', roi: 'ROI Calc', memo: 'Memo Download', referral: 'Referral', direct: 'Direct' }[s] || s);
const fmtDate = iso => {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

Object.assign(window, {
  Icon, Sidebar, Topbar, Badge, Modal, EmptyState, StatusBadge, SaveBar, NAV,
  LEADS_DATA, PROPERTIES_DATA,
  fmt$, fmt$k, fmt$M, sourceLabel, fmtDate
});
