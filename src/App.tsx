import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminDashboard from "@/pages/AdminDashboard";
import Index from "@/pages/Index";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AuctionManagement from "@/pages/admin/AuctionManagement";
import AuctionScheduling from "@/pages/admin/AuctionScheduling";
import DealerVerification from "@/pages/admin/DealerVerification";
import DealerManagement from "@/pages/admin/DealerManagement";
import FraudDetection from "@/pages/admin/FraudDetection";
import DisputeResolution from "@/pages/admin/DisputeResolution";
import Analytics from "@/pages/admin/Analytics";
import Announcements from "@/pages/admin/Announcements";
import AuctionMonitoring from "@/pages/admin/AuctionMonitoring";
import ProxyBidMonitoring from "@/pages/admin/ProxyBidMonitoring";
import SellerManagement from "@/pages/admin/SellerManagement";
import Compliance from "@/pages/admin/Compliance";
import UserManagement from "@/pages/admin/UserManagement";
import ListingVerification from "@/pages/admin/ListingVerification";
import Purchases from "@/pages/admin/Purchases";
import AuditLogs from "@/pages/admin/AuditLogs";
import SystemSettings from "@/pages/admin/SystemSettings";

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
        {/* Admin routes - removed duplicate /admin route, keeping just the root path */}
        <Route 
          path="/" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Index />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/system" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* Auction related routes */}
        <Route 
          path="/admin/auctions/monitor" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AuctionMonitoring />
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
        <Route 
          path="/admin/proxy-bids" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <ProxyBidMonitoring />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* User and dealer management routes */}
        <Route 
          path="/admin/dealers/verification" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <DealerVerification />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dealers" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <DealerManagement />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sellers" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <SellerManagement />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* Listing management routes */}
        <Route 
          path="/admin/listings/verification" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <ListingVerification />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/purchases" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Purchases />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* Risk management routes */}
        <Route 
          path="/admin/disputes" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <DisputeResolution />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/fraud" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <FraudDetection />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/compliance" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Compliance />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* Other admin routes */}
        <Route 
          path="/admin/analytics" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/announcements" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/audit-logs" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <AuditLogs />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <AdminProtectedRoute>
              <DashboardLayout>
                <SystemSettings />
              </DashboardLayout>
            </AdminProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
