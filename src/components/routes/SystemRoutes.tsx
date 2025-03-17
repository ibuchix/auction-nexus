
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "./AdminProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import Analytics from "@/pages/admin/Analytics";
import Announcements from "@/pages/admin/Announcements";
import AuditLogs from "@/pages/admin/AuditLogs";
import SystemSettings from "@/pages/admin/SystemSettings";

export function SystemRoutes() {
  return (
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
        path="/admin/announcements" 
        element={
          <AdminProtectedRoute>
            <Announcements />
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
    </>
  );
}
