
import { Button } from "@/components/ui/button";
import { AuctionStatus } from "@/types/auction";
import { PlayCircle, PauseCircle, XCircle, Clock } from "lucide-react";
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

interface AuctionStatusActionsProps {
  status?: AuctionStatus;
  startTime?: string;
  endTime?: string;
  onStart: () => Promise<void>;
  onPause: () => Promise<void>;
  onCancel: () => Promise<void>;
}

export function AuctionStatusActions({
  status,
  startTime,
  endTime,
  onStart,
  onPause,
  onCancel
}: AuctionStatusActionsProps) {
  const isStarted = status === 'active';
  const isPaused = status === 'paused';
  const isEnded = status === 'ended' || status === 'cancelled';
  const isReady = status === 'ready' || !status;
  
  const now = new Date();
  const hasEndTimePassed = endTime && isPast(new Date(endTime));
  const timeUntilEnd = endTime ? formatDistance(new Date(endTime), now, { addSuffix: true }) : '';
  
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
      
      {endTime && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {hasEndTimePassed ? (
            <span>Ended on {format(new Date(endTime), 'MMM d, yyyy HH:mm')}</span>
          ) : (
            <>
              <span>Ends {timeUntilEnd}</span>
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
