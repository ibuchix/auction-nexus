
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

interface DeleteSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSeller: () => Promise<void>;
}

export const DeleteSellerDialog = ({ 
  open, 
  onOpenChange, 
  onDeleteSeller 
}: DeleteSellerDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteSeller();
      // The parent component will handle success messages and dialog closing
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
          <DialogTitle>Remove Seller Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this seller account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
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
