import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
export async function GET(){try{const s=getSupabaseServerClient(); const {data}=await s.from('site_content').select('*').order('key'); return NextResponse.json({ok:true,data});}catch{return NextResponse.json({ok:false,data:[]});}}
export async function POST(req:NextRequest){const body=await req.json(); try{const s=getSupabaseServerClient(); const {error}=await s.from('site_content').upsert({key:body.key,value:body.value,status:body.status||'published',updated_by:'admin'},{onConflict:'key'}); if(error) throw error; return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false},{status:500});}}
