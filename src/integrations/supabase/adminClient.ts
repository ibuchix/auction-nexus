
// This file contains a Supabase client with admin privileges
// It should ONLY be used in admin-specific contexts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These values will be replaced by environment variables in production
const SUPABASE_URL = "https://sdvakfhmoaoucmhbhwvy.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY is not set - admin operations will fail');
}

// Create a separate client with the service role key for admin operations
// This client bypasses RLS policies and should only be used in admin contexts
export const adminSupabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist this admin session
      autoRefreshToken: false, // Don't refresh tokens
      detectSessionInUrl: false, // Don't detect session in URL
    },
    global: {
      headers: {
        // Special header to identify admin requests in server logs
        'x-admin-access': 'true',
        // Explicitly set auth header to ensure it's using the service role
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    }
  }
);

// Utility function to test admin access directly
export async function verifyAdminAccess() {
  try {
    console.log('Testing admin access with service role key:', SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
    
    // Test if admin client can access the cars table
    const { data, error } = await adminSupabase
      .from('cars')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Admin access verification failed:', error);
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details
        }
      };
    }
    
    console.log('Admin access verified successfully');
    return { 
      success: true, 
      message: 'Admin access verified successfully',
      data
    };
  } catch (err) {
    console.error('Exception in admin access verification:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}
