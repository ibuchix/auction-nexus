
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuctionRealtime } from './useAuctionRealtime';
import { useAuctionOperations } from './useAuctionOperations';
import { Auction } from '@/types/auction';
import { toast } from 'sonner';
import { edgeFunctionAdminOperations } from '@/utils/edgeFunctionAdminOperations';

export function useAuctionMonitoring() {
  const { data: initialAuctions, isLoading, error } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      try {
        console.log('Fetching active auctions via Edge Function');
        
        // Using Edge Function to bypass RLS policies
        const data = await edgeFunctionAdminOperations.getActiveAuctions();

        if (!data) {
          console.error('Failed to fetch auctions from Edge Function');
          toast.error('Failed to load auction data. Check admin privileges.');
          return [];
        }
        
        const auctionsArray = Array.isArray(data) ? data : [];
        console.log(`Successfully fetched ${auctionsArray.length || 0} active auctions`);
        return auctionsArray as Auction[];
      } catch (error) {
        console.error('Error in useAuctionMonitoring:', error);
        toast.error('Error monitoring auctions. Please check console for details.');
        throw error;
      }
    },
    retry: 2,
  });

  const realTimeAuctions = useAuctionRealtime(initialAuctions || []);
  const { pauseAuction, cancelAuction, endAuctionImmediately } = useAuctionOperations();
  const queryClient = useQueryClient();

  // Wrap endAuctionImmediately with query invalidation
  const endAuctionImmediatelyWithRefresh = async (auctionId: string) => {
    await endAuctionImmediately(auctionId);
    // Invalidate and refetch active auctions
    queryClient.invalidateQueries({ queryKey: ['activeAuctions'] });
  };

  return {
    auctions: realTimeAuctions,
    isLoading,
    error,
    pauseAuction,
    cancelAuction,
    endAuctionImmediately: endAuctionImmediatelyWithRefresh,
  };
}
