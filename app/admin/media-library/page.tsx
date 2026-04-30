'use client';
import { useEffect, useState } from 'react';

type Asset={id:string;storage_path:string;mime_type:string;module:string;alt_text:string;created_at:string};

export default function Page(){
  const [assets,setAssets]=useState<Asset[]>([]);
  const [msg,setMsg]=useState('');
  const load=async()=>{const r=await fetch('/api/admin/media-assets'); const j=await r.json(); setAssets(j.data||[]); if(j.warning) setMsg(j.warning);};
  useEffect(()=>{load();},[]);
  const upload=async(e:any)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const r=await fetch('/api/admin/media-assets',{method:'POST',body:fd}); const j=await r.json(); setMsg(j.ok?'Upload complete':j.error); if(j.ok){e.currentTarget.reset(); load();}};

  return <main className='mx-auto max-w-6xl p-6'>
    <h1 className='text-2xl'>Media Library</h1>
    <p className='text-white/70 mt-2'>Manage images and files used across blogs, properties, and stats sections.</p>
    {msg && <div className='mt-3 rounded border border-amber-500 bg-amber-500/10 p-3 text-amber-200 text-sm'>{msg}</div>}
    <form onSubmit={upload} className='mt-4 card p-4 grid gap-3 md:grid-cols-4'>
      <input type='file' name='file' className='md:col-span-2' required />
      <input name='module' placeholder='module (property/blog/stats)' className='rounded bg-black/20 p-2'/>
      <input name='alt_text' placeholder='alt text' className='rounded bg-black/20 p-2'/>
      <button className='rounded bg-gold px-3 py-2 text-black md:col-span-4'>Upload Asset</button>
    </form>
    <div className='mt-6 grid gap-4 md:grid-cols-3'>
      {assets.map(a=><article key={a.id} className='card p-4'><div className='h-32 rounded bg-white/10'/><div className='mt-2 text-sm'>{a.storage_path}</div><div className='text-xs text-white/60'>{a.mime_type} · {a.module}</div><div className='text-xs text-white/50'>{a.alt_text}</div></article>)}
      {!assets.length && <div className='text-white/60'>No assets yet.</div>}
    </div>
  </main>
}
