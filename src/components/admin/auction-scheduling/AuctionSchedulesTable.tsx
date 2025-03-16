
import { CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuctionSchedule } from "@/types/auction";
import { useScheduleOperations } from "@/hooks/useScheduleOperations";
import { SchedulesLoadingSkeleton } from "./components/SchedulesLoadingSkeleton";
import { SchedulesEmptyState } from "./components/SchedulesEmptyState";
import { ScheduleActions } from "./components/ScheduleActions";
import { formatScheduleDate, getStatusBadge } from "./utils/schedule-utils";

interface AuctionSchedulesTableProps {
  carId?: string;
  onEditSchedule?: (schedule: AuctionSchedule) => void;
  onRefresh?: () => void;
}

export function AuctionSchedulesTable({ 
  carId,
  onEditSchedule,
  onRefresh
}: AuctionSchedulesTableProps) {
  const { 
    schedules, 
    loading, 
    error, 
    cancelSchedule, 
    deleteSchedule 
  } = useScheduleOperations(carId);

  const handleCancelSchedule = async (id: string) => {
    const success = await cancelSchedule(id);
    if (success && onRefresh) onRefresh();
  };

  const handleDeleteSchedule = async (id: string) => {
    const success = await deleteSchedule(id);
    if (success && onRefresh) onRefresh();
  };

  if (loading) {
    return <SchedulesLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        {error}
      </div>
    );
  }

  if (schedules.length === 0) {
    return <SchedulesEmptyState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Manual Control</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">
                {schedule.car?.title || "Unknown Auction"}
              </TableCell>
              <TableCell>
                {getStatusBadge(schedule.status)}
              </TableCell>
              <TableCell>
                {formatScheduleDate(schedule.start_time)}
              </TableCell>
              <TableCell>
                {formatScheduleDate(schedule.end_time)}
              </TableCell>
              <TableCell>
                {schedule.is_manually_controlled ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-gray-400" />
                }
              </TableCell>
              <TableCell className="text-right">
                <ScheduleActions 
                  schedule={schedule}
                  onEdit={onEditSchedule}
                  onDelete={handleDeleteSchedule}
                  onCancel={handleCancelSchedule}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
