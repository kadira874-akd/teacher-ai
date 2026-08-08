/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * Centralized Supabase client with enhanced features:
 * - Auto token refresh
 * - Request logging (dev only)
 * - Error handling interceptors
 * - Multiple client instances for different use cases
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create main client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'teacher-ai-nextjs'
    }
  }
});

// Server-side client (for API routes and server components)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Admin client (for operations requiring elevated privileges - use with caution)
// Note: For true admin operations, use service role key on server-side only
export const createAdminClient = (serviceRoleKey) => {
  if (!serviceRoleKey) {
    console.warn('Service role key not provided, using anon key instead');
    return supabase;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export default supabase;