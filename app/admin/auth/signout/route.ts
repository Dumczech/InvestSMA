import { NextResponse } from 'next/server';
import { getSupabaseServerAuthClient } from '@/lib/supabase/auth-server';

// POST /admin/auth/signout · clears the Supabase session cookie and
// bounces back to /admin/login. Exposed under /admin/auth/* so the
// middleware exempts it (otherwise the redirect would loop).

export async function POST(req: Request) {
  const supabase = await getSupabaseServerAuthClient();
  await supabase.auth.signOut();
  const url = new URL('/admin/login', req.url);
  return NextResponse.redirect(url, { status: 303 });
}
