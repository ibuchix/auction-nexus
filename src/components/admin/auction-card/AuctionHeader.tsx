import { AlertTriangle, Edit2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AuctionHeaderProps {
  title: string;
  vin: string;
  isDamaged: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onCancel: () => void;
}

export function AuctionHeader({ 
  title, 
  vin, 
  isDamaged, 
  isEditing, 
  onEditToggle, 
  onCancel 
}: AuctionHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {isDamaged && (
            <AlertTriangle 
              className="h-4 w-4 text-red-500" 
              aria-label="Vehicle has reported damage"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          VIN: {vin}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditToggle}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
            >
              <Ban className="h-4 w-4 mr-1" />
              Cancel Auction
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Auction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this auction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction onClick={onCancel}>
                Yes, cancel auction
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}