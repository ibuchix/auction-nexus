import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isToday } from "date-fns";

interface ValuationStat {
  valuation_date: string;
  check_count: number;
}

interface FormattedStat {
  date: string;
  displayDate: string;
  count: number;
  isToday: boolean;
}

interface ValuationStatsResult {
  stats: FormattedStat[];
  todayCount: number;
  weekTotal: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useValuationStats = (): ValuationStatsResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["valuation-stats-7-days"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_valuation_stats_last_7_days");
      
      if (error) throw error;
      return data as ValuationStat[];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Generate all 7 days (including days with 0 checks)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });

  // Map data to include all days
  const stats: FormattedStat[] = last7Days.map((dateStr) => {
    const stat = data?.find((s) => s.valuation_date === dateStr);
    const dateObj = new Date(dateStr);
    
    return {
      date: dateStr,
      displayDate: isToday(dateObj) ? "Today" : format(dateObj, "MMM d"),
      count: stat?.check_count ?? 0,
      isToday: isToday(dateObj),
    };
  });

  const todayCount = stats.find((s) => s.isToday)?.count ?? 0;
  const weekTotal = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    stats,
    todayCount,
    weekTotal,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
