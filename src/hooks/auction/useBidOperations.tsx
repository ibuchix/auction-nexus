
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlaceBidResponse } from "@/types/auctionOperations";

export function useBidOperations() {
  // Place a regular bid
  const placeBid = async (
    auctionId: string, 
    dealerId: string, 
    amount: number
  ): Promise<boolean> => {
    try {
      // Call the placeBid RPC function
      const { data, error } = await supabase.rpc<PlaceBidResponse>('place_bid', {
        p_car_id: auctionId,
        p_dealer_id: dealerId,
        p_amount: amount,
        p_is_proxy: false,
        p_max_proxy_amount: null
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
