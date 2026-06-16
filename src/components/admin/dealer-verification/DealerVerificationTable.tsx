
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
import { useDealerPresenceMonitor } from "@/hooks/useDealerPresenceMonitor";
import { DealerActivityBadge } from "./components/DealerActivityBadge";

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
  const { getDealerActivityStatus } = useDealerPresenceMonitor();
  
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

  const getSubscriptionBadge = (dealer: DealerData) => {
    const status = dealer.subscriptionStatus;
    if (!status) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Not subscribed</Badge>;
    }
    const isActive = status === 'active' || status === 'trialing';
    if (isActive) {
      const label = status === 'trialing' ? 'Trialing' : 'Subscribed';
      const cancelling = dealer.subscriptionCancelAtPeriodEnd;
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {label}{cancelling ? ' (cancelling)' : ''}
        </Badge>
      );
    }
    if (status === 'past_due' || status === 'unpaid') {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Past due</Badge>;
    }
    if (status === 'canceled' || status === 'cancelled') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Canceled</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">{status}</Badge>;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dealership</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tax ID</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Activity</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dealers?.length ? (
          dealers.map((dealer) => (
            <TableRow key={dealer.id}>
              <TableCell className="font-medium">
                {dealer.dealershipName || 'N/A'}
              </TableCell>
              <TableCell>
                {dealer.supervisorName || 'N/A'}
              </TableCell>
              <TableCell>
                {dealer.email || 'N/A'}
              </TableCell>
              <TableCell>
                {dealer.taxId || 'N/A'}
              </TableCell>
              <TableCell>
                {formatDate(dealer.createdAt)}
              </TableCell>
              <TableCell>{getStatusBadge(dealer.verification_status)}</TableCell>
              <TableCell>
                <DealerActivityBadge {...getDealerActivityStatus(dealer.userId)} />
              </TableCell>
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
            <TableCell colSpan={9} className="text-center py-4">
              No {activeTab === "all" ? "" : activeTab} dealers found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
};
