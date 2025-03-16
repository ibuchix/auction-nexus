
import { useAuctionStatusOperations } from "./auction/useAuctionStatusOperations";
import { useProxyBidOperations } from "./auction/useProxyBidOperations";
import { useBidOperations } from "./auction/useBidOperations";
import { useRecoveryOperations } from "./auction/useRecoveryOperations";

export function useAuctionOperations() {
  const auctionStatusOperations = useAuctionStatusOperations();
  const proxyBidOperations = useProxyBidOperations();
  const bidOperations = useBidOperations();
  const recoveryOperations = useRecoveryOperations();

  return {
    ...auctionStatusOperations,
    ...proxyBidOperations,
    ...bidOperations,
    ...recoveryOperations
  };
}
