import {
  ChapterHead, P, H3, Prose, Pullquote, Callout, Checklist,
  ComparisonGrid, StatStrip, DataTable,
} from './blocks';
import { GuideChart } from './charts';
import { InteractiveChecklist } from './InteractiveChecklist';
import {
  HIGH_IMPACT_AMENITIES, LOW_IMPACT_AMENITIES, RED_FLAGS,
  PNL_STACK, PROCESS_PHASES, BUYER_CHECKLIST,
} from './data';

// Faithful port of guide-chapters.jsx — 31 chapters across 7 parts.

function Ch01() {
  return (
    <article>
      <ChapterHead num='01' part='I' title='Why San Miguel de Allende Is an Attractive Investment Market' dek='A heritage city, a luxury lifestyle destination, a wedding market, a second-home market, and a short-term rental market — all operating at the same time.' />
      <Prose>
        <P lead>San Miguel de Allende is not a normal real estate market. That convergence creates real opportunity for buyers — and a trap. Many investors buy beautiful homes without understanding what actually drives rental performance.</P>
        <P>A home can be architecturally stunning and still be a mediocre investment. A cheaper home can look like a bargain and still fail because it lacks walkability, views, staffing efficiency, bedroom count, parking, guest flow, or the kind of design that commands premium nightly rates.</P>
      </Prose>
      <div style={{ margin: '40px 0' }}>
        <GuideChart kind='marketKPI' source='Source: AirDNA, San Miguel de Allende market, full-year 2025. Updated annually.' />
      </div>
      <div style={{ margin: '32px 0 40px' }}>
        <GuideChart kind='seasonality'
          caption='ADR and occupancy by month, in MXN. ADR peaks in November–December (Día de Muertos, Christmas) and again in March (Holy Week / wedding season). Occupancy is highest in February and July; September is the softest month on both metrics.'
          source='Source: LRM portfolio · 2025 monthly occupancy & ADR · Updated annually.' />
      </div>
      <Prose>
        <H3 num='1.1'>Five demand drivers</H3>
        <StatStrip items={[
          { v: '#1',     l: 'Best City in Mexico',  s: "Travel + Leisure 2025 World's Best Awards" },
          { v: 'UNESCO', l: 'Heritage Status',       s: 'Architecture, gastronomy, cultural tourism' },
          { v: '403K+',  l: 'Holiday Visitors',      s: 'Dec 24, 2024 – Jan 5, 2025 (municipal)' },
          { v: '$5.76B', l: 'GTO Tourism (Pesos)',   s: 'November 2025 reported impact' },
        ]} />
        <P><strong>Brand recognition.</strong> Travel + Leisure named San Miguel the best city in Mexico in its 2025 World&apos;s Best Awards, citing the arts scene, café culture, architecture, and shopping.</P>
        <P><strong>Heritage status.</strong> Guanajuato has two UNESCO sites — San Miguel and Guanajuato City — anchoring a region known for colonial architecture and cultural tourism.</P>
        <P><strong>Event seasonality.</strong> Weddings, festivals, holidays, and family gatherings drive whole-home demand. The municipal government reported more than 403,956 visitors during the December 2024–January 2025 holiday window.</P>
        <P><strong>Regional tourism scale.</strong> Guanajuato reportedly generated approximately 5.758 billion pesos of tourism economic impact in November 2025 alone, with 478,101 tourists and 2.39 million visitors.</P>
        <P><strong>Operator fragmentation.</strong> Many homes are owner-managed, poorly priced, inconsistently staged, and under-distributed. Professional operators outperform.</P>
        <Callout kind='rule'>San Miguel is not a passive-income market. It is an operations market.</Callout>
      </Prose>
    </article>
  );
}

function Ch02() {
  return (
    <article>
      <ChapterHead num='02' part='I' title='The Core Investment Thesis' dek='&ldquo;Buy any home and Airbnb will pay for it&rdquo; is lazy underwriting. The strong thesis has six parts.' />
      <Prose>
        <Pullquote attribution='The thesis'>
          Buy a scarce, well-located, emotionally compelling home in a destination with durable tourism demand; professionally furnish, price, distribute, maintain, and service it; then use short-term rental income to offset ownership costs, improve yield, and support long-term appreciation.
        </Pullquote>
        <P>The best investments combine, simultaneously: a desirable real estate asset, a strong guest experience, a professional operating system, a realistic tax and compliance structure, a pricing strategy tied to seasonality and demand, a marketing strategy beyond simply listing on Airbnb, and a maintenance and staffing model that protects the asset.</P>
        <P>If any of those are missing, the projected return can fall apart.</P>
      </Prose>
    </article>
  );
}

