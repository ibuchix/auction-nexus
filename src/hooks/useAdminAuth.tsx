
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adminSupabase } from '@/integrations/supabase/adminClient';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Assume admin by default
  const [isLoading, setIsLoading] = useState(false); // Set loading to false since we're bypassing checks
  const [userId, setUserId] = useState<string | null>("admin-user"); // Default admin user ID
  
  useEffect(() => {
    // Since this is an admin app, we'll just check if we can access admin data
    const checkAdminClient = async () => {
      try {
        // Test if admin client is working - using a simpler query that doesn't use SQL functions
        const { data, error } = await adminSupabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Admin client error:', error);
          setIsAdmin(false);
        } else {
          console.log('Admin client working successfully');
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error testing admin client:', err);
        setIsAdmin(false);
      }
    };
    
    checkAdminClient();
  }, []);
  
  return { isAdmin, isLoading, userId };
}
