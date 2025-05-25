
import { Route, Navigate } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

export const MainRoutes = (
  <>
    <Route path="/auth" element={<Auth />} />
    <Route 
      path="/" 
      element={
        <AdminProtectedRoute>
          <Index />
        </AdminProtectedRoute>
      } 
    />
    {/* Fallback route */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </>
);
