
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const FraudDetection = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fraud Detection</h1>
        <Button>
          <AlertTriangle className="mr-2 h-4 w-4" />
          View Alerts
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="text-gray-500">Fraud detection system is under development.</p>
        </Card>
      </div>
    </div>
  );
};

export default FraudDetection;
