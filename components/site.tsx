'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Property } from '@/types/property';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

export const Navbar=()=> <header className='sticky top-0 z-50 border-b border-white/10 bg-charcoal/90 backdrop-blur'><nav className='mx-auto flex max-w-6xl items-center justify-between p-4'><Link href='/' className='font-semibold text-sand'>InvestSMA</Link><div className='flex gap-4 text-sm'>{['properties','market-data','roi-calculator','insights','contact'].map(i=><Link key={i} href={`/${i}`}>{i.replace('-',' ')}</Link>)}</div></nav></header>;
export const Footer=()=> <footer className='border-t border-white/10 p-8 text-center text-sm text-white/70'>Powered by Luxury Rental Management · San Miguel de Allende</footer>;
export const SectionHeader=({title,subtitle}:{title:string;subtitle:string})=><div className='mb-6'><h2 className='text-3xl font-semibold'>{title}</h2><p className='mt-2 text-white/70'>{subtitle}</p></div>;
export const PropertyCard = ({ p }: { p: Property }) => {
  const heroSrc = p.images?.[0];
  return (
    <motion.div whileHover={{ y: -4 }} className='card p-4'>
      <div className='h-40 rounded-xl overflow-hidden bg-green/40 relative'>
        {heroSrc && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroSrc}
            alt={p.name}
            className='absolute inset-0 h-full w-full object-cover'
            loading='lazy'
          />
        )}
      </div>
      <h3 className='mt-4 text-xl'>{p.name}</h3>
      <p className='text-white/70'>{p.neighborhood} · {p.bedrooms} BR · {p.price}</p>
      <p className='mt-2 text-sm'>ADR {p.adr}</p>
      <p className='text-sm'>Annual Gross {p.annualGross}</p>
      <p className='mt-2 text-sm text-sand'>{p.upgradePotential}</p>
      <Link className='mt-3 inline-block text-gold' href={`/properties/${p.slug}`}>View Investment Memo</Link>
    </motion.div>
  );
};
export const MetricCard=({label,value}:{label:string;value:string})=><div className='card p-4'><div className='text-2xl text-sand'>{value}</div><div className='text-sm text-white/70'>{label}</div></div>;
export const DataChartCard=({title,data,x,y,line}:{title:string;data:any[];x:string;y:string;line?:boolean})=><div className='card p-4'><h3 className='mb-3'>{title}</h3><div className='h-56'>{line?<ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray='3 3' stroke='#333'/><XAxis dataKey={x} stroke='#F4F0E6'/><YAxis stroke='#F4F0E6'/><Tooltip/><Line dataKey={y} stroke='#BFA160'/></LineChart></ResponsiveContainer>:<ResponsiveContainer><BarChart data={data}><XAxis dataKey={x} stroke='#F4F0E6'/><YAxis stroke='#F4F0E6'/><Tooltip/><Bar dataKey={y} fill='#2B4A3F'/></BarChart></ResponsiveContainer>}</div></div>;
