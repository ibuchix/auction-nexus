import { useQuery } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuctionRealtime } from './useAuctionRealtime';
import { useAuctionOperations } from './useAuctionOperations';

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  auction_metrics: Database['public']['Tables']['auction_metrics']['Row'][];
};

export function useAuctionMonitoring() {
  const { data: initialAuctions, isLoading } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          bids (
            amount,
            dealer_id,
            created_at,
            status
          ),
          auction_metrics (
            total_bids,
            unique_bidders,
            final_price
          )
        `)
        .eq('is_auction', true)
        .in('auction_status', ['active', 'pending'])
        .order('auction_end_time', { ascending: true });

      if (error) throw error;
      return data as Auction[];
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