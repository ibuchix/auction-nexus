
// Fix the error in useBiddingOperations.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useBiddingOperations(carId: string, dealerId: string) {
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isCancellingBid, setIsCancellingBid] = useState(false);

  const placeBid = async (
    amount: number,
    useProxyBidding = false,
    maxProxyAmount: number | null = null
  ): Promise<boolean> => {
    try {
      setIsPlacingBid(true);

      // Validate input
      if (amount <= 0) {
        toast.error("Bid amount must be positive");
        return false;
      }

      if (useProxyBidding && (!maxProxyAmount || maxProxyAmount < amount)) {
        toast.error("Maximum proxy amount must be greater than or equal to bid amount");
        return false;
      }

      // Call the place_bid RPC function
      const { data, error } = await supabase.rpc("place_bid", {
        p_car_id: carId,
        p_dealer_id: dealerId,
        p_amount: amount,
        p_is_proxy: useProxyBidding,
        p_max_proxy_amount: maxProxyAmount
      });

      if (error) {
        console.error("Error placing bid:", error);
        toast.error(error.message || "Failed to place bid");
        return false;
      }

      // Parse the result
      const result = typeof data === "string" ? JSON.parse(data) : data;

      if (!result.success) {
        toast.error(result.error || "Failed to place bid");
        return false;
      }

      toast.success(
        useProxyBidding
          ? `Proxy bid placed successfully! Max: ${maxProxyAmount}`
          : `Bid of ${amount} placed successfully!`
      );
      
      return true;
    } catch (error) {
      console.error("Error in placeBid:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsPlacingBid(false);
    }
  };

  const cancelProxyBid = async (): Promise<boolean> => {
    try {
      setIsCancellingBid(true);

      // Delete the proxy bid
      const { error } = await supabase
        .from("proxy_bids")
        .delete()
        .match({ car_id: carId, dealer_id: dealerId });

      if (error) {
        console.error("Error cancelling proxy bid:", error);
        toast.error(error.message || "Failed to cancel proxy bid");
        return false;
      }

      toast.success("Proxy bid cancelled successfully");
      return true;
    } catch (error) {
      console.error("Error in cancelProxyBid:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsCancellingBid(false);
    }
  };

  return {
    placeBid,
    cancelProxyBid,
    isPlacingBid,
    isCancellingBid
  };
}
