// Legal — Disclosures + Terms of Use, sourced from /api/legal.
// All visual structure matches the design exactly; only the data and the
// "Contact us →" acknowledgement now flow through the backend.

function LegalHero({ summary }) {
  const lastUpdatedLabel = summary
    ? new Date(summary.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'April 30, 2026';

  return (
    <section style={{ background: '#14130F', color: '#F5EFE2', paddingTop: 56, paddingBottom: 64 }} className="dark">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 24, borderBottom: '1px solid rgba(245,239,226,0.15)', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,239,226,0.6)' }}>
          <span>§ Legal</span>
          <span>InvestSMA · Operated by Luxury Rental Management</span>
          <span>Last updated · {lastUpdatedLabel}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80, paddingTop: 56, alignItems: 'end' }}>
          <div>
            <div className="lead-num" style={{ color: '#C9A55A' }}>Page · Disclosures & Terms</div>
            <h1 className="display" style={{ fontSize: 'clamp(48px, 6vw, 88px)', margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 0.96 }}>
              Disclosures &amp;<br /><span className="display-italic" style={{ color: '#C9A55A' }}>terms of use.</span>
            </h1>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(245,239,226,0.78)', textWrap: 'pretty' }}>
              Two short documents that clarify our role and set appropriate expectations. We are not a brokerage, and nothing on this site is investment, legal, or tax advice. Read both before engaging.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <a href="#disclosures" className="btn btn-gold">Disclosures →</a>
              <a href="#terms" className="btn btn-ghost" style={{ color: '#F5EFE2', borderColor: 'rgba(245,239,226,0.3)' }}>Terms of use →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalNav({ active, sections }) {
  return (
    <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
      <div className="data-label" style={{ marginBottom: 16 }}>On this page</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '1px solid rgba(20,19,15,0.15)' }}>
        {sections.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
              padding: '12px 16px', textDecoration: 'none', color: '#14130F',
              borderLeft: active === s.id ? '2px solid #C9A55A' : '2px solid transparent',
              marginLeft: -1,
            }}>
              <span>
                <span className="mono tnum" style={{ fontSize: 10, color: '#C9A55A', letterSpacing: '0.12em', marginRight: 10 }}>{s.n}</span>
                <span style={{ fontSize: 15 }}>{s.label}</span>
              </span>
              <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(20,19,15,0.45)' }}>{s.count}</span>
            </a>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 32, padding: 20, background: 'rgba(201,165,90,0.08)', borderLeft: '3px solid #C9A55A' }}>
        <div className="data-label" style={{ color: '#8E6F2D' }}>Plain-English summary</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', fontSize: 13, lineHeight: 1.55 }}>
          <li style={{ paddingBottom: 8 }}>· We're operators, not brokers.</li>
          <li style={{ paddingBottom: 8 }}>· Nothing here is investment / legal / tax advice.</li>
          <li style={{ paddingBottom: 8 }}>· Projections are estimates, not guarantees.</li>
          <li>· You're responsible for your own due diligence.</li>
        </ul>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(20,19,15,0.5)', fontFamily: 'var(--f-mono)', letterSpacing: '0.08em' }}>
        QUESTIONS? &nbsp;<a href="mailto:justin@luxrentalmgmt.com" style={{ color: '#14130F', textDecoration: 'underline' }}>justin@luxrentalmgmt.com</a>
      </div>
    </aside>
  );
}

function ClauseList({ items, sectionNum }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: `clauses-${sectionNum}` }}>
      {items.map((c, i) => (
        <li key={c.n} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 24, padding: '32px 0', borderTop: i === 0 ? '1px solid rgba(20,19,15,0.15)' : '1px solid rgba(20,19,15,0.08)' }}>
          <div>
            <div className="mono tnum" style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}>§ {sectionNum}.{c.n}</div>
          </div>
          <div>
            <h3 className="display" style={{ fontSize: 24, margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{c.t}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(20,19,15,0.78)', marginTop: 12, textWrap: 'pretty' }}>{c.d}</p>
            {c.list && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
                {c.list.map((b, j) => (
                  <li key={j} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10, padding: '8px 0', fontSize: 14, color: 'rgba(20,19,15,0.78)' }}>
                    <span className="mono tnum" style={{ color: 'rgba(20,19,15,0.4)', fontSize: 11 }}>{String.fromCharCode(97 + j)}.</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function useLegalContent() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    fetch('/api/legal')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e); });
    return () => { alive = false; };
  }, []);

  return { data, error };
}

function recordAcceptance(intent) {
  // Fire-and-forget acknowledgement; failure shouldn't block navigation.
  return fetch('/api/legal/acceptances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent,
      documents: [
        { slug: 'disclosures', version: window.__LEGAL_VERSION__ || 'v1.0' },
        { slug: 'terms',       version: window.__LEGAL_VERSION__ || 'v1.0' },
      ],
    }),
  }).catch(() => null);
}

