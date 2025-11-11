
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('[useAdminAuth] Starting admin check:', { 
        hasUser: !!user, 
        authIsAdmin, 
        authLoading,
        currentIsAdmin: isAdmin,
        currentIsLoading: isLoading
      });
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Wait for auth to complete
        if (authLoading) {
          console.log('[useAdminAuth] Auth still loading, waiting...');
          return;
        }

        // If not authenticated or not admin according to auth hook, fail fast
        if (!user || !authIsAdmin) {
          console.log('[useAdminAuth] User not authenticated or not admin from useAuth:', { 
            user: !!user, 
            authIsAdmin 
          });
          setIsAdmin(false);
          setUserId(null);
          return;
        }

        console.log('[useAdminAuth] Verifying admin access using secure RPC for user:', user.id);
        
        // Use secure server-side RPC to verify admin status
        const { data: isAdminCheck, error: rpcError } = await supabase.rpc('check_is_admin');
        
        console.log('[useAdminAuth] RPC check_is_admin result:', { isAdminCheck, rpcError });
        
        if (rpcError) {
          console.error('[useAdminAuth] Admin RPC check failed:', rpcError);
          throw new Error(`Admin verification failed: ${rpcError.message}`);
        }
        
        if (!isAdminCheck) {
          console.log('[useAdminAuth] RPC confirmed user is not an admin');
          setIsAdmin(false);
          setUserId(null);
          return;
        }
        
        console.log('[useAdminAuth] ✅ Admin access verified successfully via RPC');
        
        setUserId(user.id);
        setIsAdmin(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useAdminAuth] Error during admin access check:', err);
        
        setError(err);
        toast({
          title: "Admin Access Error",
          description: `Error verifying admin privileges: ${errorMessage}`,
          variant: "destructive",
        });
        setIsAdmin(false);
        setUserId(null);
      } finally {
        console.log('[useAdminAuth] Admin check complete, setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [user, authIsAdmin, authLoading, toast]);
  
  return { isAdmin, isLoading, userId, error };
}
