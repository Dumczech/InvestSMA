import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(){
  try{const s=getSupabaseServerClient(); const {data,error}=await s.from('media_assets').select('*').order('created_at',{ascending:false}); if(error) throw error; return NextResponse.json({ok:true,data});}
  catch{return NextResponse.json({ok:true,data:[],warning:'Using mock data. Connect Supabase to manage live data.'});}
}

export async function POST(req:NextRequest){
  try{
    const form=await req.formData();
    const file=form.get('file') as File | null;
    const module=String(form.get('module')||'general');
    const alt_text=String(form.get('alt_text')||'');
    if(!file) return NextResponse.json({ok:false,error:'Missing file'},{status:400});
    const s=getSupabaseServerClient();
    const filePath=`${Date.now()}-${file.name}`;
    const arr=await file.arrayBuffer();
    const { error: uploadError } = await s.storage.from('investsma-assets').upload(filePath, arr, {contentType:file.type,upsert:true});
    if(uploadError) throw uploadError;
    const {error} = await s.from('media_assets').insert({storage_bucket:'investsma-assets',storage_path:filePath,mime_type:file.type,module,alt_text,uploaded_by:'admin'});
    if(error) throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({ok:false,error:'Upload failed (configure Supabase bucket and env).'}, {status:500});}
}
