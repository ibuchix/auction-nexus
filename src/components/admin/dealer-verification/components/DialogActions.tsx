
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { VerificationStatus } from "../types";

interface DialogActionsProps {
  verificationStatus: VerificationStatus;
  isProcessing: boolean;
  rejectionReason: string;
  onClose: () => void;
  onApproveDealer: () => Promise<void>;
  onRejectDealer: () => Promise<void>;
}

const DialogActions = ({ 
  verificationStatus,
  isProcessing,
  rejectionReason,
  onClose,
  onApproveDealer,
  onRejectDealer
}: DialogActionsProps) => {
  return (
    <DialogFooter>
      <div className="flex gap-2 justify-end w-full">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        {verificationStatus === 'pending' && (
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
  );
};

export default DialogActions;
