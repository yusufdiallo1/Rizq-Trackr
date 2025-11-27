import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (singleton pattern to prevent multiple instances)
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null;
export const createSupabaseClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClientInstance;
};

// Auth helpers client (for server components) - use singleton pattern
let authHelpersClientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;
export const getSupabaseAuthClient = () => {
  if (!authHelpersClientInstance) {
    authHelpersClientInstance = createClientComponentClient<Database>();
  }
  return authHelpersClientInstance;
};

// Default export for convenience (use singleton)
export const supabase = getSupabaseAuthClient();
export default createSupabaseClient();

