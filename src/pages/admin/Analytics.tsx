import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-gray-500">Analytics dashboard is under development.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;