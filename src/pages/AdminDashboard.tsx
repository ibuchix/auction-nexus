
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { AdminCardGrid } from "@/components/admin/dashboard/AdminCardGrid";
import { AdminActions } from "@/components/admin/dashboard/AdminActions";

const AdminDashboard = () => {
  return (
    <div className="space-y-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center">
        <DashboardHeader title="System Management" />
        <AdminActions />
      </div>

      <AdminCardGrid />
    </div>
  );
};

export default AdminDashboard;
