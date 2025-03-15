
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarClock, CheckCircle, Clock, XCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminSupabase } from "@/integrations/supabase/adminClient";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

import { AuctionSchedule } from "@/types/auction";

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
  const [schedules, setSchedules] = useState<AuctionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [carId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      let query = adminSupabase
        .from('auction_schedules')
        .select(`
          *,
          car:cars(*)
        `)
        .order('start_time', { ascending: true });
      
      // If carId is provided, filter by this car
      if (carId) {
        query = query.eq('car_id', carId);
      }
        
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSchedules(data as AuctionSchedule[]);
    } catch (err) {
      console.error('Error fetching auction schedules:', err);
      setError('Failed to load auction schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    try {
      // Update schedule status to 'cancelled'
      const { error } = await adminSupabase
        .from('auction_schedules')
        .update({
          status: 'cancelled',
          last_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setSchedules(schedules.map(schedule => 
        schedule.id === id ? { ...schedule, status: 'cancelled' } : schedule
      ));
      
      toast.success("Schedule Cancelled", {
        description: "The auction schedule has been cancelled"
      });
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error cancelling schedule:', err);
      toast.error("Error", {
        description: "Failed to cancel the schedule"
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await adminSupabase
        .from('auction_schedules')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      
      toast.success("Schedule Deleted", {
        description: "The auction schedule has been removed"
      });
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error("Error", {
        description: "Failed to delete the schedule"
      });
    }
  };

  const getStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        {error}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarClock className="h-8 w-8 mx-auto mb-2" />
        <p>No auction schedules found</p>
      </div>
    );
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
                {schedule.start_time ? format(new Date(schedule.start_time), 'PPp') : 'Not set'}
              </TableCell>
              <TableCell>
                {schedule.end_time ? format(new Date(schedule.end_time), 'PPp') : 'Not set'}
              </TableCell>
              <TableCell>
                {schedule.is_manually_controlled ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-gray-400" />
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {schedule.status === 'scheduled' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSchedule && onEditSchedule(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this auction schedule? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSchedule(schedule.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  
                  {schedule.status === 'running' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-500 border-amber-500"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Running Auction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this running auction? This will stop the auction process.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep it running</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelSchedule(schedule.id)}>
                            Yes, cancel auction
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
