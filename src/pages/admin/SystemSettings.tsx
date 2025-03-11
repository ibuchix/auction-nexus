
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const SystemSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Settings</h1>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">System Configuration</h2>
            <p className="text-gray-500 mt-2">The system settings interface is coming soon.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
