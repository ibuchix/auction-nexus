
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListingVerificationData, VerificationStatus } from "@/hooks/useListingVerification";

interface ReviewDialogProps {
  selectedListing: ListingVerificationData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ReviewDialog({
  selectedListing,
  isOpen,
  onOpenChange,
  rejectionReason,
  onRejectionReasonChange,
  adminNotes,
  onAdminNotesChange,
  isProcessing,
  onApprove,
  onReject
}: ReviewDialogProps) {
  if (!selectedListing) return null;

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Review Listing: {selectedListing.car.year} {selectedListing.car.make} {selectedListing.car.model}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Listing Details</h3>
              <div className="border rounded-md p-4 space-y-2">
                <p><span className="font-medium">Title:</span> {selectedListing.car.title}</p>
                <p><span className="font-medium">Vehicle:</span> {selectedListing.car.year} {selectedListing.car.make} {selectedListing.car.model}</p>
                <p><span className="font-medium">Reserve Price:</span> PLN {selectedListing.car.reserve_price.toLocaleString()}</p>
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
              onChange={(e) => onAdminNotesChange(e.target.value)}
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
                onChange={(e) => onRejectionReasonChange(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          {selectedListing.verification_status === "pending" ? (
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={onReject}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                variant="default" 
                onClick={onApprove}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
