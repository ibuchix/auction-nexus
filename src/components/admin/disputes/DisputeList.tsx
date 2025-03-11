
import { Dispute } from "@/types/disputes";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DisputeListProps {
  disputes: Dispute[];
  isLoading: boolean;
  onViewDetail: (dispute: Dispute) => void;
}

export function DisputeList({ disputes, isLoading, onViewDetail }: DisputeListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Open</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Payment</Badge>;
      case 'vehicle_condition':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vehicle Condition</Badge>;
      case 'listing_accuracy':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Listing Accuracy</Badge>;
      case 'auction_process':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Auction Process</Badge>;
      case 'other':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Other</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No disputes found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell className="font-medium">{dispute.title}</TableCell>
              <TableCell>{getTypeBadge(dispute.type)}</TableCell>
              <TableCell>{getStatusBadge(dispute.status)}</TableCell>
              <TableCell>{dispute.submitted_by?.full_name || "Unknown"}</TableCell>
              <TableCell>{dispute.assigned_to?.full_name || "Unassigned"}</TableCell>
              <TableCell>
                {formatDistance(new Date(dispute.created_at), new Date(), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewDetail(dispute)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
