// Buyer's Guide — content data. Pure exports, no JSX.

export const GUIDE_PARTS = [
  { id: 'thesis',  num: 'I',   title: 'The Investment Thesis',                  chapters: ['01', '02', '03'] },
  { id: 'asset',   num: 'II',  title: 'Selecting the Asset',                    chapters: ['04', '05', '06', '07', '08', '09'] },
  { id: 'numbers', num: 'III', title: 'The Numbers',                            chapters: ['10', '11', '12', '13', '14', '15'] },
  { id: 'legal',   num: 'IV',  title: 'Legal, Tax & Foreign Ownership',         chapters: ['16', '17', '18'] },
  { id: 'ops',     num: 'V',   title: 'Operating the Asset',                    chapters: ['19', '20', '21', '22'] },
  { id: 'process', num: 'VI',  title: 'Buyer Process & Discipline',             chapters: ['23', '24', '25', '26', '27', '28'] },
  { id: 'close',   num: 'VII', title: 'Checklists & Final Word',                chapters: ['29', '30', '31'] },
] as const;

export type GuidePartId = typeof GUIDE_PARTS[number]['id'];

export const GUIDE_CHAPTERS: Array<{ num: string; part: GuidePartId; title: string; summary: string }> = [
  { num: '01', part: 'thesis',  title: 'Why San Miguel de Allende Is an Attractive Investment Market', summary: 'International recognition, UNESCO heritage, weddings & events, fragmented operator base.' },
  { num: '02', part: 'thesis',  title: 'The Core Investment Thesis', summary: 'Buy a scarce, well-located, emotionally compelling home. Operate it professionally. Use STR income to offset ownership cost and improve yield.' },
  { num: '03', part: 'thesis',  title: 'What the Current STR Data Says', summary: 'AirDNA, Airbtics, AirROI, CEIC: the numbers vary. Why average performance is not the target.' },
  { num: '04', part: 'asset',   title: 'Do Not Buy the Average Home', summary: 'Underwrite against the relevant competitive set, not the whole market.' },
  { num: '05', part: 'asset',   title: 'Traits of the Best STR Investment Homes', summary: 'Walkability, three-plus bedrooms, distinctive design, views, layout for groups.' },
  { num: '06', part: 'asset',   title: 'Location: What to Prioritize', summary: 'Centro, Guadiana, Ojo de Agua, Parque Juárez. Slope, noise, parking, view corridor.' },
  { num: '07', part: 'asset',   title: 'Bedroom Count & Guest Economics', summary: 'Revenue per bedroom, bath ratios, staff requirements, cleaning complexity.' },
  { num: '08', part: 'asset',   title: 'Amenities That Move Revenue', summary: 'High-impact: heated pool, rooftop, A/C, pro photography. Low-impact: imported chairs.' },
  { num: '09', part: 'asset',   title: 'Furnishing & Design as Conversion', summary: 'Durable luxury. Photographs well, withstands guest use, easy to maintain.' },
  { num: '10', part: 'numbers', title: 'Revenue Is Created Before the Guest Arrives', summary: 'Photography, listing copy, pricing, calendar, reviews, response speed, ranking.' },
  { num: '11', part: 'numbers', title: 'Distribution: Do Not Rely on One Platform', summary: 'Airbnb plus direct booking, OTAs, luxury partners, repeat guest database.' },
  { num: '12', part: 'numbers', title: 'Pricing Strategy: Dynamic, Not Emotional', summary: 'Seasonality, lead time, day of week, events, orphan nights, owner blocks.' },
  { num: '13', part: 'numbers', title: 'Occupancy Alone Is Not the Goal', summary: 'Optimized revenue after costs. Net income, not vanity occupancy.' },
  { num: '14', part: 'numbers', title: 'The Underwriting Model You Should Use', summary: 'Conservative, base, optimistic. If it only works in optimistic, it is not a deal.' },
  { num: '15', part: 'numbers', title: 'Conservative Underwriting Assumptions', summary: 'Reduce revenue 10–20%, increase maintenance, model slow ramp, reserve capex.' },
  { num: '16', part: 'legal',   title: 'Sample Investment Framework', summary: 'Objective, target guest, competitive set, revenue, expenses, fair price.' },
  { num: '17', part: 'legal',   title: 'Taxes & Compliance in Mexico', summary: 'SAT regime for digital platforms. ISR, IVA, platform withholdings, RFC.' },
  { num: '18', part: 'legal',   title: 'Foreign Ownership Considerations', summary: 'SMA is inland — no fideicomiso required. Title, permits, water rights, HOA.' },
  { num: '19', part: 'ops',     title: 'Operating Risk: The Part Buyers Underestimate', summary: 'What professional STR management actually is — far beyond "rents it out."' },
  { num: '20', part: 'ops',     title: 'Maintenance Reserve: Assume Things Will Break', summary: 'STR wear differs from owner-occupied. Budget for the inevitable.' },
  { num: '21', part: 'ops',     title: 'Staffing & Labor Risk', summary: 'Inheriting staff. Employee vs contractor. Severance exposure in Mexico.' },
  { num: '22', part: 'ops',     title: 'Owner Usage: The Hidden Revenue Killer', summary: 'Christmas, Semana Santa, Día de Muertos. The cost of blocking peak dates.' },
  { num: '23', part: 'process', title: 'What to Ask Before Purchasing', summary: '20+ diligence questions to pressure-test the deal.' },
  { num: '24', part: 'process', title: 'Red Flags That Should Slow You Down', summary: 'Things sellers say that are usually naive or self-serving.' },
  { num: '25', part: 'process', title: 'Gross Revenue Is Not Owner Income', summary: 'The full P&L stack from gross nightly rate to net owner payout.' },
  { num: '26', part: 'process', title: 'Appreciation & Exit Strategy', summary: 'Buyers do not just buy walls. They buy confidence in future income.' },
  { num: '27', part: 'process', title: 'How LRM Helps Buyers', summary: 'Investment execution, not just property management.' },
  { num: '28', part: 'process', title: 'The Ideal Buyer Profile', summary: 'Realistic, willing to invest, accepts compliance, values reporting.' },
  { num: '29', part: 'close',   title: 'Recommended Buyer Process', summary: 'Nine phases from goal-setting to ongoing asset management.' },
  { num: '30', part: 'close',   title: 'Buyer Checklist', summary: '25 items to confirm before closing. If any are missing, you are not ready.' },
  { num: '31', part: 'close',   title: 'Final Buyer Advice', summary: 'The right home, bought at the right price, operated by the right team.' },
];

