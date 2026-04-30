// Seeds legal_documents from the content authored in the design's legal.jsx.
// Runs from src/seed.js and on first boot.

const repo = require('./repo/legal');

const DISCLOSURES_ITEMS = [
  { n: '01', t: 'Not a real estate brokerage',
    d: 'InvestSMA is not a licensed real estate broker or agent. We do not represent buyers or sellers in real estate transactions. We may refer clients to licensed agents or collaborate with agents selected by the client, but we do not participate in brokerage activities or earn commissions from the sale of real estate unless explicitly disclosed.' },
  { n: '02', t: 'No investment, legal, or tax advice',
    d: 'All information provided by InvestSMA is for informational purposes only. Nothing on this website or in our communications should be interpreted as investment, legal, or tax advice. Investors are responsible for conducting their own due diligence and should consult with licensed professionals before making any investment decisions.' },
  { n: '03', t: 'Performance and ROI projections',
    d: 'Any financial projections, income estimates, or return assumptions are based on historical operating data, market trends, and internal analysis. These projections are not guarantees of future performance. Actual results may vary significantly due to market conditions, property-specific factors, regulatory changes, and other variables outside of our control.' },
  { n: '04', t: 'Operational performance',
    d: 'While Luxury Rental Management has a track record of strong performance across its portfolio, past performance is not indicative of future results. Individual property performance will depend on a variety of factors including location, design, pricing strategy, competition, and market demand.' },
  { n: '05', t: 'Third-party relationships',
    d: 'We may introduce clients to third-party service providers, including real estate agents, attorneys, designers, and contractors. These parties operate independently, and InvestSMA is not responsible for their actions, services, or outcomes.' },
  { n: '06', t: 'No guarantees',
    d: 'InvestSMA does not guarantee occupancy rates, rental income, property appreciation, or investment returns. All investments carry risk, and investors should be prepared for variability in performance.' },
  { n: '07', t: 'Investor responsibility',
    d: 'All investment decisions are made solely by the investor. By using this website or engaging with InvestSMA, you acknowledge that you are responsible for evaluating the risks and merits of any investment.' },
];

const TERMS_ITEMS = [
  { n: '01', t: 'Use of information',
    d: 'The content on this website is provided for general informational purposes only. While InvestSMA aims to provide accurate and up-to-date information, we make no representations or warranties regarding the completeness, accuracy, or reliability of any content.' },
  { n: '02', t: 'No reliance',
    d: 'You agree not to rely solely on the information provided on this website when making investment decisions. Any reliance you place on such information is strictly at your own risk.' },
  { n: '03', t: 'No advisory relationship',
    d: 'Your use of this website or communication with InvestSMA does not create an advisory, fiduciary, or agency relationship. We do not act as your financial advisor, real estate broker, or legal representative.' },
  { n: '04', t: 'Limitation of liability',
    d: 'To the fullest extent permitted by law, InvestSMA and its affiliates shall not be liable for any direct, indirect, incidental, or consequential losses or damages arising from:',
    list: [
      'Use of or reliance on this website',
      'Investment decisions made based on our content',
      'Errors or omissions in information provided',
      'Actions taken by third-party service providers',
    ] },
  { n: '05', t: 'Third-party links and services',
    d: 'This website may contain links to third-party websites or references to third-party services. InvestSMA does not control or endorse these third parties and is not responsible for their content, services, or practices.' },
  { n: '06', t: 'Intellectual property',
    d: 'All content on this website, including text, branding, and materials, is the property of InvestSMA unless otherwise stated. You may not reproduce, distribute, or use this content without prior written permission.' },
  { n: '07', t: 'Modifications',
    d: 'InvestSMA reserves the right to update or modify these Terms of Use at any time without prior notice. Continued use of the website constitutes acceptance of any changes.' },
  { n: '08', t: 'Governing law',
    d: 'These Terms shall be governed by and interpreted in accordance with applicable laws, without regard to conflict of law principles.' },
];

const VERSION = 'v1.0';
const DOC_CODE = 'INV-LGL-2026-Q2';
const LAST_UPDATED = '2026-04-30';

function seedLegal() {
  repo.upsertDocument({
    slug: 'disclosures',
    sectionNum: '1',
    title: 'Disclosures',
    intro: 'InvestSMA provides information, analysis, and operational insight related to real estate opportunities in San Miguel de Allende. The disclosures below clarify our role and set appropriate expectations.',
    items: DISCLOSURES_ITEMS,
    version: VERSION,
    docCode: DOC_CODE,
    lastUpdated: LAST_UPDATED,
  });
  repo.upsertDocument({
    slug: 'terms',
    sectionNum: '2',
    title: 'Terms of Use',
    intro: 'By accessing or using this website, you agree to the following terms and conditions. If you do not agree, you should not use this site.',
    items: TERMS_ITEMS,
    version: VERSION,
    docCode: DOC_CODE,
    lastUpdated: LAST_UPDATED,
  });
}

if (require.main === module) seedLegal();

module.exports = { seedLegal, DISCLOSURES_ITEMS, TERMS_ITEMS, VERSION, DOC_CODE, LAST_UPDATED };
