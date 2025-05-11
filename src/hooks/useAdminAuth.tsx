
import { useState, useEffect } from 'react';
import { adminSupabase, verifyAdminAccess } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if admin client works by trying a simple database operation
    const checkAdminClient = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Testing admin client access...');
        
        // First verify that the service_role key is properly set
        if (!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
        }
        
        // Check if the key looks valid (basic format validation)
        if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.length < 30) {
          throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY appears to be invalid or incomplete');
        }

        console.log('Service role key is present and valid format');
        
        // Use the verification utility to test admin access
        const verificationResult = await verifyAdminAccess();
        
        if (!verificationResult.success) {
          console.error('Admin access verification failed:', verificationResult);
          throw new Error(`Admin verification failed: ${verificationResult.error}`);
        }
        
        console.log('Admin access verified successfully:', verificationResult);
        
        // Additional test against the cars table to ensure full access
        const { data, error } = await adminSupabase
          .from('cars')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Admin client error when querying cars table:', error);
          setError({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          
          toast({
            title: "Admin Access Error",
            description: `Failed to access data with admin privileges: ${error.message}`,
            variant: "destructive",
          });
          setIsAdmin(false);
        } else {
          console.log('Admin client working successfully, cars table accessible');
          // Use a placeholder user ID for admin operations
          setUserId("admin-user");
          setIsAdmin(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error testing admin client:', err);
        
        setError(err);
        toast({
          title: "Admin Client Error",
          description: `Error connecting to database with admin privileges: ${errorMessage}`,
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminClient();
  }, [toast]);
  
  return { isAdmin, isLoading, userId, error };
}
