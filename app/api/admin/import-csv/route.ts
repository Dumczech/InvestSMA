import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const num=(v:string)=>Number(v);
export async function POST(req: NextRequest){
  const form=await req.formData();
  const file=form.get('file') as File | null;
  const table=String(form.get('table')||'market_monthly_performance');
  const sourceType=String(form.get('sourceType')||'csv');
  if(!file) return NextResponse.json({ok:false,error:'Missing file'},{status:400});
  const text=await file.text();
  const [headerLine,...lines]=text.trim().split(/\r?\n/); const headers=headerLine.split(',').map(h=>h.trim());
  const valid:any[]=[]; const errors:any[]=[]; const batchId=crypto.randomUUID();
  lines.forEach((line,idx)=>{ const cols=line.split(','); const row:any={}; headers.forEach((h,i)=>row[h]=cols[i]?.trim());
    const month=num(row.month),year=num(row.year),occ=num(row.lrm_occupancy),adr=num(row.lrm_adr),rev=num(row.lrm_revpar);
    const rowErrors:string[]=[];
    if(!month || !year) rowErrors.push('Month/year required');
    if(!sourceType) rowErrors.push('Source required');
    if(row.neighborhood===undefined && table.includes('neighborhood')) rowErrors.push('Neighborhood required');
    if(row.bedroom_count===undefined && table.includes('bedroom')) rowErrors.push('Bedroom count required');
    if(!Number.isNaN(occ) && (occ<0||occ>100)) rowErrors.push('Occupancy must be 0-100');
    if(!Number.isNaN(adr) && adr<=0) rowErrors.push('ADR must be positive');
    if(!Number.isNaN(adr) && !Number.isNaN(occ) && !Number.isNaN(rev) && Math.abs(rev-(adr*occ/100))>2) rowErrors.push('RevPAR mismatch');
    if(rowErrors.length) errors.push({row_number:idx+2,error_message:rowErrors.join('; '),raw_row:row,table_name:table,source_type:sourceType,period:row.period||`${year}`,import_batch_id:batchId,imported_file_name:file.name,error_code:'validation'});
    else valid.push({...row,source_type:sourceType,import_batch_id:batchId,imported_file_name:file.name,status:'draft'});
  });
  try{const supabase=getSupabaseServerClient(); if(valid.length) await supabase.from(table).insert(valid); if(errors.length) await supabase.from('data_validation_errors').insert(errors); await supabase.from('market_data_imports').insert({source_type:sourceType,period:'mixed',imported_file_name:file.name,import_batch_id:batchId,status:errors.length?'needs_review':'draft',notes:`valid=${valid.length}, errors=${errors.length}`});
  return NextResponse.json({ok:true,batchId,valid:valid.length,errors:errors.length});}catch{return NextResponse.json({ok:false,error:'Import failed'},{status:500});}
}
