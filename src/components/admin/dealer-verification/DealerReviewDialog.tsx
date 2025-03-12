
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  CreditCard, 
  FileText, 
  User,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { DealerData, VerificationStatus } from "./types";

interface DealerReviewDialogProps {
  selectedDealer: DealerData | null;
  isReviewOpen: boolean;
  setIsReviewOpen: (isOpen: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  isProcessing: boolean;
  onApproveDealer: () => Promise<void>;
  onRejectDealer: () => Promise<void>;
  onToggleVerification: (dealer: DealerData, newStatus: boolean) => Promise<void>;
}

export const DealerReviewDialog = ({
  selectedDealer,
  isReviewOpen,
  setIsReviewOpen,
  rejectionReason,
  setRejectionReason,
  adminNotes,
  setAdminNotes,
  isProcessing,
  onApproveDealer,
  onRejectDealer,
  onToggleVerification,
}: DealerReviewDialogProps) => {
  if (!selectedDealer) return null;

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dealer Verification Review</DialogTitle>
          <DialogDescription>
            Review dealer information and approve or reject the application
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dealership Information</h3>
              <div className="mt-2 bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  {selectedDealer.dealership_name}
                </p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedDealer.address}
                </p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Tax ID: {selectedDealer.tax_id}
                </p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Business Registry: {selectedDealer.business_registry_number}
                </p>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  License Number: {selectedDealer.license_number}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
              <div className="mt-2 bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {selectedDealer.supervisor_name}
                </p>
              </div>
            </div>

            {selectedDealer.verification_status === 'rejected' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                <div className="mt-2 bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-700">Verification was rejected</p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Quick Verification</h3>
              <div className="mt-2 flex items-center gap-3">
                <Switch 
                  checked={selectedDealer.verification_status === 'approved'}
                  onCheckedChange={(checked) => {
                    onToggleVerification(selectedDealer, checked);
                    setIsReviewOpen(false);
                  }}
                  disabled={isProcessing}
                />
                <span>
                  {selectedDealer.verification_status === 'approved' 
                    ? 'Verified' 
                    : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
              <div className="mt-2">
                {getStatusBadge(selectedDealer.verification_status)}
                <p className="text-xs text-gray-500 mt-1">
                  Submitted on {new Date(selectedDealer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Admin Notes</h3>
              <Textarea 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this verification"
                className="mt-2"
                disabled={selectedDealer.verification_status !== 'pending'}
              />
            </div>

            {selectedDealer.verification_status === 'pending' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                <Textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Required if rejecting the application"
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Close
            </Button>
            
            {selectedDealer.verification_status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={onRejectDealer}
                  disabled={isProcessing || !rejectionReason}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button 
                  onClick={onApproveDealer}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
