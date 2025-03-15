
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { addHours } from "date-fns";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

export function useAuctionOperations() {
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

  // New functions for proxy bidding
  const createProxyBid = async (auctionId: string, dealerId: string, maxAmount: number): Promise<void> => {
    try {
      // Check if there's an existing proxy bid for this dealer and auction
      const { data: existingBids, error: fetchError } = await supabase
        .from('proxy_bids')
        .select('id')
        .eq('car_id', auctionId)
        .eq('dealer_id', dealerId);
        
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingBids && existingBids.length > 0) {
        // Update existing proxy bid
        result = await supabase
          .from('proxy_bids')
          .update({ 
            max_bid_amount: maxAmount,
            updated_at: new Date().toISOString()
          })
          .eq('car_id', auctionId)
          .eq('dealer_id', dealerId);
      } else {
        // Create new proxy bid
        result = await supabase
          .from('proxy_bids')
          .insert({ 
            car_id: auctionId,
            dealer_id: dealerId,
            max_bid_amount: maxAmount
          });
      }
      
      if (result.error) throw result.error;
      toast.success("Proxy bid set successfully");
    } catch (error) {
      toast.error("Failed to set proxy bid");
      console.error('Error setting proxy bid:', error);
      throw error;
    }
  };

  const getProxyBid = async (auctionId: string, dealerId: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('proxy_bids')
        .select('max_bid_amount')
        .eq('car_id', auctionId)
        .eq('dealer_id', dealerId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }
      
      return data?.max_bid_amount || null;
    } catch (error) {
      console.error('Error fetching proxy bid:', error);
      return null;
    }
  };

  const deleteProxyBid = async (auctionId: string, dealerId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('proxy_bids')
        .delete()
        .eq('car_id', auctionId)
        .eq('dealer_id', dealerId);
        
      if (error) throw error;
      toast.success("Proxy bid removed successfully");
    } catch (error) {
      toast.error("Failed to remove proxy bid");
      console.error('Error removing proxy bid:', error);
      throw error;
    }
  };

  // Place a bid with optional proxy bidding
  const placeBid = async (
    auctionId: string, 
    dealerId: string, 
    amount: number, 
    useProxyBidding: boolean = false, 
    maxProxyAmount: number | null = null
  ): Promise<void> => {
    try {
      if (useProxyBidding && maxProxyAmount) {
        // Validate max proxy amount
        if (maxProxyAmount < amount) {
          toast.error("Maximum proxy bid amount must be greater than or equal to bid amount");
          return;
        }
        
        // Create/update proxy bid first
        await createProxyBid(auctionId, dealerId, maxProxyAmount);
      }
      
      // Call the placeBid RPC function
      const { data, error } = await supabase.rpc('place_bid', {
        p_car_id: auctionId,
        p_dealer_id: dealerId,
        p_amount: amount,
        p_is_proxy: useProxyBidding,
        p_max_proxy_amount: maxProxyAmount
      });
      
      if (error) throw error;
      if (!data.success) {
        toast.error(data.error || "Failed to place bid");
        return;
      }
      
      toast.success("Bid placed successfully");
    } catch (error) {
      toast.error("Failed to place bid");
      console.error('Error placing bid:', error);
      throw error;
    }
  };

  return {
    pauseAuction,
    cancelAuction,
    startAuction,
    resumeAuction,
    extendAuctionTime,
    createProxyBid,
    getProxyBid,
    deleteProxyBid,
    placeBid
  };
}
