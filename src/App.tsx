import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AuctionMonitoring from "./pages/admin/AuctionMonitoring";
import AuctionManagement from "./pages/admin/AuctionManagement";
import DisputeResolution from "./pages/admin/DisputeResolution";
import Analytics from "./pages/admin/Analytics";
import Announcements from "./pages/admin/Announcements";
import FraudDetection from "./pages/admin/FraudDetection";
import Compliance from "./pages/admin/Compliance";
import AuditLogs from "./pages/admin/AuditLogs";
import SellerManagement from "./pages/admin/SellerManagement";
import Purchases from "./pages/admin/Purchases";
import DealerVerification from "./pages/admin/DealerVerification";
import ListingVerification from "./pages/admin/ListingVerification";
import SystemSettings from "./pages/admin/SystemSettings";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sellers" element={<SellerManagement />} />
            <Route path="/admin/dealers/verification" element={<DealerVerification />} />
            <Route path="/admin/listings/verification" element={<ListingVerification />} />
            <Route path="/admin/auctions/manage" element={<AuctionManagement />} />
            <Route path="/admin/disputes" element={<DisputeResolution />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/fraud" element={<FraudDetection />} />
            <Route path="/admin/compliance" element={<Compliance />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/purchases" element={<Purchases />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
