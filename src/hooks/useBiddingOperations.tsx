
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useBiddingOperations(carId: string, dealerId: string) {
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitBid = async (amount: number): Promise<boolean> => {
    try {
      setIsPlacingBid(true);

      // Validate input
      if (amount <= 0) {
        toast.error("Bid amount must be positive");
        return false;
      }

      // Call the place_bid RPC function
      const { data, error } = await supabase.rpc("place_bid", {
        p_car_id: carId,
        p_dealer_id: dealerId,
        p_amount: amount,
        p_is_proxy: false,
        p_max_proxy_amount: null
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

      toast.success(`Bid of ${amount} placed successfully!`);
      return true;
    } catch (error) {
      console.error("Error in placeBid:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsPlacingBid(false);
    }
  };

  return {
    placeBid: submitBid,
    isPlacingBid,
    isLoading,
    submitBid
  };
}
