
import { useAuctionStatusOperations } from "./auction/useAuctionStatusOperations";
import { useProxyBidOperations } from "./auction/useProxyBidOperations";
import { useBidOperations } from "./auction/useBidOperations";

export function useAuctionOperations() {
  const auctionStatusOperations = useAuctionStatusOperations();
  const proxyBidOperations = useProxyBidOperations();
  const bidOperations = useBidOperations();

  return {
    ...auctionStatusOperations,
    ...proxyBidOperations,
    ...bidOperations
  };
}
