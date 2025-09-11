import { format } from "date-fns";
import { Eye, Car, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ManualValuationData } from "@/hooks/useManualValuation";

interface ManualValuationTableProps {
  valuations: ManualValuationData[];
  isLoading: boolean;
  onReview: (valuation: ManualValuationData) => void;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
    case "draft":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
    case "transferred":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Transferred</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export function ManualValuationTable({ valuations, isLoading, onReview }: ManualValuationTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          Loading valuations...
        </div>
      </div>
    );
  }

  if (!valuations || valuations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No manual valuations found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {valuations.map((valuation) => (
            <TableRow key={valuation.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  {valuation.make} {valuation.model}
                </div>
              </TableCell>
              <TableCell>{valuation.year || "N/A"}</TableCell>
              <TableCell>
                {valuation.mileage ? `${valuation.mileage.toLocaleString()} km` : "N/A"}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {valuation.vin ? (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    {valuation.vin}
                  </span>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{valuation.name || "N/A"}</div>
                  {valuation.contact_email && (
                    <div className="text-muted-foreground">{valuation.contact_email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(valuation.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{valuation.images?.length || 0}</span>
                  <span className="text-xs text-muted-foreground">photos</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(valuation.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onReview(valuation)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}