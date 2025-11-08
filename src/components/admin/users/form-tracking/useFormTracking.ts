import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { FormTrackingLog } from "./types";

export function useFormTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['formTrackingLogs', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_form_tracking_logs');

      if (error) {
        console.error('Error fetching form tracking logs:', error);
        throw error;
      }

      return (data || []) as FormTrackingLog[];
    }
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    let filtered = logs;

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dateRange.from!;
      });
    }

    if (dateRange?.to) {
      const nextDay = new Date(dateRange.to);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate < nextDay;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        const userName = log.user_full_name?.toLowerCase() || '';
        const userEmail = log.user_email?.toLowerCase() || '';
        const formType = log.details?.form_type?.toLowerCase() || '';
        const eventType = log.details?.event_type?.toLowerCase() || '';
        
        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          formType.includes(searchLower) ||
          eventType.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [logs, dateRange, searchTerm]);

  return {
    logs: filteredLogs,
    isLoading,
    filters: {
      searchTerm,
      setSearchTerm,
      dateRange,
      setDateRange
    }
  };
}
