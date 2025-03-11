
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, isBefore } from "date-fns";
import { AlertTriangle, Clock, Hand, Pause, Play, Plus } from "lucide-react";
import { AuctionStatus } from "@/types/auction";

interface AuctionStatusActionsProps {
  status: AuctionStatus;
  startTime?: string;
  endTime?: string;
  isManuallyControlled?: boolean;
  onStart: () => Promise<void>;
  onPause: () => Promise<void>;
  onCancel: () => Promise<void>;
  onExtendTime?: () => Promise<void>;
}

export function AuctionStatusActions({
  status,
  startTime,
  endTime,
  isManuallyControlled = false,
  onStart,
  onPause,
  onCancel,
  onExtendTime
}: AuctionStatusActionsProps) {
  
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
              {onExtendTime && (
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
    </div>
  );
}
