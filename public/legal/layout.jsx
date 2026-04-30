// Shared layout for all InvestSMA pages
// Exposes: Nav, Footer, Ticker, StickyCTA, Logo, Icon, fmtMoney, fmtPct

const PAGES = [
  { id: 'home', label: 'Home', href: 'index.html' },
  { id: 'properties', label: 'Properties', href: 'properties.html' },
  { id: 'market', label: 'Market Data', href: 'market.html' },
  { id: 'roi', label: 'ROI Calculator', href: 'roi.html' },
  { id: 'insights', label: 'Insights', href: 'insights.html' },
  { id: 'about', label: 'About', href: 'about.html' },
  { id: 'contact', label: 'Investor Access', href: 'contact.html' },
];

function Logo({ dark }) {
  return (
    <a href="index.html" className="nav-logo" style={{ color: dark ? '#F5EFE2' : '#14130F' }}>
      <span className="mark"></span>
      <span>InvestSMA</span>
      <span className="tag">by Luxury Rental Mgmt</span>
    </a>
  );
}

function Nav({ active, dark }) {
  return (
    <nav className={`nav ${dark ? 'dark-nav' : ''}`}>
      <div className="nav-inner">
        <Logo dark={dark} />
        <div className="nav-links">
          {PAGES.map(p => (
            <a key={p.id} href={p.href} className={`nav-link ${p.id === active ? 'active' : ''}`}>
              {p.label}
            </a>
          ))}
        </div>
        <a href="contact.html" className="btn btn-gold nav-cta" style={{ padding: '10px 18px', fontSize: 11 }}>
          Request Access →
        </a>
      </div>
    </nav>
  );
}

