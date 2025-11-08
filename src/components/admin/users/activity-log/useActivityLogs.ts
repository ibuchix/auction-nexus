
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { ActionType, LogEntry } from "./types";

export function useActivityLogs() {
  const [actionFilter, setActionFilter] = useState<ActionType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  const { data: logs, isLoading } = useQuery<LogEntry[]>({
    queryKey: ['userActivityLogs', actionFilter, dateRange],
    queryFn: async () => {
      const nextDay = dateRange?.to ? new Date(dateRange.to) : null;
      if (nextDay) {
        nextDay.setDate(nextDay.getDate() + 1);
      }

      const { data, error } = await supabase.rpc('get_activity_logs', {
        p_action_filter: actionFilter === "all" ? null : actionFilter,
        p_date_from: dateRange?.from?.toISOString() || null,
        p_date_to: nextDay?.toISOString() || null
      });

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      return (data as any[]) || [];
    }
  });

  const filteredLogs = logs?.filter(log => {
    const userName = log.user_full_name?.toLowerCase() || '';
    const entityType = log.entity_type?.toLowerCase() || '';
    const entityId = log.entity_id?.toLowerCase() || '';
    
    return (
      userName.includes(searchTerm.toLowerCase()) ||
      entityType.includes(searchTerm.toLowerCase()) ||
      entityId.includes(searchTerm.toLowerCase())
    );
  });

  return {
    logs: filteredLogs,
    isLoading,
    filters: {
      actionFilter,
      setActionFilter,
      searchTerm,
      setSearchTerm,
      dateRange,
      setDateRange
    }
  };
}
