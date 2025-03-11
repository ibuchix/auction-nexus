
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  AlertCircle, 
  Calendar,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/admin/audit-logs/DateRangePicker";
import { type DateRange } from "react-day-picker";
import { LogTable } from "@/components/admin/audit-logs/LogTable";
import { useQuery } from "@tanstack/react-query";

type AuditLog = Tables<"audit_logs">;

const AuditLogs = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([]);
  const [actionTypeFilter, setActionTypeFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch entity types for filter dropdown
  const { data: entityTypes = [] } = useQuery({
    queryKey: ["entityTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("entity_type")
        .distinctOn("entity_type");
      
      if (error) throw error;
      return data.map(item => item.entity_type);
    }
  });

  // Fetch action types for filter dropdown
  const { data: actionTypes = [] } = useQuery({
    queryKey: ["actionTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("action")
        .distinctOn("action");
      
      if (error) throw error;
      return data.map(item => item.action);
    }
  });

  // Fetch audit logs with filters
  const { 
    data: logs = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["auditLogs", searchQuery, entityTypeFilter, actionTypeFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          user:profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      // Apply search query
      if (searchQuery) {
        query = query.or(`
          entity_id.ilike.%${searchQuery}%,
          entity_type.ilike.%${searchQuery}%,
          details.like.%${searchQuery}%
        `);
      }

      // Apply entity type filter
      if (entityTypeFilter.length > 0) {
        query = query.in("entity_type", entityTypeFilter);
      }

      // Apply action type filter
      if (actionTypeFilter.length > 0) {
        query = query.in("action", actionTypeFilter);
      }

      // Apply date range filter
      if (dateRange?.from) {
        query = query.gte("created_at", dateRange.from.toISOString());
        
        if (dateRange.to) {
          // Add one day to include the end date fully
          const endDate = new Date(dateRange.to);
          endDate.setDate(endDate.getDate() + 1);
          query = query.lt("created_at", endDate.toISOString());
        }
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const handleExport = async () => {
    try {
      // Create CSV content
      const headers = ["ID", "Action", "Entity Type", "Entity ID", "User", "Timestamp", "IP Address", "User Agent", "Details"];
      
      const csvRows = [
        headers.join(","),
        ...logs.map(log => {
          const user = log.user ? (log.user as any).full_name : "System";
          const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : "";
          
          return [
            log.id,
            log.action,
            log.entity_type,
            log.entity_id,
            user,
            format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
            log.ip_address || "",
            (log.user_agent || "").replace(/,/g, ";"),
            `"${details}"`
          ].join(",");
        })
      ];

      const csvContent = csvRows.join("\n");
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log export in audit logs
      await supabase.rpc("log_admin_action", {
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_action: "export",
        p_entity_type: "audit_logs",
        p_entity_id: "00000000-0000-0000-0000-000000000000",
        p_details: {
          filters: {
            search: searchQuery,
            entityTypes: entityTypeFilter,
            actionTypes: actionTypeFilter,
            dateRange: dateRange
          },
          record_count: logs.length
        }
      });
      
      toast({
        title: "Export Successful",
        description: `${logs.length} audit log records exported to CSV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the audit logs",
        variant: "destructive"
      });
    }
  };

  const toggleEntityTypeFilter = (entityType: string) => {
    setEntityTypeFilter(prev => 
      prev.includes(entityType)
        ? prev.filter(t => t !== entityType)
        : [...prev, entityType]
    );
  };

  const toggleActionTypeFilter = (actionType: string) => {
    setActionTypeFilter(prev => 
      prev.includes(actionType)
        ? prev.filter(t => t !== actionType)
        : [...prev, actionType]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <Button onClick={handleExport} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Entity Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {entityTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={entityTypeFilter.includes(type)}
                      onCheckedChange={() => toggleEntityTypeFilter(type)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <History className="h-4 w-4" />
                    Action Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {actionTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={actionTypeFilter.includes(type)}
                      onCheckedChange={() => toggleActionTypeFilter(type)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Error Loading Audit Logs</h3>
              <p className="text-gray-500 mt-2">{(error as Error).message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <LogTable logs={logs} isLoading={isLoading} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
