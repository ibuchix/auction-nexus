
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminDashboard from "@/pages/AdminDashboard";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AuctionManagement from "@/pages/admin/AuctionManagement";
import AuctionScheduling from "@/pages/admin/AuctionScheduling";

/* Protected Route Component */
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route 
          path="/" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/auctions/manage" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AuctionManagement />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/auctions/scheduling" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AuctionScheduling />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
