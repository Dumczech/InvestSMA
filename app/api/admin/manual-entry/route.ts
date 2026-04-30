import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
export async function POST(req:NextRequest){const body=await req.json(); try{const supabase=getSupabaseServerClient(); const {error}=await supabase.from(body.table).insert({...body.row,status:'draft',source_type:body.sourceType||'manual'}); if(error) throw error; return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false,error:'Manual entry failed'},{status:500});}}
