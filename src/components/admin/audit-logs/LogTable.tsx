
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuditLog = Tables<"audit_logs">;

interface LogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

export function LogTable({ logs, isLoading }: LogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="py-8 text-center border rounded-md">
        <p className="text-muted-foreground">No logs found</p>
      </div>
    );
  }

  const getBadgeColor = (action: string) => {
    if (action.includes("failed") || action.includes("error")) return "destructive";
    if (action.includes("warning") || action.includes("alert")) return "warning";
    return "secondary";
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow
              key={log.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedLog(log)}
            >
              <TableCell className="font-mono">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeColor(log.action)}>
                  {log.action.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>{log.entity_type}</TableCell>
              <TableCell className="truncate max-w-xs">
                {log.details ? JSON.stringify(log.details).substring(0, 50) + "..." : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLog?.action.replace(/_/g, " ")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                <p className="text-sm">
                  {selectedLog && new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Entity</h4>
                <p className="text-sm">
                  {selectedLog?.entity_type} {selectedLog?.entity_id ? `(${selectedLog.entity_id})` : ""}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Details</h4>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                {selectedLog && JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
