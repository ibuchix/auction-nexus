
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProxyBidOperations() {
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

  return {
    createProxyBid,
    getProxyBid,
    deleteProxyBid
  };
}
