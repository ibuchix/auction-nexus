
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { StatusBadge } from "../disputes/components/StatusBadge";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AuditLog = Tables<"audit_logs"> & {
  user?: { full_name: string } | null;
};

interface LogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

export function LogTable({ logs, isLoading }: LogTableProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No audit logs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <ActionBadge action={log.action} />
              </TableCell>
              <TableCell className="capitalize">
                {log.entity_type}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {log.entity_id ? log.entity_id.substring(0, 8) : "-"}
              </TableCell>
              <TableCell>
                {log.user?.full_name || "System"}
              </TableCell>
              <TableCell>
                {log.details ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center text-blue-500 hover:text-blue-700">
                        <Info className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Action Details</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const getVariant = () => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "outline";
      case "delete":
        return "destructive";
      case "login":
        return "success";
      case "logout":
        return "secondary";
      case "approve":
        return "success";
      case "reject":
        return "destructive";
      case "verify":
        return "success";
      case "export":
        return "default";
      default:
        return "outline";
    }
  };

  // Using Badge component from UI library instead of StatusBadge that doesn't accept children
  return <Badge variant={getVariant()}>{action}</Badge>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}
