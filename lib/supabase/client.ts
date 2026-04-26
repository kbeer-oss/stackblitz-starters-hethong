'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  browserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return browserClient;
}
