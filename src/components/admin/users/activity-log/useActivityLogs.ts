
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

  const { data: logs, isLoading } = useQuery({
    queryKey: ['userActivityLogs', actionFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          created_at,
          details,
          user_id,
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        // Add one day to include the end date fully
        const nextDay = new Date(dateRange.to);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      return data || [];
    }
  });

  const filteredLogs = logs?.filter(log => {
    const userName = log.user?.full_name?.toLowerCase() || '';
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