function Ch03() {
  return (
    <article>
      <ChapterHead num='03' part='I' title='What the Current STR Data Says' dek="Public data varies by provider. The lesson is not that one number is right — it's that average performance is not the target." />
      <Prose>
        <P>Different platforms use different methodologies, sample sizes, property types, and date ranges. Treat these figures as directional, not gospel.</P>
        <DataTable
          headers={['Source', 'Listings', 'Occupancy', 'ADR', 'Annual Rev', 'Period']}
          rows={[
            ['AirDNA', '4,003', '37%', '$175', 'MXN 1.24M', 'Trailing'],
            ['Airbtics', '2,149', '44%', '—', 'MXN 309K (med.)', 'Feb 25 – Jan 26'],
            ['AirROI', '—', '30.3%', '$205', '$17,475 USD', 'Apr 25 – Mar 26'],
            ['CEIC (hotels)', '—', '46.17%', '—', '—', 'Wk of Feb 1, 2026'],
            { __highlight: true, cells: ['LRM (active listings)', '—', '60.25%', 'MXN 6,771', 'MXN 1.49M', 'Full-year 2025'] },
          ]}
          caption="Market sources: AirDNA market overview; Airbtics market summary; AirROI 2026 dataset; CEIC tourist-center weekly hotel data. LRM row reflects active-listing performance across the LRM-managed portfolio in San Miguel de Allende, full-year 2025. Methodologies differ — AirDNA's 37% reflects all listings (including never-booked); the LRM 60.25% is active-listing occupancy. Figures are directional, not directly comparable. Data updated annually."
        />
        <Callout kind='warn' title='The wrong question'>
          A buyer should not ask &ldquo;what does the average Airbnb make?&rdquo; — that includes studios, badly run homes, blocked calendars, and weak photography. Ask instead: <em>what do comparable homes with my bedroom count, location, design quality, staff level, views, outdoor space, pool or jacuzzi, and professional management make?</em>
        </Callout>
      </Prose>
    </article>
  );
}

function Ch04() {
  return (
    <article>
      <ChapterHead num='04' part='II' title='Do Not Buy the Average Home' dek='The market average is not the benchmark. Underwrite against the relevant competitive set.' />
      <Prose>
        <P>The average short-term rental in San Miguel includes small apartments, poorly managed homes, under-designed properties, bad calendars, weak photography, bad pricing, and owners who block the best dates for personal use.</P>
        <P>A four-bedroom luxury home near Centro is not competing with a small studio outside the walkable core. A six-bedroom event-friendly home with views, staff, and a pool is not competing with a basic two-bedroom casita. High-design homes with professional hospitality command different guests, different ADR, and different conversion rates.</P>
        <Pullquote>Most buyers use market averages, then assume their home will beat them because it &ldquo;feels special.&rdquo; That is not underwriting. That is hope.</Pullquote>
      </Prose>
    </article>
  );
}

function Ch05() {
  return (
    <article>
      <ChapterHead num='05' part='II' title='Traits of the Best STR Investment Homes' dek='The best STR homes are not the homes owners personally like most. They are the homes guests choose quickly, pay more for, review highly, and recommend.' />
      <Prose>
        <Checklist
          columns={2}
          items={[
            'Walkability to Centro, restaurants, galleries, shopping',
            'Three or more bedrooms (groups, families, weddings)',
            'Distinctive design that photographs well',
            'Views, rooftop terraces, courtyards, pools, fireplaces',
            'A/C or heating in bedrooms where appropriate',
            "A layout for groups, not the owner's personal lifestyle",
            'Private bathrooms or strong bath-to-bed ratio',
            'Quiet bedrooms, blackout curtains, hot water reliability',
            'Strong WiFi and a functional kitchen',
            'Safe access, easy check-in, clear arrival logistics',
            'Space for staff, storage, laundry, supplies',
            'Memorable feature(s) — view, pool, jacuzzi, courtyard',
          ]}
        />
      </Prose>
      <div style={{ margin: '40px 0' }}>
        <GuideChart kind='amenityUplift'
          caption='Amenity premium on ADR and occupancy. A heated pool and a real rooftop are the two largest single-line ADR levers; professional photography is the largest occupancy lever per dollar spent.'
          illustrative />
      </div>
    </article>
  );
}

function Ch06() {
  return (
    <article>
      <ChapterHead num='06' part='II' title='Location: What to Prioritize' dek='In San Miguel, location is not just distance from the Parroquia. It is guest psychology.' />
      <div style={{ margin: '0 0 40px' }}>
        <GuideChart kind='zoneADR'
          caption='Median ADR and observed range by neighborhood. Centro and Atascadero command top medians; Los Frailes and San Antonio trade rate for purchase price. The spread within each zone is wider than the spread between them — the home matters more than the label.'
          illustrative />
      </div>
      <Prose>
        <P>Guests ask: Can I walk to restaurants? Will I feel safe walking at night? Is the street noisy? Is the walk steep? Can older guests handle the location? Can taxis or private drivers access the home? Is it close enough to Centro to feel convenient but far enough to feel peaceful?</P>
        <H3 num='6.1'>High-demand zones</H3>
        <P>Areas close to Centro, Guadiana, Ojo de Agua, and Parque Juárez perform well — but the exact street, noise level, slope, parking, view corridor, and guest access matter more than broad neighborhood labels.</P>
        <Callout kind='tip'>A home five minutes farther away with incredible views, a pool, and a better layout can outperform a closer home that feels cramped or dark. But a beautiful home in a difficult location must earn a meaningful discount in the purchase price.</Callout>
        <P>Do not overpay for &ldquo;potential&rdquo; if the location creates permanent friction.</P>
      </Prose>
    </article>
  );
}

