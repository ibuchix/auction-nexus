
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import AuctionManagement from "@/pages/admin/AuctionManagement";
import AuctionScheduling from "@/pages/admin/AuctionScheduling";
import AuctionMonitoring from "@/pages/admin/AuctionMonitoring";
import ProxyBidMonitoring from "@/pages/admin/ProxyBidMonitoring";

export function AuctionRoutes() {
  return (
    <>
      <Route 
        path="/admin/auctions/monitor" 
        element={
          <AdminProtectedRoute>
            <AuctionMonitoring />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/auctions/manage" 
        element={
          <AdminProtectedRoute>
            <AuctionManagement />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/auctions/scheduling" 
        element={
          <AdminProtectedRoute>
            <AuctionScheduling />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/proxy-bids" 
        element={
          <AdminProtectedRoute>
            <ProxyBidMonitoring />
          </AdminProtectedRoute>
        } 
      />
    </>
  );
}
