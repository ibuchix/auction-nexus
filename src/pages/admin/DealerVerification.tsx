
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const DealerVerification = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dealer Verification</h1>
          <Button>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Review Queue
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Pending Dealer Verifications</h2>
            <p className="text-gray-500 mt-2">The dealer verification interface is coming soon.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealerVerification;
