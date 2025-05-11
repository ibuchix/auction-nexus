
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
        
        // Check if VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables
        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
          console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
          toast.error('Admin API key is missing. Check your environment variables.');
        } else {
          console.log('VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables');
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
