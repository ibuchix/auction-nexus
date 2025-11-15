
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addHours } from "date-fns";

export function useAuctionStatusOperations() {
  const pauseAuction = async (auctionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          auction_status: 'paused',
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction paused successfully");
    } catch (error) {
      toast.error("Failed to pause auction");
      console.error('Error pausing auction:', error);
      throw error;
    }
  };

  const cancelAuction = async (auctionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          auction_status: 'cancelled',
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel auction");
      console.error('Error cancelling auction:', error);
      throw error;
    }
  };

  const startAuction = async (auctionId: string): Promise<void> => {
    try {
      // Set up default end time (24 hours from now) if not specified
      const endTime = addHours(new Date(), 24).toISOString();
      
      const { error } = await supabase
        .from('cars')
        .update({ 
          auction_status: 'active',
          auction_start_time: new Date().toISOString(),
          auction_end_time: endTime,
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction started successfully");
    } catch (error) {
      toast.error("Failed to start auction");
      console.error('Error starting auction:', error);
      throw error;
    }
  };

  const resumeAuction = async (auctionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          auction_status: 'active',
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId)
        .eq('auction_status', 'paused');

      if (error) throw error;
      toast.success("Auction resumed successfully");
    } catch (error) {
      toast.error("Failed to resume auction");
      console.error('Error resuming auction:', error);
      throw error;
    }
  };

  const extendAuctionTime = async (auctionId: string, hours: number, reason?: string): Promise<void> => {
    try {
      // Call the new database function that updates both cars and auction_schedules
      const { data, error } = await supabase.rpc('extend_auction_time', {
        p_car_id: auctionId,
        p_hours_to_add: hours,
        p_extension_reason: reason
      });

      if (error) throw error;
      
      // Cast data to expected type
      const result = data as { success: boolean; error?: string } | null;
      
      if (!result?.success) {
        toast.error(result?.error || "Failed to extend auction time");
        return;
      }

      toast.success("Auction Extended", {
        description: `Extended by ${hours >= 1 ? `${hours} hour${hours > 1 ? 's' : ''}` : '30 minutes'}`
      });
    } catch (error) {
      toast.error("Failed to extend auction time");
      console.error('Error extending auction time:', error);
      throw error;
    }
  };

  const endAuctionImmediately = async (auctionId: string): Promise<void> => {
    try {
      // Call the database function to immediately end the auction
      const { data, error } = await supabase.rpc('admin_end_auction_immediately', {
        p_car_id: auctionId
      });

      if (error) throw error;
      
      // Cast data to expected type
      const result = data as { success: boolean; error?: string; message?: string } | null;
      
      if (!result?.success) {
        toast.error(result?.error || "Failed to end auction");
        return;
      }

      toast.success("Auction Ended Successfully", {
        description: "The auction has been processed through the normal end flow"
      });
    } catch (error) {
      toast.error("Failed to end auction immediately");
      console.error('Error ending auction immediately:', error);
      throw error;
    }
  };

  return {
    pauseAuction,
    cancelAuction,
    startAuction,
    resumeAuction,
    extendAuctionTime,
    endAuctionImmediately
  };
}
