import { NextResponse } from 'next/server';
import { getSupabaseServerAuthClient } from '@/lib/supabase/auth-server';

// Supabase Auth OAuth callback. The provider redirects here with a
// `code` query param; we exchange it for a session, which @supabase/ssr
// persists into the response cookies. Then we forward to ?next= (or
// /admin by default).

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/admin';

  if (code) {
    const supabase = await getSupabaseServerAuthClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
