
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '@/integrations/supabase/adminClient'; // Using adminSupabase instead
import { useAuctionRealtime } from './useAuctionRealtime';
import { useAuctionOperations } from './useAuctionOperations';
import { Auction } from '@/types/auction';
import { toast } from 'sonner';

export function useAuctionMonitoring() {
  const { data: initialAuctions, isLoading } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      try {
        // Using adminSupabase to bypass RLS policies
        const { data, error } = await adminSupabase
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
          toast.error('Failed to load auction data. Check admin privileges.');
          throw error;
        }
        
        return data as unknown as Auction[];
      } catch (error) {
        console.error('Error in useAuctionMonitoring:', error);
        toast.error('Error monitoring auctions. Please check console for details.');
        return [];
      }
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
