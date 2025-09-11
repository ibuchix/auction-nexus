
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import DealerVerification from "@/pages/admin/DealerVerification";
import DealerManagement from "@/pages/admin/DealerManagement";
import UserManagement from "@/pages/admin/UserManagement";
import SellerManagement from "@/pages/admin/SellerManagement";
import ManualValuation from "@/pages/admin/ManualValuation";

export const UserManagementRoutes = (
  <>
    <Route 
      path="/admin/dealers/verification" 
      element={
        <AdminProtectedRoute>
          <DealerVerification />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/dealers" 
      element={
        <AdminProtectedRoute>
          <DealerManagement />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/users" 
      element={
        <AdminProtectedRoute>
          <UserManagement />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/sellers" 
      element={
        <AdminProtectedRoute>
          <SellerManagement />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/manual-valuation" 
      element={
        <AdminProtectedRoute>
          <ManualValuation />
        </AdminProtectedRoute>
      } 
    />
  </>
);
