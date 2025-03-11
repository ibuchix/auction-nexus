
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, XCircle, FileCheck, Eye, Car } from "lucide-react";
import { format } from "date-fns";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Define a type for verification status
type VerificationStatus = "pending" | "approved" | "rejected";

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  created_at: string;
  status: string;
  seller_id: string;
  title: string;
  images?: string[];
}

interface ListingVerificationData {
  id: string;
  car_id: string;
  verification_status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  rejection_reason: string | null;
  admin_id: string | null;
  car: CarListing;
}

const ListingVerification = () => {
  const [selectedListing, setSelectedListing] = useState<ListingVerificationData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: verifications = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["listing-verifications", activeTab],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('listing_verifications')
          .select(`
            *,
            car:car_id (
              id,
              make,
              model,
              year,
              price,
              created_at,
              status,
              seller_id,
              title,
              images
            )
          `)
          .eq('verification_status', activeTab);

        if (error) throw error;
        
        return data as ListingVerificationData[];
      } catch (error) {
        console.error('Error fetching listing verifications:', error);
        toast.error('Failed to load listing verifications');
        return [];
      }
    }
  });

  const openReviewDialog = (listing: ListingVerificationData) => {
    setSelectedListing(listing);
    setAdminNotes(listing.notes || "");
    setRejectionReason(listing.rejection_reason || "");
    setIsReviewOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedListing) return;
    
    setIsProcessing(true);
    try {
      const adminId = await getUserId();
      
      const { error } = await supabase.rpc(
        'approve_listing',
        {
          p_listing_id: selectedListing.car_id,
          p_admin_id: adminId,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success("Listing approved successfully");
      setIsReviewOpen(false);
      refetch();
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Failed to approve listing');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedListing || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    try {
      const adminId = await getUserId();
      
      const { error } = await supabase.rpc(
        'reject_listing',
        {
          p_listing_id: selectedListing.car_id,
          p_admin_id: adminId,
          p_rejection_reason: rejectionReason,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success("Listing rejected");
      setIsReviewOpen(false);
      refetch();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing');
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserId = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw new Error("User not authenticated");
    }
    return data.user.id;
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

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

        <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as VerificationStatus)}>
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
                  {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading listings...</div>
                  ) : verifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No {status} listings found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">
                              {verification.car.year} {verification.car.make} {verification.car.model}
                            </TableCell>
                            <TableCell>${verification.car.price.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(verification.submitted_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openReviewDialog(verification)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {selectedListing && (
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Listing: {selectedListing.car.year} {selectedListing.car.make} {selectedListing.car.model}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Listing Details</h3>
                  <div className="border rounded-md p-4 space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedListing.car.title}</p>
                    <p><span className="font-medium">Vehicle:</span> {selectedListing.car.year} {selectedListing.car.make} {selectedListing.car.model}</p>
                    <p><span className="font-medium">Price:</span> ${selectedListing.car.price.toLocaleString()}</p>
                    <p><span className="font-medium">Listed on:</span> {format(new Date(selectedListing.car.created_at), "MMM d, yyyy")}</p>
                    <p><span className="font-medium">Status:</span> {selectedListing.car.status}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Verification Status</h3>
                  <div className="border rounded-md p-4 space-y-2">
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedListing.verification_status)}</p>
                    <p><span className="font-medium">Submitted:</span> {format(new Date(selectedListing.submitted_at), "MMM d, yyyy")}</p>
                    {selectedListing.reviewed_at && (
                      <p><span className="font-medium">Reviewed:</span> {format(new Date(selectedListing.reviewed_at), "MMM d, yyyy")}</p>
                    )}
                    {selectedListing.rejection_reason && (
                      <p><span className="font-medium">Rejection Reason:</span> {selectedListing.rejection_reason}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedListing.car.images && selectedListing.car.images.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedListing.car.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img src={image} alt={`Vehicle ${index + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">No images available</div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</h3>
                <Textarea 
                  placeholder="Add any notes about this listing" 
                  className="min-h-20" 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={selectedListing.verification_status !== "pending"}
                />
              </div>
              
              {selectedListing.verification_status === "pending" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason</h3>
                  <Textarea 
                    placeholder="Provide reason if rejecting this listing" 
                    className="min-h-20" 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              {selectedListing.verification_status === "pending" ? (
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsReviewOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewOpen(false)}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default ListingVerification;
