import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Gate every /admin/* page and /api/admin/* endpoint behind a
// Supabase Auth session. UI requests redirect to /admin/login?next=...;
// API requests get a 401 JSON response. /admin/login itself is exempt
// so the unauthenticated user can actually log in.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/auth/');
  if (isLogin) return NextResponse.next();

  // Build a response that we'll attach refreshed cookies to.
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If env isn't configured we can't auth. Treat as unauthenticated so
  // the UI can't be browsed without setting up Supabase first.
  if (!url || !anon) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 401 });
    }
    return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value, options } of toSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
