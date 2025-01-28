import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

const AuctionManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Management</h1>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-gray-500">Auction management system is under development.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionManagement;