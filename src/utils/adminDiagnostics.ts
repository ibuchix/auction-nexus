
import { adminSupabase } from '@/integrations/supabase/adminClient';

export async function diagnoseAdminAccess() {
  try {
    // Check if the service role key is set
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return {
        success: false,
        error: 'SERVICE_ROLE_KEY_MISSING',
        message: 'VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables'
      };
    }

    // Mask the key for security in logs (show only first 8 and last 4 chars)
    const keyLength = serviceRoleKey.length;
    const maskedKey = keyLength > 12 
      ? `${serviceRoleKey.substring(0, 8)}...${serviceRoleKey.substring(keyLength - 4)}`
      : '[INVALID_KEY_FORMAT]';

    console.log(`Service role key present (${maskedKey})`);

    // Check if service role key has the correct format (JWT format)
    if (!serviceRoleKey.includes('.') || serviceRoleKey.split('.').length !== 3) {
      return {
        success: false,
        error: 'INVALID_KEY_FORMAT',
        message: 'Service role key does not appear to have a valid JWT format'
      };
    }

    // Attempt to make a simple query with explicit headers
    const { data, error } = await adminSupabase
      .from('cars')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: 'DATABASE_ACCESS_ERROR',
        message: `Database access error: ${error.message}`,
        details: error
      };
    }

    // All checks passed
    return {
      success: true,
      message: 'Admin access is configured correctly',
      data
    };
  } catch (err) {
    return {
      success: false,
      error: 'UNEXPECTED_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      details: err
    };
  }
}

// Helper function you can call from the browser console for debugging
(window as any).checkAdminAccess = async function() {
  console.log('Checking admin access...');
  const result = await diagnoseAdminAccess();
  console.log('Admin access check result:', result);
  return result;
};
