
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DateRange {
  from: Date;
  to: Date;
}

export function useAnalyticsData(dateRange: DateRange) {
  const { data: summaries, isLoading, refetch } = useQuery({
    queryKey: ['auctionSummaries', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_daily_summaries')
        .select('*')
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate totals and averages
  const totals = summaries?.reduce((acc, curr) => ({
    totalAuctions: (acc.totalAuctions || 0) + curr.total_auctions_closed,
    totalSold: (acc.totalSold || 0) + curr.sold_vehicles,
    totalUnsold: (acc.totalUnsold || 0) + curr.unsold_vehicles,
    totalValue: (acc.totalValue || 0) + curr.total_value,
    averagePrice: [...(acc.averagePrice || []), curr.average_sale_price]
  }), {} as any);

  const averageSalePrice = totals?.averagePrice?.reduce((a: number, b: number) => a + b, 0) / totals?.averagePrice?.length || 0;

  return {
    summaries,
    isLoading,
    refetch,
    totals: totals || { totalAuctions: 0, totalSold: 0, totalUnsold: 0, totalValue: 0 },
    averageSalePrice: averageSalePrice || 0
  };
}
