
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
        title: "Unauthorized",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isLoading, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-red-600 font-medium">You don't have permission to access this page.</p>
    </div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
