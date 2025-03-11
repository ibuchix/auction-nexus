
import { Button } from "@/components/ui/button";
import { AuctionStatus } from "@/types/auction";
import { PlayCircle, PauseCircle, XCircle, Clock, CalendarClock, HandRaised } from "lucide-react";
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
import { format, differenceInMinutes, isPast, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AuctionStatusActionsProps {
  status?: AuctionStatus;
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
  const isStarted = status === 'active';
  const isPaused = status === 'paused';
  const isEnded = status === 'ended' || status === 'cancelled';
  const isReady = status === 'ready' || !status;
  
  const now = new Date();
  const hasEndTimePassed = endTime && isPast(new Date(endTime));
  const timeUntilEnd = endTime ? formatDistance(new Date(endTime), now, { addSuffix: true }) : '';
  
  // Check if auction is ending soon (less than 60 minutes)
  const isEndingSoon = endTime && 
    !hasEndTimePassed && 
    differenceInMinutes(new Date(endTime), now) < 60;
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {isReady && (
          <Button 
            variant="default" 
            size="sm" 
            className="text-sm"
            onClick={onStart}
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Start Auction
          </Button>
        )}
        
        {isStarted && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={onPause}
            >
              <PauseCircle className="h-4 w-4 mr-1" />
              Pause Auction
            </Button>
            
            {onExtendTime && isEndingSoon && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm"
                onClick={onExtendTime}
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Extend Time
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="text-sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Auction
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Active Auction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this auction? All bids will be invalidated and this action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, go back</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    Yes, cancel auction
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        
        {isPaused && (
          <>
            <Button 
              variant="default" 
              size="sm" 
              className="text-sm"
              onClick={onStart}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Resume Auction
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="text-sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Auction
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Paused Auction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this auction? All bids will be invalidated and this action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, go back</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    Yes, cancel auction
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
      
      {/* Status Indicator Badge */}
      <div className="flex items-center gap-2">
        {isManuallyControlled ? (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <HandRaised className="h-3 w-3" />
            Manually Controlled
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <CalendarClock className="h-3 w-3" />
            Auto Scheduled
          </Badge>
        )}
      </div>
      
      {endTime && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {hasEndTimePassed ? (
            <span>Ended on {format(new Date(endTime), 'MMM d, yyyy HH:mm')}</span>
          ) : (
            <>
              <span className={isEndingSoon ? "text-amber-700 font-medium" : ""}>
                Ends {timeUntilEnd}
                {isEndingSoon && " (Ending Soon)"}
              </span>
              <span className="text-xs">({format(new Date(endTime), 'MMM d, yyyy HH:mm')})</span>
            </>
          )}
        </div>
      )}
      
      {startTime && (
        <div className="text-xs text-muted-foreground">
          {isStarted ? 'Started' : 'Last activity'}: {format(new Date(startTime), 'MMM d, yyyy HH:mm')}
        </div>
      )}
    </div>
  );
}
