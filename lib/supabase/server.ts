/**
 * Supabase server client.
 *
 * Uses the service role key. NEVER import this in a client component.
 * The service role key bypasses RLS and must stay server-side only.
 *
 * For client-side reads (none currently needed for AI Readiness), create a
 * browser client with the anon key in a separate lib/supabase/client.ts.
 *
 * Required env vars (set in Vercel + .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your environment (Vercel + .env.local).'
    );
  }
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment as a server-only secret.'
    );
  }

  cached = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
