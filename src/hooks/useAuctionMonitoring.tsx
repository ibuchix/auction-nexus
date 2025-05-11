
import { useQuery } from '@tanstack/react-query';
import { adminSupabase } from '@/integrations/supabase/adminClient';
import { useAuctionRealtime } from './useAuctionRealtime';
import { useAuctionOperations } from './useAuctionOperations';
import { Auction } from '@/types/auction';
import { toast } from 'sonner';

export function useAuctionMonitoring() {
  const { data: initialAuctions, isLoading, error } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      try {
        console.log('Fetching active auctions with adminSupabase client');
        
        // Verify the adminSupabase client has the service role key in headers
        const headers = (adminSupabase.rest.headers as any);
        if (!headers.apikey) {
          console.warn('apikey not found in adminSupabase headers, this could cause permission issues');
        } else {
          console.log('adminSupabase client has apikey in headers');
        }
        
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
        
        console.log(`Successfully fetched ${data?.length || 0} active auctions`);
        return data as unknown as Auction[];
      } catch (error) {
        console.error('Error in useAuctionMonitoring:', error);
        toast.error('Error monitoring auctions. Please check console for details.');
        throw error;
      }
    },
    retry: 2,
  });

  const realTimeAuctions = useAuctionRealtime(initialAuctions || []);
  const { pauseAuction, cancelAuction } = useAuctionOperations();

  return {
    auctions: realTimeAuctions,
    isLoading,
    error,
    pauseAuction,
    cancelAuction,
  };
}
