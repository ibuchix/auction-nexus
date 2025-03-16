
import { format } from "date-fns";
import { AuctionSchedule } from "@/types/auction";
import { Badge } from "@/components/ui/badge";

// Format date for display
export const formatScheduleDate = (dateString?: string) => {
  return dateString ? format(new Date(dateString), 'PPp') : 'Not set';
};

// Get status badge based on schedule status
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600">Scheduled</Badge>;
    case 'running':
      return <Badge variant="default" className="bg-green-100 text-green-700">Running</Badge>;
    case 'completed':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="bg-red-100 text-red-700">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