function Ch07() {
  const tiers = [
    { beds: '1–2 BR', tier: 'Entry',   note: 'More competition, lower total nightly revenue. Owner-occupied substitution risk.' },
    { beds: '3 BR',   tier: 'Strong',  note: 'If walkable, well-designed, easy to operate. Sweet spot for many buyers.' },
    { beds: '4–6 BR', tier: 'Premium', note: 'Families, weddings, reunions, luxury group travel. Higher ADR ceiling.' },
    { beds: '7+ BR',  tier: 'Estate',  note: 'Premium revenue, but staffing, cleaning oversight, and capex reserves balloon.' },
  ];
  return (
    <article>
      <ChapterHead num='07' part='II' title='Bedroom Count & Guest Economics' dek='Bigger homes generate bigger gross numbers — and bigger operational problems. The question is whether the next bedroom adds rate power or just cost.' />
      <Prose>
        <div style={{ margin: '32px 0', display: 'grid', gridTemplateColumns: '1fr', gap: 0, border: '1px solid rgba(20,19,15,0.12)' }}>
          {tiers.map((r, i) => (
            <div key={i} className='guide-bed-row' style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr', gap: 24, padding: '20px 24px', borderTop: i ? '1px solid rgba(20,19,15,0.08)' : 'none', alignItems: 'baseline' }}>
              <div className='display' style={{ fontSize: 22 }}>{r.beds}</div>
              <div className='mono' style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)' }}>{r.tier}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>{r.note}</div>
            </div>
          ))}
        </div>
        <P>Underwrite revenue per bedroom, bath ratios, staff requirements, cleaning complexity, and guest profile — not just total beds.</P>
      </Prose>
    </article>
  );
}

function Ch08() {
  return (
    <article>
      <ChapterHead num='08' part='II' title='Amenities That Move Revenue' dek='Buyers often overspend on design they personally enjoy and underspend on guest comfort. That is backwards.' />
      <Prose>
        <ComparisonGrid
          leftLabel='High-impact · move ADR & conversion'
          rightLabel='Low-impact · marketing fluff'
          leftItems={[...HIGH_IMPACT_AMENITIES]}
          rightItems={[...LOW_IMPACT_AMENITIES]}
        />
        <P>A beautiful imported chair matters less than blackout curtains, hot water pressure, or a reliable coffee setup. Guests filter for amenities; they do not filter for &ldquo;imported accent furniture.&rdquo;</P>
      </Prose>
    </article>
  );
}

function Ch09() {
  return (
    <article>
      <ChapterHead num='09' part='II' title='Furnishing & Design as Conversion' dek='Furnishing for STR is not interior design for personal pride. It is conversion optimization.' />
      <Prose>
        <P>The home needs to photograph well, feel luxurious, withstand guest use, and be easy to maintain. The mistake is furnishing cheaply and wondering why the home cannot command premium rates. The other mistake is over-designing with fragile, expensive pieces that guests damage.</P>
        <Callout kind='rule'>The goal is durable luxury.</Callout>
        <H3 num='9.1'>A good STR design package</H3>
        <Checklist columns={2} items={[
          'Durable sofas and chairs',
          'High-quality mattresses',
          'Hotel-grade linens and towels',
          'Consistent artwork and visual identity',
          'Strong lighting (warm, layered)',
          'Outdoor furniture built for sun and rain',
          'Enough seating for the advertised guest count',
          'Kitchenware that supports group use',
          'Storage for cleaning supplies & owner closets',
          'Redundancy for items that break frequently',
        ]} />
      </Prose>
      <div style={{ margin: '40px 0' }}>
        <GuideChart kind='photoConversion'
          caption='Booking conversion vs. photography tier. The jump from owner photos to a local pro doubles conversion and cuts time-to-book by half. The marginal cost of moving up one tier is almost always recovered in the first month.'
          illustrative />
      </div>
    </article>
  );
}

function Ch10() {
  return (
    <article>
      <ChapterHead num='10' part='III' title='Revenue Is Created Before the Guest Arrives' dek='The home may be beautiful — but if the listing does not convert, revenue suffers.' />
      <Prose>
        <P>Most STR revenue is created before the guest ever enters the home. It is created through photography, listing copy, pricing, calendar strategy, review quality, response speed, search ranking, minimum-night settings, discount strategy, channel distribution, and owner availability discipline.</P>
        <Callout kind='note' title="Airbnb's own guidance">
          Airbnb&apos;s Mexico hosting guide states that hosts are responsible for tax obligations when listing accommodations and receiving reservations. The platform pushes compliance onto the host.
        </Callout>
        <P>STR income is not automatic. It is manufactured through disciplined execution.</P>
      </Prose>
    </article>
  );
}

function Ch11() {
  return (
    <article>
      <ChapterHead num='11' part='III' title='Distribution: Do Not Rely on One Platform' dek='A serious STR investment should not depend entirely on Airbnb.' />
      <Prose>
        <P>Airbnb is important — but a strong home should be distributed across multiple demand channels: direct booking, selected OTAs, luxury travel partners, repeat-guest databases, wedding and event planners, relocation guests, and concierge referrals.</P>
        <H3 num='11.1'>Why direct booking matters</H3>
        <P>The advantage of direct is not just saving fees. It is control: repeat business, guest communication, upsells, and a customer database. Direct only works if the operator has brand trust, payment infrastructure, guest support, marketing, and operational discipline.</P>
        <Callout kind='tip'>For most owners, the answer is not &ldquo;Airbnb or direct.&rdquo; It is a channel mix.</Callout>
      </Prose>
    </article>
  );
}

