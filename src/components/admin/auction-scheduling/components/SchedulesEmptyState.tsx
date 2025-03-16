
import { CalendarClock } from "lucide-react";

export function SchedulesEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <CalendarClock className="h-8 w-8 mx-auto mb-2" />
      <p>No auction schedules found</p>
    </div>
  );
}
