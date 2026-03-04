import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

function useTotalBids() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['totalBidsCard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_auction_bid_counts');

      if (error) {
        console.error('Total bids RPC error:', error);
        return { totalBids: 0, recentBids: 0 };
      }

      const row = data?.[0] ?? { total_bids: 0, recent_bids: 0 };
      return {
        totalBids: Number(row.total_bids) || 0,
        recentBids: Number(row.recent_bids) || 0,
      };
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Realtime subscription for new bids
  useEffect(() => {
    const channel = supabase
      .channel('total-bids-card')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, () => {
        queryClient.invalidateQueries({ queryKey: ['totalBidsCard'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { totalBids: data?.totalBids ?? 0, recentBids: data?.recentBids ?? 0, isLoading };
}

export function TotalBidsCard() {
  const { totalBids, recentBids, isLoading } = useTotalBids();

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            {recentBids > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            Total Bids
          </div>
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold">{totalBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across active auctions
            </p>
            <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Last 24h: <span className="font-medium text-foreground">{recentBids}</span> new {recentBids === 1 ? 'bid' : 'bids'}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
