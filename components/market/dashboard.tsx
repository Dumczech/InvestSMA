'use client';
import { useState } from 'react';
import { ViewMode, MonthlyPerformance, BedroomPerformance, NeighborhoodPerformance } from '@/types/market';
import { headlineMetrics } from '@/data/market';
import { formatValue } from '@/lib/formatters';
import { outperformanceLabel } from '@/lib/calculations';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';

export default function MarketDashboard({monthly,bedroom,neighborhood,usingMock}:{monthly:MonthlyPerformance[];bedroom:BedroomPerformance[];neighborhood:NeighborhoodPerformance[];usingMock:boolean}){
  const [mode,setMode]=useState<ViewMode>('compare');
  return <div className='space-y-6'>{usingMock&&<div className='rounded border border-amber-500 bg-amber-500/10 p-3 text-amber-200'>Using mock data. Connect Supabase to manage live data.</div>}
  <p className='text-white/70'>InvestSMA compares broader market data with LRM-managed portfolio performance to identify where professional management, pricing strategy, direct bookings, and concierge operations can improve investment outcomes.</p>
  <div className='flex gap-2'>{[['compare','Compare'],['lrm','LRM Portfolio'],['market','Market Average']].map(([v,l])=><button key={v} onClick={()=>setMode(v as ViewMode)} className={`rounded px-3 py-2 ${mode===v?'bg-gold text-black':'bg-white/10'}`}>{l}</button>)}</div>
  <div className='grid gap-4 md:grid-cols-4'>{headlineMetrics.map(m=><div key={m.id} className='card p-4'><div className='text-sm text-white/60'>{m.label}</div>{mode!=='market'&&<div>LRM: {formatValue(m.lrmValue,m.unit)}</div>}{mode!=='lrm'&&<div>Market: {formatValue(m.marketValue,m.unit)}</div>}{mode==='compare'&&<div className='text-sand text-sm'>Δ {formatValue(m.delta,m.unit)} · {outperformanceLabel(m.deltaPercent)}</div>}</div>)}</div>
  <div className='grid gap-4 md:grid-cols-2'><div className='card p-4 h-72'><h3>LRM vs Market Occupancy Trend</h3><ResponsiveContainer><LineChart data={monthly}><XAxis dataKey='month'/><YAxis/><Tooltip/><Legend/>{mode!=='market'&&<Line dataKey='lrmOccupancy' stroke='#BFA160'/>}{mode!=='lrm'&&<Line dataKey='marketOccupancy' stroke='#7f8c8d'/>}</LineChart></ResponsiveContainer></div>
  <div className='card p-4 h-72'><h3>LRM vs Market RevPAR by Month</h3><ResponsiveContainer><BarChart data={monthly}><XAxis dataKey='month'/><YAxis/><Tooltip/><Legend/>{mode!=='market'&&<Bar dataKey='lrmRevPAR' fill='#2B4A3F'/>}{mode!=='lrm'&&<Bar dataKey='marketRevPAR' fill='#888'/>}</BarChart></ResponsiveContainer></div>
  <div className='card p-4 h-72'><h3>LRM vs Market ADR by Bedroom Count</h3><ResponsiveContainer><BarChart data={bedroom}><XAxis dataKey='bedroomCount'/><YAxis/><Tooltip/><Legend/>{mode!=='market'&&<Bar dataKey='lrmADR' fill='#BFA160'/>}{mode!=='lrm'&&<Bar dataKey='marketADR' fill='#777'/>}</BarChart></ResponsiveContainer></div>
  <div className='card p-4'><h3>Direct Booking Advantage / Channel Mix</h3></div></div>
  <div className='card p-4 overflow-auto'><h3>Neighborhood Comparison Table</h3><table className='w-full text-sm mt-2'><tbody>{neighborhood.map(n=><tr key={n.neighborhood}><td>{n.neighborhood}</td><td>${n.lrmADR}</td><td>${n.marketADR}</td></tr>)}</tbody></table></div></div>
}
