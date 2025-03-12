
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { DealerData, VerificationStatus } from "./types";

interface DealerVerificationTableProps {
  dealers: DealerData[] | undefined;
  isProcessing: boolean;
  onToggleVerification: (dealer: DealerData, newStatus: boolean) => Promise<void>;
  onReviewDealer: (dealer: DealerData) => void;
  activeTab: VerificationStatus | "all";
}

export const DealerVerificationTable = ({
  dealers,
  isProcessing,
  onToggleVerification,
  onReviewDealer,
  activeTab
}: DealerVerificationTableProps) => {
  
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dealership</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dealers?.length ? (
          dealers.map((dealer) => (
            <TableRow key={dealer.id}>
              <TableCell className="font-medium">{dealer.dealership_name}</TableCell>
              <TableCell>{dealer.supervisor_name}</TableCell>
              <TableCell>{new Date(dealer.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(dealer.verification_status)}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Switch 
                          checked={dealer.verification_status === 'approved'}
                          onCheckedChange={(checked) => onToggleVerification(dealer, checked)}
                          disabled={isProcessing}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {dealer.verification_status === 'approved' 
                        ? 'Click to revoke verification' 
                        : 'Click to verify dealer'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  onClick={() => onReviewDealer(dealer)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No {activeTab === "all" ? "" : activeTab} dealers found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
