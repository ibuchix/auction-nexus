
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProxyBid } from "@/types/auction";

export function useBiddingOperations(carId: string, dealerId: string) {
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isCancellingBid, setIsCancellingBid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProxyBid, setIsLoadingProxyBid] = useState(true);
  const [existingProxyBid, setExistingProxyBid] = useState<ProxyBid | null>(null);

  const fetchProxyBid = async () => {
    try {
      setIsLoadingProxyBid(true);
      const { data, error } = await supabase
        .from("proxy_bids")
        .select("*")
        .eq("car_id", carId)
        .eq("dealer_id", dealerId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error code
          console.error("Error fetching proxy bid:", error);
        }
        setExistingProxyBid(null);
        return;
      }

      // Map the response data to the ProxyBid type
      setExistingProxyBid(data as ProxyBid);
    } catch (error) {
      console.error("Error in fetchProxyBid:", error);
    } finally {
      setIsLoadingProxyBid(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProxyBid();
  }, [carId, dealerId]);

  const submitBid = async (
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
      
      // Refresh the proxy bid state if needed
      if (useProxyBidding) {
        await fetchProxyBid();
      }
      
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
      setExistingProxyBid(null);
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
    placeBid: submitBid,
    cancelProxyBid,
    isPlacingBid,
    isCancellingBid,
    isLoading,
    isLoadingProxyBid,
    existingProxyBid,
    fetchProxyBid,
    submitBid
  };
}
