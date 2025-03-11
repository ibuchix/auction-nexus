
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { AdminCardGrid } from "@/components/admin/dashboard/AdminCardGrid";
import { AdminActions } from "@/components/admin/dashboard/AdminActions";

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <DashboardHeader title="System Management" />
          <AdminActions />
        </div>

        <AdminCardGrid />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
