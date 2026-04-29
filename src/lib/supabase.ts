import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side and default access (Read-only for public data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side only client (Bypasses RLS)
// This should ONLY be used in Server Actions or API Routes where admin privileges are needed (e.g. creating/deleting subscriptions)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local. Falling back to anon key for server actions. This might cause RLS errors.");
    return supabase;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
