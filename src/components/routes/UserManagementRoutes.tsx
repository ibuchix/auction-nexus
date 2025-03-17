
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import DealerVerification from "@/pages/admin/DealerVerification";
import DealerManagement from "@/pages/admin/DealerManagement";
import UserManagement from "@/pages/admin/UserManagement";
import SellerManagement from "@/pages/admin/SellerManagement";
import ListingVerification from "@/pages/admin/ListingVerification";
import Purchases from "@/pages/admin/Purchases";

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
      path="/admin/listings/verification" 
      element={
        <AdminProtectedRoute>
          <ListingVerification />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/purchases" 
      element={
        <AdminProtectedRoute>
          <Purchases />
        </AdminProtectedRoute>
      } 
    />
  </>
);
