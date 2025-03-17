
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import DisputeResolution from "@/pages/admin/DisputeResolution";
import FraudDetection from "@/pages/admin/FraudDetection";
import Compliance from "@/pages/admin/Compliance";

export const RiskManagementRoutes = (
  <>
    <Route 
      path="/admin/disputes" 
      element={
        <AdminProtectedRoute>
          <DisputeResolution />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/fraud" 
      element={
        <AdminProtectedRoute>
          <FraudDetection />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/compliance" 
      element={
        <AdminProtectedRoute>
          <Compliance />
        </AdminProtectedRoute>
      } 
    />
  </>
);
