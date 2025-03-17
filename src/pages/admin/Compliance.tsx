
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

const Compliance = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <Button>
          <FileCheck className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="text-gray-500">Compliance reporting system is under development.</p>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;
