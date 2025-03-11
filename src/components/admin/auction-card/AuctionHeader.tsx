
import { AlertTriangle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionStatus } from "@/types/auction";
import { AuctionStatusActions } from "./AuctionStatusActions";

interface AuctionHeaderProps {
  title: string;
  vin: string;
  isDamaged: boolean;
  isEditing: boolean;
  status: AuctionStatus;
  startTime?: string;
  endTime?: string;
  isManuallyControlled?: boolean;
  onEditToggle: () => void;
  onCancel: () => Promise<void>;
  onStart?: () => Promise<void>;
  onPause?: () => Promise<void>;
  onExtendTime?: () => Promise<void>;
}

export function AuctionHeader({ 
  title, 
  vin, 
  isDamaged, 
  isEditing, 
  status,
  startTime,
  endTime,
  isManuallyControlled = false,
  onEditToggle, 
  onCancel,
  onStart,
  onPause,
  onExtendTime
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
        <p className="text-sm text-muted-foreground">
          Status: {status}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditToggle}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>

        {onStart && onPause && (
          <AuctionStatusActions
            status={status}
            startTime={startTime}
            endTime={endTime}
            isManuallyControlled={isManuallyControlled}
            onStart={onStart}
            onPause={onPause}
            onCancel={onCancel}
            onExtendTime={onExtendTime}
          />
        )}
      </div>
    </div>
  );
}
