import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
export async function POST(req:NextRequest){const {table,importBatchId}=await req.json(); try{const supabase=getSupabaseServerClient(); await supabase.from(table).update({status:'published'}).eq('import_batch_id',importBatchId).eq('status','verified'); return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false},{status:500});}}