function Ch12() {
  return (
    <article>
      <ChapterHead num='12' part='III' title='Pricing Strategy: Dynamic, Not Emotional' dek='The goal is not to protect your ego. It is to maximize annual net income while protecting the property and guest quality.' />
      <Prose>
        <ComparisonGrid
          leftLabel='Inputs that should drive price'
          rightLabel="What owners say (and shouldn't)"
          leftTone='pos'
          rightTone='neg'
          leftItems={[
            'Seasonality and lead time',
            'Day of week, length of stay',
            'Local events and holidays',
            'Competitor availability',
            'Search ranking and review momentum',
            'Orphan nights and last-minute gaps',
            'Owner blocks',
            'Conversion rate',
          ]}
          rightItems={[
            '"I would never rent it for less than $800."',
            '"My house is worth more than that."',
            "\"I don't want discount guests.\"",
            '"That weekend should be expensive."',
            '"Just hold the price — somebody will book."',
            "\"Don't do last-minute discounts.\"",
          ]}
        />
        <P>The best operators are not afraid to discount strategically. The wrong discount cheapens a property; the right discount fills gaps, improves ranking, builds reviews, and increases annual revenue.</P>
      </Prose>
    </article>
  );
}

function Ch13() {
  return (
    <article>
      <ChapterHead num='13' part='III' title='Occupancy Alone Is Not the Goal' dek='High occupancy at low rates wears out the home. Low occupancy at unrealistic rates leaves money on the table. The target is optimized revenue after costs.' />
      <Prose>
        <H3 num='13.1'>The metrics that matter</H3>
        <Checklist columns={2} items={[
          'Gross rental revenue', 'Average daily rate (ADR)', 'Occupancy',
          'RevPAR (revenue per available night)', 'Net operating income',
          'Owner payout', 'Maintenance % of revenue', 'Cleaning quality scores',
          'Review score', 'Booking lead time', 'Channel mix', 'Repeat guest rate',
          'Guest issue frequency', 'Damage incidence',
        ]} />
        <Pullquote>A home making $20,000/month gross with poor reviews, constant damage, and high maintenance may be worse than a home making $16,000/month with better net income and lower operational stress.</Pullquote>
      </Prose>
    </article>
  );
}