function LegalBody() {
  const { data, error } = useLegalContent();
  const [active, setActive] = React.useState('disclosures');

  React.useEffect(() => {
    if (data && data.version) window.__LEGAL_VERSION__ = data.version;
  }, [data]);

  React.useEffect(() => {
    const sections = ['disclosures', 'terms'];
    const onScroll = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 120 && r.bottom > 120) {
          setActive(id);
          return;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onAcknowledge = (e) => {
    recordAcceptance('contact');
    // Let the link navigate normally — no preventDefault.
  };

  if (error) {
    return (
      <section style={{ background: '#FBF8F0', padding: '88px 0 120px' }}>
        <div className="container">
          <div style={{ padding: 32, border: '1px solid rgba(20,19,15,0.15)', maxWidth: 640 }}>
            <div className="data-label">Couldn't load legal content</div>
            <p style={{ marginTop: 8 }}>{String(error.message || error)}</p>
          </div>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section style={{ background: '#FBF8F0', padding: '88px 0 120px' }}>
        <div className="container"><div className="data-label">Loading legal content…</div></div>
      </section>
    );
  }

  const disclosures = data.disclosures || { items: [], sectionNum: '1', intro: '', title: 'Disclosures' };
  const terms = data.terms || { items: [], sectionNum: '2', intro: '', title: 'Terms of Use' };
  const sections = [
    { id: 'disclosures', label: disclosures.title, n: '01', count: disclosures.items.length },
    { id: 'terms',       label: terms.title,       n: '02', count: terms.items.length },
  ];

  const lastUpdatedLabel = new Date(data.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <section style={{ background: '#FBF8F0', padding: '88px 0 120px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 64, alignItems: 'start' }}>
          <LegalNav active={active} sections={sections} />
          <div>
            <section id="disclosures" style={{ scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
                <span className="mono tnum" style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}>§ 01</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(20,19,15,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{disclosures.title}</span>
              </div>
              <h2 className="display" style={{ fontSize: 'clamp(40px, 5vw, 64px)', margin: 0, lineHeight: 1.0, letterSpacing: '-0.025em' }}>
                Our role, in <span className="display-italic" style={{ color: '#1F3A2E' }}>plain terms</span>.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(20,19,15,0.7)', maxWidth: 720, marginTop: 20, textWrap: 'pretty' }}>
                {disclosures.intro}
              </p>

              <div style={{ marginTop: 48 }}>
                <ClauseList items={disclosures.items} sectionNum={disclosures.sectionNum} />
              </div>
            </section>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '88px 0' }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
              <span className="mono" style={{ fontSize: 10, color: 'rgba(20,19,15,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>End of disclosures · Terms follow</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(20,19,15,0.15)' }} />
            </div>

            <section id="terms" style={{ scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
                <span className="mono tnum" style={{ fontSize: 11, color: '#C9A55A', letterSpacing: '0.14em' }}>§ 02</span>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(20,19,15,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{terms.title}</span>
              </div>
              <h2 className="display" style={{ fontSize: 'clamp(40px, 5vw, 64px)', margin: 0, lineHeight: 1.0, letterSpacing: '-0.025em' }}>
                The <span className="display-italic" style={{ color: '#1F3A2E' }}>legal backbone</span>.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(20,19,15,0.7)', maxWidth: 720, marginTop: 20, textWrap: 'pretty' }}>
                {terms.intro}
              </p>

              <div style={{ marginTop: 48 }}>
                <ClauseList items={terms.items} sectionNum={terms.sectionNum} />
              </div>

              <div style={{ marginTop: 64, padding: '28px 32px', background: '#14130F', color: '#F5EFE2', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                <div>
                  <div className="data-label" style={{ color: '#C9A55A' }}>Acknowledgement</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 8, color: 'rgba(245,239,226,0.85)', textWrap: 'pretty' }}>
                    By continuing to use this site or engaging with InvestSMA, you acknowledge that you've read and accepted these disclosures and terms.
                  </div>
                </div>
                <a href="contact.html" className="btn btn-gold" style={{ flexShrink: 0 }} onClick={onAcknowledge}>Contact us →</a>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(20,19,15,0.12)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(20,19,15,0.5)' }}>
                <span>Doc · {data.docCode || 'INV-LGL-2026-Q2'} · {data.version || 'v1.0'}</span>
                <span>Last updated · {lastUpdatedLabel}</span>
                <a href="#" style={{ color: 'rgba(20,19,15,0.5)' }}>↑ Back to top</a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalPage() {
  const { data } = useLegalContent();
  return (
    <div data-screen-label="Legal">
      <Nav />
      <Ticker />
      <LegalHero summary={data} />
      <LegalBody />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LegalPage />);
