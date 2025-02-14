
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Purchase } from "../../../types/purchases";

interface RefundDialogProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
  refundReason: string;
  setRefundReason: (reason: string) => void;
  onRefund: () => void;
}

export const RefundDialog = ({
  purchase,
  isOpen,
  onClose,
  refundReason,
  setRefundReason,
  onRefund,
}: RefundDialogProps) => {
  if (!purchase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Refund</DialogTitle>
          <DialogDescription>
            Are you sure you want to refund this purchase? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Refund Reason
          </label>
          <Input
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Enter reason for refund"
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={onRefund}
            disabled={!refundReason}
          >
            Confirm Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
