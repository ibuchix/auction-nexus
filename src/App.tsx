import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"

/* Import Layouts */
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

/* Import Pages */
import Account from "./pages/Account";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/admin";
import AuctionMonitor from "./pages/admin/AuctionMonitor";
import AuctionManagement from "./pages/admin/AuctionManagement";
import ProxyBids from "./pages/admin/ProxyBids";
import Users from "./pages/admin/Users";
import Sellers from "./pages/admin/Sellers";
import DealerVerification from "./pages/admin/DealerVerification";
import ListingVerification from "./pages/admin/ListingVerification";
import Purchases from "./pages/admin/Purchases";
import Disputes from "./pages/admin/Disputes";
import FraudDetection from "./pages/admin/FraudDetection";
import Compliance from "./pages/admin/Compliance";
import Analytics from "./pages/admin/Analytics";
import Announcements from "./pages/admin/Announcements";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import ManualValuation from "./pages/ManualValuation";
import AuctionScheduling from "./pages/admin/AuctionScheduling";

/* Import Components */
import { SiteHeader } from "./components/SiteHeader";

/* Router Definitions */
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/manual-valuation" element={<ProtectedRoute><ManualValuation /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
      <Route path="/admin/auctions/monitor" element={<AdminProtectedRoute><AuctionMonitor /></AdminProtectedRoute>} />
      <Route path="/admin/auctions/manage" element={<AdminProtectedRoute><AuctionManagement /></AdminProtectedRoute>} />
      <Route path="/admin/auctions/scheduling" element={<AdminProtectedRoute><AuctionScheduling /></AdminProtectedRoute>} />
      <Route path="/admin/proxy-bids" element={<AdminProtectedRoute><ProxyBids /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
      <Route path="/admin/sellers" element={<AdminProtectedRoute><Sellers /></AdminProtectedRoute>} />
      <Route path="/admin/dealers/verification" element={<AdminProtectedRoute><DealerVerification /></AdminProtectedRoute>} />
      <Route path="/admin/listings/verification" element={<AdminProtectedRoute><ListingVerification /></AdminProtectedRoute>} />
      <Route path="/admin/purchases" element={<AdminProtectedRoute><Purchases /></AdminProtectedRoute>} />
      <Route path="/admin/disputes" element={<AdminProtectedRoute><Disputes /></AdminProtectedRoute>} />
      <Route path="/admin/fraud" element={<AdminProtectedRoute><FraudDetection /></AdminProtectedRoute>} />
      <Route path="/admin/compliance" element={<AdminProtectedRoute><Compliance /></AdminProtectedRoute>} />
      <Route path="/admin/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />
      <Route path="/admin/announcements" element={<AdminProtectedRoute><Announcements /></AdminProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<AdminProtectedRoute><AuditLogs /></AdminProtectedRoute>} />
      <Route path="/admin/settings" element={<AdminProtectedRoute><Settings /></AdminProtectedRoute>} />
    </>
  )
);

/* Authentication Wrapper */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useUser();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/* Admin Authentication Wrapper */
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (session && user && user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [session, user, toast]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user role is not "admin"
  if (user?.role !== 'admin') {
    // Redirect to a different route or show an error message
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <SiteHeader />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
