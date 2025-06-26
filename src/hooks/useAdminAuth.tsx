
import { useState, useEffect } from 'react';
import { verifyAdminAccess } from '@/utils/edgeFunctionAdminOperations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAdmin: authIsAdmin, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Wait for auth to complete
        if (authLoading) {
          return;
        }

        // If not authenticated or not admin according to auth hook, fail fast
        if (!user || !authIsAdmin) {
          console.log('User not authenticated or not admin:', { user: !!user, authIsAdmin });
          setIsAdmin(false);
          setUserId(null);
          return;
        }

        console.log('Testing admin access via Edge Function for user:', user.id);
        
        // Use Edge Function to verify access with proper JWT
        const verificationResult = await verifyAdminAccess();
        
        if (!verificationResult || verificationResult.success === false) {
          console.error('Admin access verification failed:', verificationResult);
          throw new Error(`Admin verification failed: ${verificationResult?.error || 'Unknown error'}`);
        }
        
        console.log('Admin access via Edge Function verified successfully:', verificationResult);
        
        setUserId(user.id);
        setIsAdmin(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error testing admin access:', err);
        
        setError(err);
        toast({
          title: "Admin Access Error",
          description: `Error verifying admin privileges: ${errorMessage}`,
          variant: "destructive",
        });
        setIsAdmin(false);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [user, authIsAdmin, authLoading, toast]);
  
  return { isAdmin, isLoading, userId, error };
}
