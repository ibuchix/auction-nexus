
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to check admin status with retry logic
  const checkAdminWithRetry = async (session: Session | null, retryCount = 0): Promise<{ isAdmin: boolean; error: string | null }> => {
    const maxRetries = 2;
    const retryDelay = 500;

    // Verify session has valid access token
    if (!session?.access_token) {
      console.error('No valid session or access token available');
      return { isAdmin: false, error: 'No valid session token' };
    }

    console.log('Admin check attempt', retryCount + 1, {
      hasSession: !!session,
      hasToken: !!session.access_token,
      userId: session.user?.id,
    });

    try {
      const { data, error } = await supabase.rpc('check_is_admin');
      
      if (error) {
        console.error(`Error checking admin status (attempt ${retryCount + 1}):`, {
          error,
          errorMessage: error.message,
          sessionValid: !!session?.access_token,
        });
        
        // Retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying admin check in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return checkAdminWithRetry(session, retryCount + 1);
        }
        
        return { isAdmin: false, error: error.message || 'Failed to verify admin status' };
      }
      
      console.log('Admin check successful:', data);
      return { isAdmin: Boolean(data), error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Exception during admin check:', {
        error,
        errorMessage,
        sessionValid: !!session?.access_token,
      });
      return { isAdmin: false, error: errorMessage };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Add delay to ensure session is fully established and JWT propagated
          setTimeout(async () => {
            const result = await checkAdminWithRetry(session);
            setIsAdmin(result.isAdmin);
            setAdminCheckError(result.error);
            setIsLoading(false);
          }, 500);
        } else {
          setIsAdmin(false);
          setAdminCheckError(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Add delay to ensure session is fully established and JWT propagated
        await new Promise(resolve => setTimeout(resolve, 500));
        const result = await checkAdminWithRetry(session);
        setIsAdmin(result.isAdmin);
        setAdminCheckError(result.error);
        setIsLoading(false);
      } else {
        setIsAdmin(false);
        setAdminCheckError(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Force token refresh to get latest JWT claims
      if (data.session) {
        console.log('Forcing session refresh to get latest JWT claims...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.warn('Session refresh after login failed:', refreshError);
        } else {
          console.log('Session refreshed successfully with latest JWT claims');
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  // Removed signUp function - admin only system

  const clearAllAuthData = () => {
    // Clear all possible Supabase auth storage keys
    const keysToRemove = [
      'supabase.auth.token',
      'sb-sdvakfhmoaoucmhbhwvy-auth-token',
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear all keys that start with 'sb-'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const signOut = async () => {
    try {
      // If no session exists, just clear state and return success
      if (!session) {
        clearAllAuthData();
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        window.location.href = '/auth';
        return;
      }

      // Sign out globally to invalidate all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // Always clear local storage regardless of error
      clearAllAuthData();
      
      // Ignore "session missing" errors - this means we're already logged out
      if (error && error.message.includes('session')) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        window.location.href = '/auth';
        return;
      }
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state and storage even on error
      clearAllAuthData();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Only show error for non-session-related issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('session')) {
        toast({
          title: "Error",
          description: "Failed to sign out.",
          variant: "destructive",
        });
      } else {
        // Session already gone, treat as success
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
      // Always navigate to login even on error
      window.location.href = '/auth';
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      console.log('Manually refreshing session to get latest JWT claims...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        toast({
          title: "Refresh Failed",
          description: error.message || "Failed to refresh session",
          variant: "destructive",
        });
        return { success: false, error };
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Re-check admin status with new token
        const result = await checkAdminWithRetry(data.session, 0);
        setIsAdmin(result.isAdmin);
        setAdminCheckError(result.error);
        
        toast({
          title: "Session Refreshed",
          description: "Your session has been updated with the latest permissions.",
        });
        
        return { success: true, error: null };
      }
      
      return { success: false, error: new Error('No session returned') };
    } catch (error) {
      console.error('Exception during session refresh:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Refresh Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const retryAdminCheck = async () => {
    if (!session) return;
    
    setIsLoading(true);
    const result = await checkAdminWithRetry(session, 0);
    setIsAdmin(result.isAdmin);
    setAdminCheckError(result.error);
    setIsLoading(false);
    
    if (result.isAdmin) {
      toast({
        title: "Success",
        description: "Admin access verified successfully.",
      });
    } else if (result.error) {
      toast({
        title: "Verification Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    isLoading,
    isAdmin,
    adminCheckError,
    signIn,
    signOut,
    retryAdminCheck,
    refreshSession,
  };
}
