import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error('Thiếu SUPABASE_SECRET_KEY');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