// Marquee data ticker — Bloomberg-style, surfaces SMA market metrics
function Ticker() {
  const items = [
    { label: 'SMA·OCC', val: '62.4%', delta: '+3.1%', up: true },
    { label: 'CENTRO·ADR', val: '$418', delta: '+8.2%', up: true },
    { label: 'ATASCADERO·ADR', val: '$362', delta: '+5.4%', up: true },
    { label: 'SAN ANTONIO·ADR', val: '$294', delta: '+2.1%', up: true },
    { label: 'YOY·VISITORS', val: '+11.8%', delta: '↑', up: true },
    { label: 'AVG·STAY', val: '4.1 nights', delta: '+0.3', up: true },
    { label: 'CAP·RATE·LUX', val: '6.8%', delta: '−0.2%', up: false },
    { label: 'GROSS·YIELD', val: '9.2%', delta: '+0.4%', up: true },
    { label: 'PEAK·NOV-MAR', val: '78% OCC', delta: '↑', up: true },
    { label: 'INVENTORY', val: '–4.2%', delta: 'tightening', up: false },
  ];
  const renderRow = (key) => (
    <div key={key} className="marquee-track">
      {items.map((it, i) => (
        <span key={`${key}-${i}`} className="ticker-item">
          <span className="label">{it.label}</span>
          <span className="val tnum">{it.val}</span>
          <span className={it.up ? 'delta-up' : 'delta-dn'}>{it.delta}</span>
        </span>
      ))}
      {items.map((it, i) => (
        <span key={`${key}-d-${i}`} className="ticker-item">
          <span className="label">{it.label}</span>
          <span className="val tnum">{it.val}</span>
          <span className={it.up ? 'delta-up' : 'delta-dn'}>{it.delta}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker">
      {renderRow('a')}
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ background: '#0E0D0A', color: 'rgba(245,239,226,0.55)', padding: '24px 0', borderTop: '1px solid rgba(245,239,226,0.08)' }}>
      <div className="container" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, lineHeight: 1.6, letterSpacing: '0.04em' }}>
        <strong style={{ color: 'rgba(245,239,226,0.75)', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 }}>Disclaimer · </strong>
        Revenue estimates and ROI projections shown on this site are directional and not guaranteed. They exclude operating expenses, property taxes, financing costs, sales commissions, owner personal-use days, and any future regulatory changes. Past performance does not predict future results. Information is for educational purposes and is not investment, legal, or tax advice. InvestSMA is operated by Luxury Rental Management.
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo dark />
            <p style={{ marginTop: 24, maxWidth: 380, opacity: 0.7, fontSize: 14, lineHeight: 1.7 }}>
              A research and lead-gen platform for investors evaluating turnkey luxury rental properties in San Miguel de Allende. Operated by Luxury Rental Management.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <span className="chip" style={{ borderColor: 'rgba(245,239,226,0.25)', color: '#D9CFB8' }}>Operator-led</span>
              <span className="chip" style={{ borderColor: 'rgba(245,239,226,0.25)', color: '#D9CFB8' }}>Real Data</span>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="properties.html">Featured Properties</a></li>
              <li><a href="market.html">Market Data</a></li>
              <li><a href="roi.html">ROI Calculator</a></li>
              <li><a href="insights.html">Insights & Reports</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="insights.html">Buyer's Guide</a></li>
              <li><a href="insights.html">Q1 Market Report</a></li>
              <li><a href="insights.html">Tax & Ownership</a></li>
              <li><a href="insights.html">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="contact.html">Request Access</a></li>
              <li><a href="mailto:justin@luxrentalmgmt.com">justin@luxrentalmgmt.com</a></li>
              <li><a href="tel:+15123662801">+1 (512) 366-2801</a></li>
              <li style={{ opacity: 0.6 }}>San Miguel de Allende, GTO</li>
            </ul>
          </div>
        </div>
        <div style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(245,239,226,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          opacity: 0.5,
          fontFamily: 'var(--f-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          <span>© 2026 Luxury Rental Management · justin@luxrentalmgmt.com · +1 (512) 366-2801</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <a href="legal.html#disclosures" style={{ color: 'inherit' }}>Disclosures</a>
            <a href="legal.html#terms" style={{ color: 'inherit' }}>Terms</a>
            <span>Estimates are directional only — not guaranteed.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function StickyCTA({ label = 'See if you qualify', cta = 'Calculate ROI', href = 'roi.html' }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a href={href} className={`sticky-cta ${visible ? 'visible' : ''}`}>
      <span className="label">{label} · <span className="strong">2 min</span></span>
      <span className="btn btn-gold" style={{ padding: '8px 16px', fontSize: 11 }}>
        {cta} →
      </span>
    </a>
  );
}

// Helpers
function fmtMoney(n, opts = {}) {
  const { compact = false, prefix = '$' } = opts;
  if (compact && Math.abs(n) >= 1000000) return `${prefix}${(n / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (compact && Math.abs(n) >= 1000) return `${prefix}${(n / 1000).toFixed(0)}K`;
  return `${prefix}${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
function fmtPct(n, digits = 1) { return `${n.toFixed(digits)}%`; }

// Featured property data, used across pages
const PROPERTIES = [
  {
    id: 'p1',
    name: 'Casa Solana',
    nbhd: 'Centro Histórico',
    beds: 4, baths: 4.5, sqm: 420,
    price: 1850000,
    adrLow: 480, adrHigh: 720,
    occ: 68,
    grossLow: 285000, grossHigh: 410000,
    upgrade: 'Cosmetic only — turnkey ready',
    upgradeBudget: 45000,
    thesis: 'Walkable to Jardín, panoramic Parroquia views, recently renovated colonial.',
    style: 'colonial',
    accent: 'linear-gradient(135deg, #B08A3E 0%, #8E6F2D 100%)',
    accent2: 'radial-gradient(at 30% 30%, #ECE3CD 0%, #C4B898 60%, #8E6F2D 100%)',
    score: 92,
    rooftop: true,
  },
  {
    id: 'p2',
    name: 'Hacienda Atascadero',
    nbhd: 'Atascadero',
    beds: 5, baths: 5, sqm: 580,
    price: 2400000,
    adrLow: 620, adrHigh: 950,
    occ: 64,
    grossLow: 380000, grossHigh: 540000,
    upgrade: 'Pool refresh + outdoor kitchen',
    upgradeBudget: 95000,
    thesis: 'Estate-scale compound on 0.6 hectares with mountain views and full pool.',
    style: 'hacienda',
    accent: 'linear-gradient(135deg, #1F3A2E 0%, #2C5240 100%)',
    accent2: 'radial-gradient(at 70% 40%, #3F6B55 0%, #1F3A2E 80%)',
    score: 88,
    rooftop: false,
  },
  {
    id: 'p3',
    name: 'Casa Rosa de Aldama',
    nbhd: 'Centro Histórico',
    beds: 3, baths: 3,  sqm: 280,
    price: 1295000,
    adrLow: 380, adrHigh: 560,
    occ: 71,
    grossLow: 195000, grossHigh: 285000,
    upgrade: 'Light staging + pro photography',
    upgradeBudget: 18000,
    thesis: 'Pink stone facade on Aldama — the most photographed street in SMA.',
    style: 'colonial',
    accent: 'linear-gradient(135deg, #D9CFB8 0%, #B08A3E 100%)',
    accent2: 'radial-gradient(at 40% 60%, #ECE3CD 0%, #D9CFB8 50%, #B08A3E 100%)',
    score: 95,
    rooftop: true,
  },
  {
    id: 'p4',
    name: 'Villa Los Frailes',
    nbhd: 'Los Frailes',
    beds: 4, baths: 4, sqm: 380,
    price: 1450000,
    adrLow: 340, adrHigh: 510,
    occ: 60,
    grossLow: 175000, grossHigh: 260000,
    upgrade: 'Kitchen + primary suite',
    upgradeBudget: 120000,
    thesis: 'Quiet enclave with golf access; high upgrade alpha for the right buyer.',
    style: 'modern',
    accent: 'linear-gradient(135deg, #2A2722 0%, #1F3A2E 100%)',
    accent2: 'radial-gradient(at 60% 30%, #3F6B55 0%, #2A2722 100%)',
    score: 81,
    rooftop: false,
  },
  {
    id: 'p5',
    name: 'Casa San Antonio',
    nbhd: 'San Antonio',
    beds: 3, baths: 2.5, sqm: 240,
    price: 875000,
    adrLow: 280, adrHigh: 420,
    occ: 65,
    grossLow: 132000, grossHigh: 195000,
    upgrade: 'Rooftop terrace build-out',
    upgradeBudget: 65000,
    thesis: 'Best entry point into SMA luxury rental yields with rooftop addition.',
    style: 'modern',
    accent: 'linear-gradient(135deg, #ECE3CD 0%, #D9CFB8 60%, #C4B898 100%)',
    accent2: 'radial-gradient(at 50% 50%, #FAF6EC 0%, #ECE3CD 50%, #D9CFB8 100%)',
    score: 86,
    rooftop: false,
  },
  {
    id: 'p6',
    name: 'Casona del Chorro',
    nbhd: 'El Chorro',
    beds: 5, baths: 4.5, sqm: 510,
    price: 2950000,
    adrLow: 720, adrHigh: 1100,
    occ: 66,
    grossLow: 425000, grossHigh: 620000,
    upgrade: 'Trophy property — minor refresh',
    upgradeBudget: 35000,
    thesis: 'Trophy compound minutes from Jardín — premier wedding & event rental.',
    style: 'colonial',
    accent: 'linear-gradient(135deg, #1F3A2E 0%, #14130F 100%)',
    accent2: 'radial-gradient(at 30% 70%, #2C5240 0%, #14130F 100%)',
    score: 96,
    rooftop: true,
  },
];

// Expose globally
Object.assign(window, {
  Nav, Footer, Ticker, StickyCTA, Logo, Disclaimer,
  fmtMoney, fmtPct,
  PROPERTIES, PAGES,
});
