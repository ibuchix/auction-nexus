
import { Edit, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionSchedule } from "@/types/auction";
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

interface ScheduleActionsProps {
  schedule: AuctionSchedule;
  onEdit?: (schedule: AuctionSchedule) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}

export function ScheduleActions({ schedule, onEdit, onDelete, onCancel }: ScheduleActionsProps) {
  if (schedule.status === 'scheduled') {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit && onEdit(schedule)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this auction schedule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(schedule.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  if (schedule.status === 'running') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-500 border-amber-500"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Running Auction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this running auction? This will stop the auction process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it running</AlertDialogCancel>
            <AlertDialogAction onClick={() => onCancel(schedule.id)}>
              Yes, cancel auction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  return null;
}
