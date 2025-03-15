
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

  const extendAuctionTime = async (auctionId: string): Promise<void> => {
    try {
      // Get current auction end time
      const { data: auction, error: fetchError } = await supabase
        .from('cars')
        .select('auction_end_time')
        .eq('id', auctionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Add 1 hour to the current end time
      const currentEndTime = new Date(auction.auction_end_time);
      const newEndTime = addHours(currentEndTime, 1).toISOString();
      
      const { error } = await supabase
        .from('cars')
        .update({ 
          auction_end_time: newEndTime,
          is_manually_controlled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      if (error) throw error;
      toast.success("Auction time extended by 1 hour");
    } catch (error) {
      toast.error("Failed to extend auction time");
      console.error('Error extending auction time:', error);
      throw error;
    }
  };

  return {
    pauseAuction,
    cancelAuction,
    startAuction,
    resumeAuction,
    extendAuctionTime
  };
}
