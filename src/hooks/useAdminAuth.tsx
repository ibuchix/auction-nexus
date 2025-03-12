import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adminSupabase } from '@/integrations/supabase/adminClient';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Assume admin by default
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>("00000000-0000-0000-0000-000000000000"); // Default UUID format
  
  useEffect(() => {
    // Since this is an admin app, we'll check if we can access admin data
    const checkAdminClient = async () => {
      setIsLoading(true);
      try {
        // Test if admin client is working with profiles table access
        const { data, error } = await adminSupabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Admin client error:', error);
          // Check if it's a permission error specifically
          if (error.code === '42501') {
            console.warn('Permission denied for profiles table. This likely means RLS is blocking access.');
          }
          setIsAdmin(false);
        } else {
          console.log('Admin client working successfully');
          // If we have profile data, use the first profile ID as admin ID
          // Otherwise, keep using the default UUID
          if (data && data.length > 0 && data[0].id) {
            setUserId(data[0].id);
          }
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error testing admin client:', err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminClient();
  }, []);
  
  return { isAdmin, isLoading, userId };
}
