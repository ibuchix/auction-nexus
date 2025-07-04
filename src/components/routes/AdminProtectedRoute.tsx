
import { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center max-w-lg">
          <p className="text-red-600 font-medium text-lg">Access Denied</p>
          <p className="text-gray-600">
            You don't have admin privileges. Please contact an administrator if you believe this is an error.
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