export const PART_SUMMARIES: Record<GuidePartId, string> = {
  thesis:  'The case for SMA, the framework for thinking, and what the available data does and does not tell you.',
  asset:   'How to choose a home that will perform — location, layout, amenities, design, and bedroom economics.',
  numbers: 'Pricing, distribution, occupancy, and the underwriting model that separates a deal from a gamble.',
  legal:   'Mexican tax obligations, foreign-buyer mechanics, and the legal review every closing requires.',
  ops:     'Operating risk, maintenance reality, staffing exposure, and the cost of personal use.',
  process: 'Diligence questions, red flags, the full P&L stack, and the buyer profile that succeeds.',
  close:   'The phased process, the closing checklist, and the final discipline that separates assets from hobbies.',
};

export const STR_DATA_SOURCES = [
  { src: 'AirDNA',         listings: '4,003', occ: '37%',     adr: '$175', annual: 'MXN 1,242,482',         period: 'Trailing' },
  { src: 'Airbtics',       listings: '2,149', occ: '44%',     adr: '—',    annual: 'MXN 309,000 (median)',  period: 'Feb 2025 – Jan 2026' },
  { src: 'AirROI',         listings: '—',     occ: '30.3%',   adr: '$205', annual: '$17,475 USD',           period: 'Apr 2025 – Mar 2026' },
  { src: 'CEIC (Hotels)',  listings: '—',     occ: '46.17%',  adr: '—',    annual: '—',                     period: 'Week of Feb 1, 2026' },
];

export const HIGH_IMPACT_AMENITIES = [
  'Heated pool or jacuzzi',
  'Rooftop terrace with views',
  'Outdoor dining',
  'Fireplaces or fire pits',
  'Air conditioning in bedrooms',
  'High-quality mattresses & linens',
  'Private chef-capable kitchen',
  'Dedicated workspace, strong internet',
  'Daily housekeeping option',
  'Concierge services',
  'Secure parking or driver access',
  'Professional photography & staging',
];

export const LOW_IMPACT_AMENITIES = [
  'Imported designer accent chair',
  'Curated coffee-table books',
  'Designer soap dispensers',
  'Statement art that does not photograph',
  'Bespoke bedside tables',
  'Boutique cutlery sets',
];

