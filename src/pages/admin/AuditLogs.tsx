import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

const AuditLogs = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <Button>
            <History className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-gray-500">Audit logging system is under development.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;