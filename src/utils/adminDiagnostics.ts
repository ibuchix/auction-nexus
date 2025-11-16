
import { supabase } from '@/integrations/supabase/client';

export async function diagnoseAdminAccess() {
  try {
    // Attempt to make a simple query to verify database connectivity
    const { data, error } = await supabase
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
      message: 'Database access is configured correctly',
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
