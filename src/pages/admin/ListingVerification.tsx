
import { AlertTriangle, CheckCircle, XCircle, FileCheck, Car } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListingVerification } from "@/hooks/useListingVerification";
import { VerificationTable } from "@/components/admin/listing-verification/VerificationTable";
import { ReviewDialog } from "@/components/admin/listing-verification/ReviewDialog";

const ListingVerification = () => {
  const {
    verifications,
    isLoading,
    refetch,
    selectedListing,
    isReviewOpen,
    setIsReviewOpen,
    rejectionReason,
    setRejectionReason,
    adminNotes,
    setAdminNotes,
    activeTab,
    setActiveTab,
    isProcessing,
    openReviewDialog,
    handleApprove,
    handleReject
  } = useListingVerification();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Listing Verification</h1>
          <Button onClick={() => refetch()}>
            <FileCheck className="mr-2 h-4 w-4" />
            Refresh Listings
          </Button>
        </div>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          {["pending", "approved", "rejected"].map((status) => (
            <TabsContent value={status} key={status}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    {status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Rejected"} Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VerificationTable
                    verifications={verifications}
                    isLoading={isLoading}
                    status={status as any}
                    onReview={openReviewDialog}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <ReviewDialog
        selectedListing={selectedListing}
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        isProcessing={isProcessing}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
};

export default ListingVerification;
