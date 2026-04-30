'use client';
import { useState } from 'react';

export default function Page(){
  const [msg,setMsg]=useState('');
  const upload=async(e:any)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const r=await fetch('/api/admin/import-csv',{method:'POST',body:fd}); const j=await r.json(); setMsg(JSON.stringify(j));};
  const manual=async()=>{const r=await fetch('/api/admin/manual-entry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({table:'market_monthly_performance',sourceType:'manual',row:{period:'2026',month:4,year:2026,lrm_occupancy:68,lrm_adr:520,lrm_revpar:354}})}); setMsg(JSON.stringify(await r.json()));};
  return <main className='mx-auto max-w-5xl p-6'><h1 className='text-2xl'>Import Center</h1><form onSubmit={upload} className='mt-4 card p-4 space-y-3'><input name='file' type='file' required/><input name='table' defaultValue='market_monthly_performance' className='bg-black/20 p-2 rounded'/><input name='sourceType' defaultValue='csv' className='bg-black/20 p-2 rounded'/><button className='bg-gold text-black rounded px-3 py-2'>Import CSV</button></form><div className='mt-4 card p-4'><button onClick={manual} className='bg-white/10 rounded px-3 py-2'>Manual entry (sample)</button></div><p className='mt-3 text-sm'>{msg}</p></main>}
