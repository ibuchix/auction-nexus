
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminOperations } from "@/utils/adminOperations";
import { AuctionSchedule } from "@/types/auction";

export function useScheduleOperations(carId?: string) {
  const [schedules, setSchedules] = useState<AuctionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      // Use admin operations to fetch schedules
      const data = await adminOperations.getAllAuctionSchedules();
      
      if (data) {
        let filteredData = data as AuctionSchedule[];
        
        // If carId is provided, filter by this car
        if (carId) {
          filteredData = filteredData.filter(schedule => schedule.car_id === carId);
        }
        
        setSchedules(filteredData);
        setError(null);
      } else {
        setError('Failed to load auction schedules');
      }
    } catch (err) {
      console.error('Error fetching auction schedules:', err);
      setError('Failed to load auction schedules');
    } finally {
      setLoading(false);
    }
  };

  const cancelSchedule = async (id: string) => {
    try {
      const result = await adminOperations.updateAuctionScheduleStatus(id, 'cancelled');
      
      if (result) {
        // Update local state
        setSchedules(schedules.map(schedule => 
          schedule.id === id ? { ...schedule, status: 'cancelled' } : schedule
        ));
        
        toast.success("Schedule Cancelled", {
          description: "The auction schedule has been cancelled"
        });
        
        return true;
      } else {
        toast.error("Error", {
          description: "Failed to cancel the schedule"
        });
        return false;
      }
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
      const result = await adminOperations.deleteAuctionSchedule(id);
      
      if (result !== null) {
        // Update local state
        setSchedules(schedules.filter(schedule => schedule.id !== id));
        
        toast.success("Schedule Deleted", {
          description: "The auction schedule has been removed"
        });
        
        return true;
      } else {
        toast.error("Error", {
          description: "Failed to delete the schedule"
        });
        return false;
      }
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
