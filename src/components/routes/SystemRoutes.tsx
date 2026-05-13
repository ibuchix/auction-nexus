
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import Analytics from "@/pages/admin/Analytics";
import AuditLogs from "@/pages/admin/AuditLogs";
import SystemSettings from "@/pages/admin/SystemSettings";
import Metrics from "@/pages/admin/Metrics";
import CleanupStatus from "@/pages/admin/CleanupStatus";

export const SystemRoutes = (
  <>
    <Route 
      path="/admin/system" 
      element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/analytics" 
      element={
        <AdminProtectedRoute>
          <Analytics />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/audit-logs"
      element={
        <AdminProtectedRoute>
          <AuditLogs />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/settings" 
      element={
        <AdminProtectedRoute>
          <SystemSettings />
        </AdminProtectedRoute>
      } 
    />
    <Route 
      path="/admin/metrics"
      element={
        <AdminProtectedRoute>
          <Metrics />
        </AdminProtectedRoute>
      } 
    />
  </>
);
