
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { AuctionSchedule } from "@/types/auction";

export function useScheduleOperations(carId?: string) {
  const [schedules, setSchedules] = useState<AuctionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const cancelSchedule = async (id: string) => {
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
      
      return true;
    } catch (err) {
      console.error('Error cancelling schedule:', err);
      toast.error("Error", {
        description: "Failed to cancel the schedule"
      });
      return false;
    }
  };

  const deleteSchedule = async (id: string) => {
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
      
      return true;
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error("Error", {
        description: "Failed to delete the schedule"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [carId]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    cancelSchedule,
    deleteSchedule
  };
}
