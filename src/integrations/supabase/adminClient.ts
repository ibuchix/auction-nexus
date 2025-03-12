
// This file contains a Supabase client with admin privileges
// It should ONLY be used in admin-specific contexts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These values will be replaced by environment variables in production
const SUPABASE_URL = "https://sdvakfhmoaoucmhbhwvy.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

// Create a separate client with the service role key for admin operations
// This client bypasses RLS policies and should only be used in admin contexts
export const adminSupabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist this admin session
      autoRefreshToken: false, // Don't refresh tokens
    },
    global: {
      headers: {
        // Special header to identify admin requests in server logs
        'x-admin-access': 'true'
      }
    }
  }
);
