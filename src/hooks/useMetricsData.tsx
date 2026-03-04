import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformMetrics {
  total_listings: number;
  total_bids: number;
  active_dealers_7d: number;
  total_approved_dealers: number;
  dealer_activation_rate: number;
  avg_bids_per_listing: number;
  pct_listings_2plus_bids: number;
  seller_acceptance_rate: number;
  sell_through_rate: number;
}

export interface MetricsSnapshot {
  snapshot_date: string;
  total_listings: number;
  total_bids: number;
  active_dealers_7d: number;
  total_approved_dealers: number;
  dealer_activation_rate: number;
  avg_bids_per_listing: number;
  pct_listings_2plus_bids: number;
  seller_acceptance_rate: number;
  sell_through_rate: number;
}

export function useMetricsData() {
  const liveQuery = useQuery({
    queryKey: ["platform-metrics-live"],
    queryFn: async (): Promise<PlatformMetrics> => {
      const { data, error } = await supabase.rpc("compute_platform_metrics");
      if (error) throw error;
      return data as unknown as PlatformMetrics;
    },
    staleTime: 60_000,
  });

  const historyQuery = useQuery({
    queryKey: ["platform-metrics-history"],
    queryFn: async (): Promise<MetricsSnapshot[]> => {
      const { data, error } = await supabase
        .from("metrics_weekly_snapshots")
        .select("snapshot_date, total_listings, total_bids, active_dealers_7d, total_approved_dealers, dealer_activation_rate, avg_bids_per_listing, pct_listings_2plus_bids, seller_acceptance_rate, sell_through_rate")
        .order("snapshot_date", { ascending: true })
        .limit(52);
      if (error) throw error;
      return (data ?? []) as MetricsSnapshot[];
    },
    staleTime: 300_000,
  });

  return {
    live: liveQuery.data ?? null,
    history: historyQuery.data ?? [],
    isLoading: liveQuery.isLoading || historyQuery.isLoading,
    error: liveQuery.error || historyQuery.error,
  };
}
