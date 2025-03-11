
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

const ListingVerification = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Listing Verification</h1>
          <Button>
            <FileCheck className="mr-2 h-4 w-4" />
            Review Listings
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Pending Listing Verifications</h2>
            <p className="text-gray-500 mt-2">The listing verification interface is coming soon.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ListingVerification;
