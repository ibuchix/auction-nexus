
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, isBefore } from "date-fns";
import { AlertTriangle, Clock, Hand, Pause, Play, Plus, AlertCircle } from "lucide-react";
import { AuctionStatus } from "@/types/auction";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AuctionStatusActionsProps {
  status: AuctionStatus;
  startTime?: string;
  endTime?: string;
  isManuallyControlled?: boolean;
  onStart: () => Promise<void>;
  onPause: () => Promise<void>;
  onCancel: () => Promise<void>;
  onExtendTime?: () => Promise<void>;
  onEndImmediately?: () => Promise<void>;
}

export function AuctionStatusActions({
  status,
  startTime,
  endTime,
  isManuallyControlled = false,
  onStart,
  onPause,
  onCancel,
  onExtendTime,
  onEndImmediately
}: AuctionStatusActionsProps) {
  const [showEndDialog, setShowEndDialog] = useState(false);

  const handleEndAuctionConfirm = async () => {
    if (onEndImmediately) {
      await onEndImmediately();
    }
    setShowEndDialog(false);
  };
  
  // Calculate time remaining if auction is active and has an end time
  const renderTimeInfo = () => {
    if (status === "active" && endTime) {
      const endDateTime = new Date(endTime);
      const isEnded = isBefore(endDateTime, new Date());
      
      return (
        <div className="flex items-center text-sm mt-2">
          <Clock className="h-4 w-4 mr-1" />
          {isEnded ? (
            <span className="text-red-500">Auction has ended</span>
          ) : (
            <span>Ends in {formatDistanceToNow(endDateTime)}</span>
          )}
          {isManuallyControlled && (
            <span className="ml-2 flex items-center text-amber-600">
              <Hand className="h-4 w-4 mr-1" />
              Manually controlled
            </span>
          )}
        </div>
      );
    }
    
    if (isManuallyControlled) {
      return (
        <div className="flex items-center text-sm mt-2">
          <Hand className="h-4 w-4 mr-1" />
          <span className="text-amber-600">Manually controlled</span>
        </div>
      );
    }
    
    return null;
  };

  const renderActions = () => {
    switch (status) {
      case "ready":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={onStart}
            className="mt-2"
          >
            <Play className="h-4 w-4 mr-1" />
            Start Auction
          </Button>
        );
      case "active":
        return (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              {onExtendTime && endTime && new Date(endTime) > new Date() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExtendTime}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Extend Time
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onEndImmediately && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndDialog(true)}
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  End Auction Now
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Cancel Auction
              </Button>
            </div>
          </div>
        );
      case "paused":
        return (
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onStart}
            >
              <Play className="h-4 w-4 mr-1" />
              Resume Auction
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Cancel Auction
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-1">
      {renderTimeInfo()}
      {renderActions()}
      
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Auction Immediately?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will immediately end the auction and process the results. This action will:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Change the auction status to "ended"</li>
                <li>Determine the winner based on highest bid (if reserve met)</li>
                <li>Notify the seller of the results</li>
                <li>Log this as a manually ended auction</li>
              </ul>
              <p className="font-semibold text-foreground mt-2">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndAuctionConfirm}
              className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              End Auction Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
