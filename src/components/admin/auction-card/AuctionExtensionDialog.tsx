import { useState, useEffect } from "react";
import { format, addHours } from "date-fns";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AuctionExtensionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (hours: number, reason?: string) => Promise<void>;
  currentEndTime: string;
  auctionTitle: string;
}

const EXTENSION_OPTIONS = [
  { hours: 0.5, label: "30 min" },
  { hours: 1, label: "1 hour" },
  { hours: 2, label: "2 hours" },
  { hours: 4, label: "4 hours" },
  { hours: 8, label: "8 hours" },
  { hours: 12, label: "12 hours" },
  { hours: 24, label: "24 hours" },
];

export function AuctionExtensionDialog({
  isOpen,
  onClose,
  onExtend,
  currentEndTime,
  auctionTitle,
}: AuctionExtensionDialogProps) {
  const [selectedHours, setSelectedHours] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedHours(null);
      setReason("");
      setIsExtending(false);
    }
  }, [isOpen]);

  const currentEndDate = new Date(currentEndTime);
  const newEndDate = selectedHours ? addHours(currentEndDate, selectedHours) : null;

  const handleExtend = async () => {
    if (!selectedHours) return;

    setIsExtending(true);
    try {
      await onExtend(selectedHours, reason.trim() || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to extend auction:", error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Extend Auction Time
          </DialogTitle>
          <DialogDescription>
            Extend the auction time for <span className="font-semibold">{auctionTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current End Time */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground mb-1">Current End Time</div>
            <div className="text-lg font-semibold text-foreground">
              {format(currentEndDate, "PPp")}
            </div>
          </div>

          {/* Extension Options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Extension Duration
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {EXTENSION_OPTIONS.map((option) => (
                <Button
                  key={option.hours}
                  type="button"
                  variant={selectedHours === option.hours ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedHours(option.hours)}
                  className="h-auto py-2 px-3"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* New End Time Preview */}
          {newEndDate && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="text-sm text-muted-foreground mb-1">New End Time</div>
              <div className="text-lg font-semibold text-primary">
                {format(newEndDate, "PPp")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +{selectedHours! >= 1 ? `${selectedHours} hour${selectedHours! > 1 ? 's' : ''}` : '30 minutes'}
              </div>
            </div>
          )}

          {/* Optional Reason */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
              Reason (Optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for extension..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExtending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExtend}
            disabled={!selectedHours || isExtending}
          >
            {isExtending ? "Extending..." : "Extend Auction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
