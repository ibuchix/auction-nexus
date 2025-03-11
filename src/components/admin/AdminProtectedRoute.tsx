
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const AdminProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          return;
        }
        
        // Check if user has admin role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Auth check is still loading
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying admin access...</span>
      </div>
    );
  }

  // Not authenticated or not an admin
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is an admin, render the protected content
  return <Outlet />;
};
