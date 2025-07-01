
import { useAuctionStatusOperations } from "./auction/useAuctionStatusOperations";
import { useBidOperations } from "./auction/useBidOperations";
import { useRecoveryOperations } from "./auction/useRecoveryOperations";

export function useAuctionOperations() {
  const auctionStatusOperations = useAuctionStatusOperations();
  const bidOperations = useBidOperations();
  const recoveryOperations = useRecoveryOperations();

  return {
    ...auctionStatusOperations,
    ...bidOperations,
    ...recoveryOperations
  };
}
