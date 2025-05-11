
import { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { DashboardLayout } from "@/components/DashboardLayout";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAdmin, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Admin Access Error",
        description: "Service role key not working. Check .env configuration or Supabase permissions.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isLoading, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p>Verifying admin access...</p>
      </div>
    </div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-screen">
      <div className="space-y-4 text-center max-w-lg">
        <p className="text-red-600 font-medium text-lg">Admin Service Access Error</p>
        <p className="text-gray-600">Unable to access the database with admin privileges. Check that:</p>
        <ul className="list-disc list-inside text-left mx-auto text-gray-600 space-y-2">
          <li>The VITE_SUPABASE_SERVICE_ROLE_KEY is correctly set in .env</li>
          <li>The service role key has proper permissions in Supabase</li>
          <li>The database connection is working</li>
        </ul>
      </div>
    </div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
