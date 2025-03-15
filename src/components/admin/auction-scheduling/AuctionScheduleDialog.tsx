
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { adminSupabase } from "@/integrations/supabase/adminClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Auction } from "@/types/auction";

interface AuctionScheduleDialogProps {
  auction: Auction;
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

type FormValues = {
  startDate: Date;
  startHour: string;
  startMinute: string;
  endDate: Date;
  endHour: string;
  endMinute: string;
  notes: string;
  isManuallyControlled: boolean;
};

export function AuctionScheduleDialog({
  auction,
  isOpen,
  onClose,
  onScheduled,
}: AuctionScheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    auction.auction_start_time 
      ? new Date(auction.auction_start_time) 
      : new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    auction.auction_end_time 
      ? new Date(auction.auction_end_time) 
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      startDate: startDate,
      startHour: startDate ? format(startDate, "HH") : "12",
      startMinute: startDate ? format(startDate, "mm") : "00",
      endDate: endDate,
      endHour: endDate ? format(endDate, "HH") : "12",
      endMinute: endDate ? format(endDate, "mm") : "00",
      notes: auction.seller_notes || "",
      isManuallyControlled: auction.is_manually_controlled || false,
    },
  });

  const isManuallyControlled = watch("isManuallyControlled");

  const handleSaveSchedule = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Create DateTime objects for start and end times
      const startDateTime = new Date(data.startDate);
      startDateTime.setHours(parseInt(data.startHour, 10));
      startDateTime.setMinutes(parseInt(data.startMinute, 10));
      
      const endDateTime = new Date(data.endDate);
      endDateTime.setHours(parseInt(data.endHour, 10));
      endDateTime.setMinutes(parseInt(data.endMinute, 10));

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        toast.error("Invalid Schedule", {
          description: "End time must be after start time"
        });
        setIsSubmitting(false);
        return;
      }

      // Get current user ID for created_by
      const { data: { user } } = await adminSupabase.auth.getUser();
      
      // Create auction schedule
      const { error } = await adminSupabase
        .from('auction_schedules')
        .insert({
          car_id: auction.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: data.notes,
          created_by: user?.id,
          is_manually_controlled: data.isManuallyControlled
        });

      if (error) throw error;

      toast.success("Auction Scheduled", {
        description: `Auction for ${auction.title} has been scheduled`
      });
      
      onScheduled();
      onClose();
    } catch (err) {
      console.error("Error scheduling auction:", err);
      toast.error("Schedule Failed", {
        description: "Failed to schedule the auction. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleSaveSchedule)}>
          <DialogHeader>
            <DialogTitle>Schedule Auction</DialogTitle>
            <DialogDescription>
              Set the start and end times for "{auction.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setValue("startDate", date as Date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex space-x-2">
                  <Input
                    {...register("startHour")}
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    className="w-1/2"
                  />
                  <Input
                    {...register("startMinute")}
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-1/2"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setValue("endDate", date as Date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex space-x-2">
                  <Input
                    {...register("endHour")}
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    className="w-1/2"
                  />
                  <Input
                    {...register("endMinute")}
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-1/2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                {...register("notes")}
                id="notes"
                placeholder="Add any notes about this auction schedule"
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="manual-control"
                checked={isManuallyControlled}
                onCheckedChange={(checked) => setValue("isManuallyControlled", checked)}
              />
              <Label htmlFor="manual-control">Manually control auction status</Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Auction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
