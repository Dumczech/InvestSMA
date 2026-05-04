import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Cookie-aware Supabase client for the browser. Used by the admin login
// flow + sidebar to read the current session.

export function getSupabaseBrowserAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient<Database>(url, anon);
}
