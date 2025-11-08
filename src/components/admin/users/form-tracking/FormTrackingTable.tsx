import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormTrackingLog } from "./types";

interface FormTrackingTableProps {
  logs: FormTrackingLog[] | undefined;
}

export function FormTrackingTable({ logs }: FormTrackingTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Form Type</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Page</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {log.user_full_name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.user_email || "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {log.details?.form_type || "-"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {log.details?.event_type || "-"}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">
                {log.details?.source || "-"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                {log.details?.page || "-"}
              </TableCell>
            </TableRow>
          ))}
          {logs?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No form tracking logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
