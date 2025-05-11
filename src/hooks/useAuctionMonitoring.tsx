
import { useQuery } from '@tanstack/react-query';
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
        
        // Check if VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables
        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
          console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
          toast.error('Admin API key is missing. Check your environment variables.');
          return [];
        } else {
          console.log('VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables');
        }
        
        // Using Edge Function to bypass RLS policies
        const data = await edgeFunctionAdminOperations.getActiveAuctions();

        if (!data) {
          console.error('Failed to fetch auctions from Edge Function');
          toast.error('Failed to load auction data. Check admin privileges.');
          return [];
        }
        
        console.log(`Successfully fetched ${data?.length || 0} active auctions`);
        return data as Auction[];
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
