
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ListingVerificationData, VerificationStatus } from "@/hooks/useListingVerification";

interface VerificationTableProps {
  verifications: ListingVerificationData[];
  isLoading: boolean;
  status: VerificationStatus;
  onReview: (listing: ListingVerificationData) => void;
}

export function VerificationTable({ verifications, isLoading, status, onReview }: VerificationTableProps) {
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading listings...</div>;
  }

  if (verifications.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No {status} listings found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {verifications.map((verification) => (
          <TableRow key={verification.id}>
            <TableCell className="font-medium">
              {verification.car.year} {verification.car.make} {verification.car.model}
            </TableCell>
            <TableCell>PLN {verification.car.reserve_price.toLocaleString()}</TableCell>
            <TableCell>{format(new Date(verification.submitted_at), "MMM d, yyyy")}</TableCell>
            <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReview(verification)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
