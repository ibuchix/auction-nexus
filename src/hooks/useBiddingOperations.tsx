
import { useState } from "react";
import { useAuctionOperations } from "./useAuctionOperations";
import { toast } from "sonner";

export function useBiddingOperations(auctionId: string, dealerId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastBidAmount, setLastBidAmount] = useState<number | null>(null);
  const { placeBid, getProxyBid, deleteProxyBid } = useAuctionOperations();
  
  const [existingProxyBid, setExistingProxyBid] = useState<number | null>(null);
  const [isLoadingProxyBid, setIsLoadingProxyBid] = useState(true);
  
  // Fetch existing proxy bid
  const fetchProxyBid = async () => {
    try {
      setIsLoadingProxyBid(true);
      const amount = await getProxyBid(auctionId, dealerId);
      setExistingProxyBid(amount);
    } catch (error) {
      console.error("Error fetching proxy bid:", error);
    } finally {
      setIsLoadingProxyBid(false);
    }
  };
  
  // Submit a bid (with optional proxy bidding)
  const submitBid = async (
    amount: number, 
    useProxyBidding: boolean = false, 
    maxProxyAmount: number | null = null
  ) => {
    try {
      setIsLoading(true);
      const success = await placeBid(auctionId, dealerId, amount, useProxyBidding, maxProxyAmount);
      
      if (success) {
        setLastBidAmount(amount);
        
        // Update proxy bid status after placing a bid
        if (useProxyBidding && maxProxyAmount) {
          setExistingProxyBid(maxProxyAmount);
        } else {
          setExistingProxyBid(null);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel proxy bid
  const cancelProxyBid = async () => {
    try {
      setIsLoading(true);
      const success = await deleteProxyBid(auctionId, dealerId);
      
      if (success) {
        setExistingProxyBid(null);
      }
      
      return success;
    } catch (error) {
      console.error("Error cancelling proxy bid:", error);
      toast.error("Failed to cancel proxy bid");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isLoadingProxyBid,
    lastBidAmount,
    existingProxyBid,
    submitBid,
    cancelProxyBid,
    fetchProxyBid
  };
}
