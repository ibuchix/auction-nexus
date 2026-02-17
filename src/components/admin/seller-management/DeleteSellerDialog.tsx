
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface SellerInfo {
  name: string | null;
  email: string | null;
  active_listings: number;
  total_listings: number;
}

interface DeleteSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSeller: () => Promise<void>;
  seller: SellerInfo | null;
}

export const DeleteSellerDialog = ({ 
  open, 
  onOpenChange, 
  onDeleteSeller,
  seller 
}: DeleteSellerDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteSeller();
    } catch (error) {
      toast.error('Failed to remove seller account');
      console.error('Error removing seller:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Seller Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The following will be permanently deleted:
          </DialogDescription>
        </DialogHeader>

        {seller && (
          <div className="rounded-md border p-3 space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {seller.name || 'N/A'}</div>
            <div><span className="font-medium">Email:</span> {seller.email || 'N/A'}</div>
            <div><span className="font-medium">Car Listings:</span> {seller.total_listings} total ({seller.active_listings} active)</div>
          </div>
        )}

        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Seller profile and user account</li>
          <li>All vehicle listings and uploaded files</li>
          <li>Associated bids, auction schedules, and results</li>
          <li>Notifications and history records</li>
        </ul>

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Removing..." : "Remove Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
