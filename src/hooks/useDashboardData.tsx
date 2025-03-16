
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardData() {
  const { data: sellerCount } = useQuery({
    queryKey: ['activeSellers'],
    queryFn: async () => {
      const { data: cars } = await supabase
        .from('cars')
        .select('seller_id')
        .eq('status', 'available');

      const uniqueSellers = new Set(cars?.map(car => car.seller_id));
      return uniqueSellers.size || 0;
    }
  });

  const { data: dealerCount } = useQuery({
    queryKey: ['verifiedDealers'],
    queryFn: async () => {
      const { count } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'approved');
      return count || 0;
    }
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('auction_results')
        .select('final_price')
        .gte('created_at', startOfMonth.toISOString())
        .not('final_price', 'is', null);

      return (data || []).reduce((sum, result) => sum + (result.final_price || 0), 0);
    }
  });

  const { data: successRate } = useQuery({
    queryKey: ['auctionSuccessRate'],
    queryFn: async () => {
      const { data: results } = await supabase
        .from('auction_results')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!results?.length) return 0;
      
      const successful = results.filter(result => result.sale_status === 'sold').length;
      return Math.round((successful / results.length) * 100);
    }
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn: async () => {
      const { count } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');
      return count || 0;
    }
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('is_auction', true)
        .eq('auction_status', 'active');
      return count || 0;
    }
  });

  const { data: suspiciousActivities } = useQuery({
    queryKey: ['suspiciousActivities'],
    queryFn: async () => {
      const { count } = await supabase
        .from('bid_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      return count || 0;
    }
  });

  return {
    sellerCount: sellerCount || 0,
    dealerCount: dealerCount || 0,
    monthlyRevenue: monthlyRevenue || 0,
    successRate: successRate || 0,
    pendingVerifications: pendingVerifications || 0,
    activeAuctions: activeAuctions || 0,
    suspiciousActivities: suspiciousActivities || 0
  };
}
