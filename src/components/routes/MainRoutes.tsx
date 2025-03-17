
import { Route, Navigate } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import Index from "@/pages/Index";

export const MainRoutes = (
  <>
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