function Ch14() {
  const groups: Array<[string, string[]]> = [
    ['Acquisition',         ['Purchase price', 'Closing costs', 'Furnishing & setup', 'Renovation budget']],
    ['Revenue',             ['Annual gross revenue', 'Platform fees', 'Cleaning revenue', 'Owner usage impact']],
    ['Operating cost',      ['Management fee', 'Cleaning expense', 'Utilities', 'Property taxes', 'Insurance', 'Accounting & compliance', 'Staffing']],
    ['Capital & returns',   ['Maintenance reserve', 'Capex reserve', 'Debt service', 'Net income before tax', 'Cash-on-cash', 'Payback period', 'Exit value']],
  ];
  return (
    <article>
      <ChapterHead num='14' part='III' title='The Underwriting Model You Should Use' dek='Run three cases. If the deal only works in the optimistic case, it is not a deal. It is a gamble.' />
      <Prose>
        <H3 num='14.1'>Required model lines</H3>
        <div className='guide-uw-grid' style={{ margin: '24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid rgba(20,19,15,0.12)' }}>
          {groups.map((g, i) => (
            <div key={g[0]} style={{
              padding: '20px 24px',
              borderRight: i % 2 === 0 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              borderTop: i > 1 ? '1px solid rgba(20,19,15,0.08)' : 'none',
            }}>
              <div className='mono' style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>{g[0]}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {g[1].map(l => (
                  <li key={l} style={{ fontSize: 14, padding: '5px 0', color: 'var(--ink-2)' }}>· {l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <StatStrip items={[
          { v: '−15%', l: 'Conservative case', s: 'Revenue haircut floor' },
          { v: 'Base', l: 'Realistic case',    s: 'Comparable-anchored' },
          { v: '+10%', l: 'Optimistic case',   s: 'Best-effort upside' },
        ]} />
      </Prose>
    </article>
  );
}

function Ch15() {
  return (
    <article>
      <ChapterHead num='15' part='III' title='Conservative Underwriting Assumptions' dek='Most buyers do the opposite. They use aggressive revenue, low expenses, and no reserves. That is how they talk themselves into overpaying.' />
      <Prose>
        <Checklist items={[
          'Reduce projected revenue by 10% to 20%',
          'Increase maintenance costs vs. seller assumptions',
          'Include a furnishing reserve',
          'Assume slower ramp-up in the first 90 to 180 days',
          'Account for owner blocks during high-demand periods',
          'Assume platform or tax changes could reduce net income',
          'Include annual capital replacements',
          'Assume at least some unexpected repairs',
        ]} />
        <Callout kind='rule'>If the deal still works after these haircuts — it is a deal. If it only works in the optimistic case — walk.</Callout>
      </Prose>
    </article>
  );
}

function Ch16() {
  const steps = [
    { n: '1', t: "Identify the buyer's objective", d: 'Lifestyle, income, appreciation, capital preservation, or a combination. Christmas/Semana Santa/Día de Muertos blocks for personal use are fine — but model them honestly.' },
    { n: '2', t: 'Define the target guest', d: 'Couples, families, wedding groups, luxury travelers, remote workers, retirees, or event guests. The target guest determines location, design, amenities, and pricing.' },
    { n: '3', t: 'Build a competitive set', d: 'Compare against similar homes by bedroom count, location, design, amenities, view, outdoor space, and review quality — not the entire market.' },
    { n: '4', t: 'Estimate revenue', d: 'Use real comparable listings, actual historical data if available, market tools, and operator experience.' },
    { n: '5', t: 'Stress-test expenses', d: 'Maintenance, management, taxes, utilities, staff, cleaning, accounting, insurance, replacements, and guest damage.' },
    { n: '6', t: 'Determine fair purchase price', d: 'Emotional value and investment value are not the same. If the home cannot support the desired return, negotiate, improve the asset, accept lower return, or walk away.' },
  ];
  return (
    <article>
      <ChapterHead num='16' part='IV' title='Sample Investment Framework' dek='A six-step path from buyer objective to fair purchase price.' />
      <Prose>
        {steps.map(s => (
          <div key={s.n} className='guide-step-row' style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 24, padding: '20px 0', borderTop: '1px solid rgba(20,19,15,0.12)', alignItems: 'baseline' }}>
            <div className='display tnum' style={{ fontSize: 36, color: 'var(--gold)', letterSpacing: '-0.02em' }}>{s.n}</div>
            <div>
              <div className='display' style={{ fontSize: 22, lineHeight: 1.2 }}>{s.t}</div>
              <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{s.d}</p>
            </div>
          </div>
        ))}
      </Prose>
    </article>
  );
}

function Ch17() {
  return (
    <article>
      <ChapterHead num='17' part='IV' title='Taxes & Compliance in Mexico' dek='Taxes are not optional. Bad tax structure can turn a good gross-revenue property into a weak net investment.' />
      <Prose>
        <P>Mexico requires hosts earning income from lodging or accommodation through digital platforms to register and comply. SAT has a specific regime for individuals earning income through technology platforms.</P>
        <P>Airbnb&apos;s Mexico responsible-hosting page states that hosts are responsible for paying taxes — VAT is reported monthly while income tax is declared monthly and annually. Third-party guidance also notes that STR income in Mexico is generally subject to ISR, IVA, and sometimes state lodging taxes, with platforms typically withholding amounts depending on the host&apos;s tax status.</P>
        <H3 num='17.1'>Speak with a Mexican accountant about</H3>
        <Checklist columns={2} items={[
          'Whether to hold the property personally or through an entity',
          'Whether you need an RFC',
          'How IVA applies to your situation',
          'How ISR applies to your situation',
          'Whether platform withholdings are handled correctly',
          'Whether income will be declared in Mexico',
          'U.S. or foreign reporting obligations',
          'Whether expenses are deductible',
          'Whether the operating agreement is structured correctly',
          'Whether you receive rental income, service income, or another form',
        ]} />
        <Callout kind='warn'>This is not an area to improvise.</Callout>
      </Prose>
    </article>
  );
}

function Ch18() {
  return (
    <article>
      <ChapterHead num='18' part='IV' title='Foreign Ownership Considerations' dek='San Miguel is inland, not coastal — fideicomiso typically not required. But you still need title review, closing support, and tax planning.' />
      <Prose>
        <P>Foreign buyers often do not need a fideicomiso bank trust in the same way they would for property inside Mexico&apos;s restricted coastal or border zones. That said, buyers still need competent legal advice.</P>
        <H3 num='18.1'>Items to verify before closing</H3>
        <Checklist columns={2} items={[
          'Clear title', 'Property boundaries', 'Permits',
          'Existing liens', 'Construction legality', 'Water rights & service reliability',
          'HOA rules, if any', 'Zoning or use limitations', 'Easements',
          'Staff or labor obligations', 'Outstanding utilities or taxes', 'Furniture and inventory ownership',
        ]} />
        <Callout kind='rule'>Do not buy property in Mexico without a qualified closing attorney reviewing the transaction.</Callout>
      </Prose>
    </article>
  );
}

function Ch19() {
  const tiles = [
    'Pricing', 'Listing optimization', 'Guest communication',
    'Check-in logistics', 'Housekeeping', 'Maintenance',
    'Concierge', 'Inspections', 'Owner reporting',
    'Damage claims', 'Tax doc support', 'Vendor management',
    'Staff coordination', 'Inventory control', 'Emergency response',
    'Review management', 'Platform disputes', 'Preventive maintenance',
  ];
  return (
    <article>
      <ChapterHead num='19' part='V' title='Operating Risk: The Part Buyers Underestimate' dek='The most common buyer fantasy is that a property manager &ldquo;just rents it out.&rdquo; That is not what professional STR management actually is.' />
      <Prose>
        <div className='guide-ops-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, margin: '32px 0', border: '1px solid rgba(20,19,15,0.12)' }}>
          {tiles.map((s, i) => (
            <div key={s} style={{
              padding: '18px 20px',
              borderTop: i > 2 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              borderRight: (i + 1) % 3 !== 0 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              fontFamily: 'var(--f-display)', fontSize: 18,
            }}>
              <span className='mono' style={{ fontSize: 10, color: 'var(--gold)', marginRight: 10 }}>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </div>
          ))}
        </div>
        <Pullquote>A $1,500-per-night guest is not buying a bed. They are buying confidence.</Pullquote>
      </Prose>
    </article>
  );
}

function Ch20() {
  return (
    <article>
      <ChapterHead num='20' part='V' title='Maintenance Reserve: Assume Things Will Break' dek='Short-term rentals wear differently than owner-occupied homes. Larger groups create heavier wear.' />
      <Prose>
        <H3 num='20.1'>Recurring expense lines to budget</H3>
        <Checklist columns={2} items={[
          'Appliance repairs', 'Plumbing', 'Hot water systems',
          'Electrical issues', 'Pool & jacuzzi systems', 'Rooftop waterproofing',
          'Paint touch-ups', 'Furniture repair', 'Linens and towels (replacement)',
          'Kitchen replacements', 'A/C and heating maintenance', 'Pest control',
          'Garden and irrigation', 'Deep cleaning',
        ]} />
        <Callout kind='warn'>If a buyer is not prepared to reinvest in the home, the property will slowly decline. Reviews slip, ADR weakens, the asset loses competitiveness.</Callout>
      </Prose>
    </article>
  );
}

function Ch21() {
  return (
    <article>
      <ChapterHead num='21' part='V' title='Staffing & Labor Risk' dek='In Mexico, labor issues can become expensive if handled informally. Do not casually inherit staff arrangements.' />
      <Prose>
        <P>Housekeepers, cooks, gardeners, and maintenance workers may create legal and operational obligations. Review employment status, pay history, benefits, vacation, severance exposure, schedules, and responsibilities before closing.</P>
        <H3 num='21.1'>Questions a buyer must answer</H3>
        <Checklist items={[
          'Who employs the staff?',
          'Who pays them?',
          'Are they employees or contractors?',
          'Are benefits being handled?',
          'Are overtime and holidays handled properly?',
          'What happens if the owner changes manager?',
          'Who is responsible for termination costs?',
          'What staff are required to operate at the projected revenue level?',
        ]} />
      </Prose>
    </article>
  );
}

function Ch22() {
  return (
    <article>
      <ChapterHead num='22' part='V' title='Owner Usage: The Hidden Revenue Killer' dek='Owner usage is not bad. Many buy in San Miguel because they want to enjoy the home. But it must be modeled honestly.' />
      <div style={{ margin: '0 0 40px' }}>
        <GuideChart kind='ownerUsage'
          caption='Revenue lost per week of owner usage, by month. A November or December block costs roughly 2× a July or September block. Same week off the calendar, very different P&L impact.'
          source='LRM portfolio · 2025 monthly occupancy & ANR · weekly cost = ANR × occupancy × 7' />
      </div>
      <Prose>
        <H3 num='22.1'>The most damaging owner blocks</H3>
        <StatStrip items={[
          { v: '~30%',         l: 'Annual revenue',   s: 'Often concentrated in 8–10 weeks' },
          { v: 'Dec 20 – Jan 5', l: 'Holiday peak',   s: 'Highest single block of the year' },
          { v: 'Mar/Apr',      l: 'Semana Santa',     s: 'Religious + travel demand' },
          { v: 'Late Oct/Nov', l: 'Día de Muertos',   s: 'Cultural-tourism magnet' },
        ]} />
        <Pullquote>There is nothing wrong with lifestyle ownership. But do not call it an investment strategy if the owner blocks the highest-value dates.</Pullquote>
      </Prose>
    </article>
  );
}

function Ch23() {
  return (
    <article>
      <ChapterHead num='23' part='VI' title='What to Ask Before Purchasing' dek='If the deal still works after answering these honestly, it may be worth pursuing.' />
      <Prose>
        <Checklist columns={2} items={[
          'What is the realistic annual gross revenue?',
          'What is expected net after mgmt, maintenance, taxes, utilities, reserves?',
          'What comparables support that estimate?',
          'What are the biggest guest objections to this home?',
          'What upgrades materially improve revenue?',
          'What upgrades are cosmetic only?',
          'Furnishing budget?',
          'Annual maintenance budget?',
          'Can guests walk to key areas?',
          'Is the home easy to access?',
          'Are there noise issues?',
          'Is the layout good for groups?',
          'Are there enough bathrooms?',
          'Does the home photograph well?',
          'Premium amenities?',
          'Staff or labor liabilities?',
          'HOA or neighborhood restrictions?',
          'Can it be legally and practically rented?',
          'How much personal use does the owner want?',
          'What happens if occupancy is 20% lower than projected?',
          'What happens if maintenance is 30% higher than projected?',
        ]} />
      </Prose>
    </article>
  );
}

function Ch24() {
  return (
    <article>
      <ChapterHead num='24' part='VI' title='Red Flags That Should Slow You Down' dek='These statements are usually either naive or self-serving. A serious buyer needs data, operating assumptions, and downside analysis.' />
      <Prose>
        <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
          {RED_FLAGS.map((f, i) => (
            <li key={i} className='guide-redflag-row' style={{
              display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16,
              padding: '16px 0', borderTop: '1px solid rgba(155,74,58,0.25)', alignItems: 'baseline',
            }}>
              <span className='mono' style={{ fontSize: 11, letterSpacing: '0.14em', color: '#9B4A3A' }}>RED · {String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'var(--ink)' }}>{f}</span>
            </li>
          ))}
        </ul>
      </Prose>
    </article>
  );
}

function Ch25() {
  return (
    <article>
      <ChapterHead num='25' part='VI' title='Gross Revenue Is Not Owner Income' dek='A property can post impressive gross revenue and still produce mediocre net income if expenses are uncontrolled.' />
      <Prose>
        <div className='guide-pnl-card' style={{ background: '#FAF6EC', border: '1px solid rgba(20,19,15,0.12)', padding: '32px 36px', margin: '32px 0' }}>
          <div className='mono' style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
            Illustrative annual P&amp;L · 4-BR Centro home · Year 2 stabilized
          </div>
          {PNL_STACK.map((row, i) => (
            <div key={i} className='guide-pnl-row' style={{
              display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 16,
              padding: '14px 0', borderTop: i ? '1px solid rgba(20,19,15,0.1)' : '2px solid var(--ink)',
              alignItems: 'baseline',
              background: row.tone === 'final' ? 'rgba(176,138,62,0.1)' : 'transparent',
              marginLeft:  row.tone === 'final' ? -36 : 0,
              marginRight: row.tone === 'final' ? -36 : 0,
              paddingLeft:  row.tone === 'final' ? 36 : 0,
              paddingRight: row.tone === 'final' ? 36 : 0,
            }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: row.tone === 'final' ? 22 : 18, color: 'var(--ink)', fontWeight: row.tone === 'final' ? 500 : 400 }}>
                {row.line}
              </div>
              <div className='mono tnum' style={{
                fontSize: row.tone === 'final' ? 22 : 16,
                color: row.tone === 'pos' ? '#4A7C59' : row.tone === 'neg' ? '#9B4A3A' : 'var(--ink)',
                textAlign: 'right',
                fontWeight: row.tone === 'final' ? 600 : 400,
              }}>{row.val}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--ink-3)' }}>{row.note}</div>
            </div>
          ))}
        </div>
        <Callout kind='note'>50% net retention is what a well-run LRM home delivers when fees are tiered to revenue band, taxes are structured under the optional regime, and cleaning costs are passed through to guests. Below 35%, something in the operating stack is leaking.</Callout>
      </Prose>
      <div style={{ margin: '40px 0' }}>
        <GuideChart kind='projection'
          caption='Five-year annual net cash flow (illustrative) using the same Year-2 stabilized baseline shown above: MXN 1.25M base, with bear and bull scenarios bracketing realistic ±15% variance from rate, occupancy, and cost shifts. Year 1 is below stabilized in all three cases — same property, same fee structure, different demand assumptions.'
          illustrative />
      </div>
    </article>
  );
}

function Ch26() {
  return (
    <article>
      <ChapterHead num='26' part='VI' title='Appreciation & Exit Strategy' dek='Buyers do not just buy walls. They buy confidence in future income.' />
      <Prose>
        <H3 num='26.1'>A well-performing rental is more attractive at exit if it has</H3>
        <Checklist columns={2} items={[
          'Clean revenue history', 'Professional financial reports',
          'High-quality photography', 'Strong reviews',
          'Documented maintenance', 'Clear inventory list',
          'Repeat guest database', 'Professional operating systems',
          'Transferable staff or management structure', 'Transparent tax records',
        ]} />
        <P>If a property has strong books, strong reviews, and a professional management history, it supports a stronger resale narrative than a similar home with no operating records.</P>
      </Prose>
    </article>
  );
}

function Ch27() {
  const services = [
    'Pre-purchase rental analysis', 'Comparable property review', 'Revenue projections',
    'Upgrade recommendations', 'Furnishing & setup guidance', 'Listing strategy',
    'Professional photography coordination', 'Dynamic pricing', 'Multi-channel distribution',
    'Direct booking strategy', 'Guest communication', 'Concierge services',
    'Private transportation', 'Chef & experience coordination', 'Housekeeping oversight',
    'Maintenance coordination', 'Owner reporting', 'Tax & accounting coordination',
    'Operational planning', 'Long-term asset protection',
  ];
  return (
    <article>
      <ChapterHead num='27' part='VI' title='How LRM Helps Buyers' dek='The role is not just &ldquo;property management.&rdquo; The role is investment execution.' />
      <Prose>
        <div className='guide-services-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, margin: '32px 0', border: '1px solid rgba(20,19,15,0.12)' }}>
          {services.map((s, i) => (
            <div key={s} style={{
              padding: '14px 20px',
              borderTop: i >= 2 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              borderRight: i % 2 === 0 ? '1px solid rgba(20,19,15,0.08)' : 'none',
              fontSize: 14, color: 'var(--ink-2)',
            }}>
              <span className='mono' style={{ fontSize: 10, color: 'var(--gold)', marginRight: 10, letterSpacing: '0.14em' }}>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </div>
          ))}
        </div>
        <Callout kind='rule'>The goal is to help buyers avoid emotional decisions — and buy homes that can perform.</Callout>
      </Prose>
    </article>
  );
}

function Ch28() {
  return (
    <article>
      <ChapterHead num='28' part='VI' title='The Ideal Buyer Profile' dek='Someone who understands that the property is both a home and a hospitality asset.' />
      <Prose>
        <ComparisonGrid
          leftLabel='The right buyer'
          rightLabel='The wrong buyer'
          leftItems={[
            'Wants to own a beautiful property in SMA',
            'Is realistic about returns',
            'Can invest in proper furnishing & maintenance',
            'Understands that management quality matters',
            'Is willing to price dynamically',
            'Does not block the best dates and then complain about revenue',
            'Treats the home like an income-producing asset',
            'Accepts that taxes & compliance matter',
            'Values long-term asset protection',
            'Wants professional reporting & accountability',
          ]}
          rightItems={[
            'Wants luxury revenue with discount-level investment',
            'Blocks every peak weekend',
            'Ignores maintenance until it becomes a crisis',
            "Resists pricing strategy (\"I won't go below X\")",
            'Hires the cheapest manager for a luxury asset',
            'Improvises on tax structure',
            'Skips reserves',
            'Blames the market when the model breaks',
          ]}
        />
      </Prose>
    </article>
  );
}

function Ch29() {
  return (
    <article>
      <ChapterHead num='29' part='VII' title='Recommended Buyer Process' dek='Nine phases from goal-setting to ongoing asset management.' />
      <Prose>
        {PROCESS_PHASES.map(p => (
          <div key={p.n} className='guide-step-row' style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, padding: '22px 0', borderTop: '1px solid rgba(20,19,15,0.12)', alignItems: 'baseline' }}>
            <div className='display tnum' style={{ fontSize: 32, color: 'var(--gold)', letterSpacing: '-0.02em' }}>{p.n}</div>
            <div>
              <div className='display' style={{ fontSize: 22, lineHeight: 1.2 }}>Phase {p.n} · {p.t}</div>
              <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{p.d}</p>
            </div>
          </div>
        ))}
      </Prose>
    </article>
  );
}

