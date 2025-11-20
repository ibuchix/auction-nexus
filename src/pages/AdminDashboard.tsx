
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { AdminCardGrid } from "@/components/admin/dashboard/AdminCardGrid";
import { AdminActions } from "@/components/admin/dashboard/AdminActions";
import { AuctionSystemStatus } from "@/components/admin/dashboard/AuctionSystemStatus";
import { ActiveAuctionsMonitor } from "@/components/admin/dashboard/ActiveAuctionsMonitor";
import { AuctionOperationsLogView } from "@/components/admin/audit-logs/AuctionOperationsLogView";

const AdminDashboard = () => {
  return (
    <div className="space-y-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-gray-100 p-4 rounded-lg shadow-sm">
        <DashboardHeader title="System Management" />
        <AdminActions />
      </div>

      <AuctionSystemStatus />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveAuctionsMonitor />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <AdminCardGrid />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <AuctionOperationsLogView />
      </div>
    </div>
  );
};

export default AdminDashboard;
