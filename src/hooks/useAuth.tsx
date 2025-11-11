
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
      if (session?.user) {
        // Secure admin check using server-side RPC
        supabase.rpc('check_is_admin').then(({ data, error }) => {
          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(Boolean(data));
            console.log('Admin status:', data);
          }
        });
      } else {
        setIsAdmin(false);
      }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Secure admin check using server-side RPC
        supabase.rpc('check_is_admin').then(({ data, error }) => {
          if (error) {
            console.error('Error checking initial admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(Boolean(data));
            console.log('Initial admin status:', data);
          }
        });
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
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

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  // Removed signUp function - admin only system

  const signOut = async () => {
    try {
      // If no session exists, just clear state and return success
      if (!session) {
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

      const { error } = await supabase.auth.signOut();
      
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
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even on error
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

  return {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signOut,
  };
}
