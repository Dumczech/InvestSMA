import './globals.css';
import { Nav, Ticker, Footer } from '@/components/site';
import { getNavPages, getTickerItems, getFooterConfig } from '@/lib/data/editorial';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

// Editorial serif (display) + sans (body) + mono (data) per the design system.
const inter = Inter({
  subsets: ['latin'],
  variable: '--f-sans',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--f-display',
  display: 'swap',
});
const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--f-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'InvestSMA | San Miguel de Allende Real Estate Investment',
  description:
    'Data-backed intelligence for San Miguel de Allende luxury rental and second-home investments.',
};

// Top-of-page chrome (Nav + Ticker) sits above every route's content;
// Footer renders below. Chrome content (nav links, ticker items, footer
// columns) is loaded server-side from site_content so admins can edit
// without code changes.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [pages, tickerItems, footerConfig] = await Promise.all([
    getNavPages(),
    getTickerItems(),
    getFooterConfig(),
  ]);
  return (
    <html className={`${inter.variable} ${cormorant.variable} ${jbMono.variable}`}>
      <body>
        <Nav pages={pages} />
        <Ticker items={tickerItems} />
        {children}
        <Footer config={footerConfig} />
      </body>
    </html>
  );
}