export const PROCESS_PHASES = [
  { n: '01', t: 'Investment Goals',     d: 'Define budget, desired use, income target, area, risk tolerance, financing. Lifestyle vs. income vs. appreciation.' },
  { n: '02', t: 'Property Search',      d: 'Work with a qualified advisor to identify homes that meet the investment profile.' },
  { n: '03', t: 'Rental Underwriting',  d: 'Review comparable STRs, bedroom economics, location, amenities, ADR, occupancy, costs, upgrade needs — before serious offer.' },
  { n: '04', t: 'Legal & Tax Review',   d: 'Engage Mexican legal and accounting professionals for ownership structure, tax obligations, closing docs, title, permits.' },
  { n: '05', t: 'Offer Strategy',       d: 'Use underwriting to determine the maximum rational purchase price. Do not let emotion set the number.' },
  { n: '06', t: 'Setup Budget',         d: 'Estimate furnishing, improvements, photography, linens, supplies, smart locks, WiFi, staff setup, owner closets.' },
  { n: '07', t: 'Launch',               d: 'Prepare the home professionally before listing. Bad first reviews damage long-term performance.' },
  { n: '08', t: 'Optimization',         d: 'Track performance weekly and monthly. Adjust pricing, minimum stays, photos, listing copy, amenities, maintenance.' },
  { n: '09', t: 'Asset Management',     d: 'Review annual performance, capital improvements, guest feedback, owner usage, competitive positioning.' },
];

export const RED_FLAGS = [
  '"This home will definitely pay for itself."',
  '"You can rent it for whatever you want."',
  '"The owner says it made a lot, but there are no records."',
  '"It only needs furniture."',
  '"The staff comes with the house."',
  '"There are no maintenance issues."',
  '"Everyone wants to stay in this area."',
  '"You can just put it on Airbnb."',
  '"The taxes are easy."',
  '"You do not need professional management."',
  '"Luxury guests will pay anything."',
];

export type PnlTone = 'pos' | 'neg' | 'final';
export const PNL_STACK: Array<{ line: string; val: string; tone: PnlTone; note: string }> = [
  { line: 'Gross annual revenue',                            val: 'MXN 2,500,000',  tone: 'pos',   note: 'Top-line — what gets advertised. ~MXN 6,800 ADR × 365 × 60% occupancy.' },
  { line: 'Less platform / channel fees',                    val: '−MXN 100,000',   tone: 'neg',   note: '~4% blended across Booking, Airbnb, direct.' },
  { line: 'Less LRM management fee',                         val: '−MXN 400,000',   tone: 'neg',   note: '16% on this revenue band — tiered down from the 25% headline rate for higher-grossing homes.' },
  { line: 'Less cleaning & turnovers',                       val: '$0',             tone: 'neg',   note: 'Pass-through — guest cleaning fees fully cover housekeeping turns.' },
  { line: 'Less utilities',                                  val: '−MXN 90,000',    tone: 'neg',   note: 'CFE, water, gas, propane. Higher than owner-occupied — pool, A/C, hot water.' },
  { line: 'Less maintenance & repairs',                      val: '−MXN 100,000',   tone: 'neg',   note: '4% of gross. Pool service, garden, ongoing fixes.' },
  { line: 'Less staff (housekeeping, gardener)',             val: '−MXN 140,000',   tone: 'neg',   note: 'Recurring labor with IMSS, aguinaldo, vacation premium.' },
  { line: 'Less taxes (ISR, IVA, withholdings)',             val: '−MXN 240,000',   tone: 'neg',   note: 'Optional regime with deductions — ~10% effective on net rental income.' },
  { line: 'Less accounting & insurance',                     val: '−MXN 80,000',    tone: 'neg',   note: 'Fiscal accountant, liability, contents, earthquake.' },
  { line: 'Less reserves & replacements',                    val: '−MXN 100,000',   tone: 'neg',   note: '4% of gross for capex — linens, electronics, refresh.' },
  { line: 'Net to owner (pre-debt, pre-personal-tax)',       val: 'MXN 1,250,000',  tone: 'final', note: '50% owner retention — what a well-run LRM home delivers when fees are tiered, taxes are structured properly, and cleaning is passed through.' },
];

export const BUYER_CHECKLIST: Array<{ c: string; i: string[] }> = [
  { c: 'Title & Legal',     i: ['Clear title reviewed by attorney', 'Property taxes current', 'No hidden liens', 'HOA rules reviewed', 'STR restrictions reviewed'] },
  { c: 'Physical',          i: ['Utilities functioning', 'Water pressure & hot water tested', 'Roof & waterproofing reviewed', 'Electrical capacity reviewed', 'Plumbing inspected', 'Internet quality verified'] },
  { c: 'Location & Access', i: ['Noise checked at different times', 'Guest access tested', 'Walkability assessed', 'Parking or driver access understood'] },
  { c: 'Operations',        i: ['Staff arrangements reviewed', 'Comparable rental data reviewed', 'Revenue projection completed', 'Expense projection completed'] },
  { c: 'Ownership',         i: ['Tax structure reviewed', 'Furniture budget created', 'Maintenance reserve established', 'Management agreement reviewed', 'Owner usage plan created', 'Exit strategy considered'] },
];
