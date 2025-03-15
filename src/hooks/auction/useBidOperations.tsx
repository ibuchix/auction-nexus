
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlaceBidResponse } from "@/types/auctionOperations";
import { useProxyBidOperations } from "./useProxyBidOperations";

export function useBidOperations() {
  const { createProxyBid } = useProxyBidOperations();

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
    placeBid
  };
}
