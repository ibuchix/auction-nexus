
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuctionRealtime } from './useAuctionRealtime';
import { useAuctionOperations } from './useAuctionOperations';
import { Auction } from '@/types/auction';

export function useAuctionMonitoring() {
  const { data: initialAuctions, isLoading } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          bids (*),
          auction_metrics (*),
          seller:profiles (*)
        `)
        .eq('is_auction', true)
        .in('auction_status', ['active', 'pending'])
        .order('auction_end_time', { ascending: true });

      if (error) {
        console.error('Error fetching auctions:', error);
        throw error;
      }
      return data as unknown as Auction[];
    },
  });

  const realTimeAuctions = useAuctionRealtime(initialAuctions || []);
  const { pauseAuction, cancelAuction } = useAuctionOperations();

  return {
    auctions: realTimeAuctions,
    isLoading,
    pauseAuction,
    cancelAuction,
  };
}
