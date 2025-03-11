
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { DateRangePicker } from "@/components/admin/audit-logs/DateRangePicker";
import { DateRange } from "react-day-picker";

export function UserActivityLog() {
  const [actionFilter, setActionFilter] = useState<string>("all");
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

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return "default";
      case 'update':
        return "outline";
      case 'delete':
        return "destructive";
      case 'login':
        return "default";
      case 'logout':
        return "secondary";
      case 'approve':
        return "default";
      case 'reject':
        return "destructive";
      case 'verify':
        return "default";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user activity..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="verify">Verify</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DateRangePicker 
          date={dateRange} 
          onDateChange={setDateRange}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  {log.user?.full_name || "System"}
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {log.entity_type}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.entity_id ? log.entity_id.substring(0, 8) : "-"}
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
