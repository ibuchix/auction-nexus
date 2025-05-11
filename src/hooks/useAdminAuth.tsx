
import { useState, useEffect } from 'react';
import { verifyAdminAccess } from '@/utils/edgeFunctionAdminOperations';
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if admin access works using the service role key
    const checkAdminAccess = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Testing admin access via Edge Function...');
        
        // First verify that the service_role key is properly set
        if (!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
        }
        
        // Check if the key looks valid (basic format validation)
        if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.length < 30) {
          throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY appears to be invalid or incomplete');
        }

        console.log('Service role key is present and valid format');
        
        // Use Edge Function to verify access
        const verificationResult = await verifyAdminAccess();
        
        if (!verificationResult || (verificationResult as any).success === false) {
          console.error('Admin access verification failed:', verificationResult);
          throw new Error(`Admin verification failed: ${(verificationResult as any)?.error || 'Unknown error'}`);
        }
        
        console.log('Admin access via Edge Function verified successfully:', verificationResult);
        
        // Use a system admin ID since we're not requiring authentication
        setUserId("admin-system");
        setIsAdmin(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error testing admin access:', err);
        
        setError(err);
        toast({
          title: "Admin Access Error",
          description: `Error connecting with admin privileges: ${errorMessage}`,
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [toast]);
  
  return { isAdmin, isLoading, userId, error };
}