function Ch30() {
  return (
    <article>
      <ChapterHead num='30' part='VII' title='Buyer Checklist' dek='If any of these are missing, the buyer is not ready.' />
      <Prose>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          padding: '14px 18px', background: '#FAF6EC',
          border: '1px solid rgba(20,19,15,0.12)', borderLeft: '3px solid var(--gold)',
          marginBottom: 8,
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className='mono' style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8E6F2D', marginBottom: 4 }}>
              Use this as you work
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>
              Click any box below to check it off — your progress saves automatically across sessions.
            </div>
          </div>
        </div>
        {BUYER_CHECKLIST.map((g, i) => (
          <div key={g.c} style={{ marginTop: 32 }}>
            <div className='mono' style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
              {String(i + 1).padStart(2, '0')} · {g.c}
            </div>
            <InteractiveChecklist items={g.i} storageKey={`buyer-checklist-${i}`} />
          </div>
        ))}
      </Prose>
    </article>
  );
}

function Ch31() {
  const dont = [
    'Do not buy based on charm alone.',
    'Do not assume Airbnb will solve the economics.',
    'Do not trust seller revenue claims without records.',
    'Do not ignore taxes.',
    'Do not underfund furnishing.',
    'Do not underestimate maintenance.',
    'Do not block peak dates and expect investment-level returns.',
    'Do not hire weak management for a luxury asset.',
  ];
  return (
    <article>
      <ChapterHead num='31' part='VII' title='Final Buyer Advice' dek='The right home, bought at the right price, operated by the right team — can be a strong long-term asset. The wrong home, bought emotionally and operated casually — becomes an expensive hobby.' />
      <Prose>
        <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0' }}>
          {dont.map((line, i) => (
            <li key={i} className='guide-dont-row' style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, padding: '16px 0', borderTop: '1px solid rgba(20,19,15,0.12)', alignItems: 'baseline' }}>
              <span className='mono' style={{ fontSize: 11, color: '#9B4A3A', letterSpacing: '0.14em' }}>×</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1.3, color: 'var(--ink)' }}>{line}</span>
            </li>
          ))}
        </ul>
        <Pullquote attribution='The difference is discipline'>
          San Miguel can be an excellent market for the right buyer — international recognition, heritage appeal, cultural tourism, weddings, events, architecture, gastronomy, lifestyle. But the market is not forgiving to lazy underwriting.
        </Pullquote>
      </Prose>
    </article>
  );
}

export const CHAPTERS_LIST = [
  Ch01, Ch02, Ch03, Ch04, Ch05, Ch06, Ch07, Ch08, Ch09, Ch10,
  Ch11, Ch12, Ch13, Ch14, Ch15, Ch16, Ch17, Ch18, Ch19, Ch20,
  Ch21, Ch22, Ch23, Ch24, Ch25, Ch26, Ch27, Ch28, Ch29, Ch30, Ch31,
];
