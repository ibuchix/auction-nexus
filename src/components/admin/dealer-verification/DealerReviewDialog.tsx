
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { DealerData } from "./types";
import DealerDialogHeader from "./components/DealerDialogHeader";
import DealerInformation from "./components/DealerInformation";
import VerificationToggle from "./components/VerificationToggle";
import VerificationStatus from "./components/VerificationStatus";
import AdminNotesInput from "./components/AdminNotesInput";
import RejectionReasonInput from "./components/RejectionReasonInput";
import DialogActions from "./components/DialogActions";

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

  return (
    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
      <DialogContent className="max-w-3xl">
        <DealerDialogHeader />

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <DealerInformation dealer={selectedDealer} />
            <VerificationToggle 
              dealer={selectedDealer} 
              isProcessing={isProcessing} 
              onToggleVerification={onToggleVerification} 
              setIsReviewOpen={setIsReviewOpen}
            />
          </div>

          <div className="space-y-4">
            <VerificationStatus 
              status={selectedDealer.verification_status} 
              createdAt={selectedDealer.created_at} 
            />
            <AdminNotesInput 
              adminNotes={adminNotes} 
              setAdminNotes={setAdminNotes} 
              verificationStatus={selectedDealer.verification_status}
            />
            {selectedDealer.verification_status === 'pending' && (
              <RejectionReasonInput 
                rejectionReason={rejectionReason} 
                setRejectionReason={setRejectionReason} 
              />
            )}
          </div>
        </div>

        <DialogActions 
          verificationStatus={selectedDealer.verification_status}
          isProcessing={isProcessing}
          rejectionReason={rejectionReason}
          onClose={() => setIsReviewOpen(false)}
          onApproveDealer={onApproveDealer}
          onRejectDealer={onRejectDealer}
        />
      </DialogContent>
    </Dialog>
  );
};
