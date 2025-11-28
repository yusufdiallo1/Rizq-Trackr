import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

// Client-side Supabase client (singleton pattern to prevent multiple instances)
// Lazy initialization to avoid build-time errors when env vars are missing
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null;
export const createSupabaseClient = () => {
  if (!supabaseClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    supabaseClientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClientInstance;
};

// Auth helpers client (for server components) - use singleton pattern
// Lazy initialization to avoid build-time errors
let authHelpersClientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;
export const getSupabaseAuthClient = () => {
  if (!authHelpersClientInstance) {
    authHelpersClientInstance = createClientComponentClient<Database>();
  }
  return authHelpersClientInstance;
};

// Lazy getter functions instead of module-level initialization
export const getSupabase = () => getSupabaseAuthClient();
export const getDefaultSupabaseClient = () => createSupabaseClient();

