
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlaceBidResponse } from "@/types/auctionOperations";

export function useBidOperations() {
  // Place a bid with optional proxy bidding
  const placeBid = async (
    auctionId: string, 
    dealerId: string, 
    amount: number, 
    useProxyBidding: boolean = false, 
    maxProxyAmount: number | null = null
  ): Promise<boolean> => {
    try {
      if (useProxyBidding && !maxProxyAmount) {
        toast.error("Maximum proxy bid amount is required when using proxy bidding");
        return false;
      }
      
      // Call the placeBid RPC function with proxy bidding parameters
      const { data, error } = await supabase.rpc<PlaceBidResponse>('place_bid', {
        p_car_id: auctionId,
        p_dealer_id: dealerId,
        p_amount: amount,
        p_is_proxy: useProxyBidding,
        p_max_proxy_amount: maxProxyAmount
      });
      
      if (error) throw error;
      if (data && !data.success) {
        toast.error(data.error || "Failed to place bid");
        return false;
      }
      
      toast.success("Bid placed successfully");
      return true;
    } catch (error) {
      toast.error("Failed to place bid");
      console.error('Error placing bid:', error);
      return false;
    }
  };

  return {
    placeBid
  };
}
