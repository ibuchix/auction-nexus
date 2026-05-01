
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Ban, 
  Edit, 
  Save, 
  X, 
  Clock,
  Calendar,
  Settings
} from "lucide-react";
import { AuctionStatus } from "@/types/auction";
import { ListingBadges } from "@/components/listing/ListingBadges";
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
  title?: string;
  vin?: string;
  isDamaged?: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onOpenEditDialog?: () => void;
  onCancel: () => Promise<void>;
  onStart?: () => Promise<void>;
  onPause?: () => Promise<void>;
  onExtendTime?: () => Promise<void>;
  onScheduleClick?: () => void;
  status?: AuctionStatus;
  startTime?: string;
  endTime?: string;
  isManuallyControlled?: boolean;
  listedDate?: string;
  car?: any;
}

export function AuctionHeader({
  title,
  vin,
  isDamaged,
  isEditing,
  onEditToggle,
  onOpenEditDialog,
  onCancel,
  onStart,
  onPause,
  onExtendTime,
  onScheduleClick,
  status,
  startTime,
  endTime,
  isManuallyControlled,
  listedDate,
  car
}: AuctionHeaderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await action();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'ready':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Ready</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'sold':
        return <Badge variant="default" className="bg-emerald-500">Sold</Badge>;
      default:
        return <Badge variant="outline">Not Configured</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {title || "Untitled Vehicle"}
            {isDamaged && (
              <Badge variant="destructive" className="text-xs">
                Damaged
              </Badge>
            )}
          </h3>
          {vin && (
            <p className="text-sm text-muted-foreground">VIN: {vin}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {getStatusBadge()}
            {isManuallyControlled && (
              <Badge variant="outline" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Manual Control
              </Badge>
            )}
            {car && <ListingBadges car={car} />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEditDialog || onEditToggle}
            disabled={isSubmitting}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {(listedDate || startTime || endTime) && (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm text-muted-foreground">
          {listedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Listed: {new Date(listedDate).toLocaleString()}</span>
            </div>
          )}
          {startTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Start: {new Date(startTime).toLocaleString()}</span>
            </div>
          )}
          {endTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>End: {new Date(endTime).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {onScheduleClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleClick}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        )}

        {onStart && (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction(onStart)}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        )}

        {onPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onPause)}
            disabled={isSubmitting}
          >
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </Button>
        )}

        {onExtendTime && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onExtendTime)}
            disabled={isSubmitting}
          >
            <Clock className="h-4 w-4 mr-1" />
            Extend
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
            >
              <Ban className="h-4 w-4 mr-1" />
              Cancel
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
              <AlertDialogAction onClick={() => handleAction(onCancel)}>
                Yes, cancel auction
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
