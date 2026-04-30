import './globals.css';
import { Navbar, Footer } from '@/components/site';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'InvestSMA | San Miguel de Allende Real Estate Investment', description: 'Data-backed intelligence for San Miguel de Allende luxury rental and second-home investments.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html><body><Navbar/>{children}<a href='/contact' className='fixed bottom-4 right-4 rounded-full bg-gold px-4 py-2 text-black md:hidden'>Investor Access</a><Footer/></body></html>}
