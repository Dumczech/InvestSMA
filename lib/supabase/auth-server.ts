import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Cookie-aware Supabase client for server contexts (RSC + route
// handlers). Reads/writes the session cookie via next/headers.
// Service-role admin work should keep using getSupabaseServerClient()
// in server.ts — this helper is only for "is this request
// authenticated?" checks.

export async function getSupabaseServerAuthClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient<Database>(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        // RSC contexts can't write cookies; route handlers can. Try, but
        // swallow the failure when called from a Server Component so
        // reads still work for `getUser()`.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {}
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}
