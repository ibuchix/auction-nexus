
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  ShieldCheck, 
  XCircle,
  Phone,
  Building,
  FileText,
  CreditCard,
  MapPin,
  User
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define a type for verification status
type VerificationStatus = "pending" | "approved" | "rejected";

interface DealerData {
  id: string;
  supervisor_name: string;
  dealership_name: string;
  tax_id: string;
  business_registry_number: string;
  address: string;
  license_number: string;
  verification_status: VerificationStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const DealerVerification = () => {
  const [selectedDealer, setSelectedDealer] = useState<DealerData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<VerificationStatus | "all">("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: dealers, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['dealersList', activeTab],
    queryFn: async () => {
      try {
        // Fetch all dealers directly from the dealers table
        let query = adminSupabase
          .from('dealers')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Apply filter if not showing all dealers
        if (activeTab !== "all") {
          query = query.eq('verification_status', activeTab);
        }
        
        const { data: dealersData, error: dealersError } = await query;

        if (dealersError) throw dealersError;
        
        // Type-safe dealers data with proper verification status type
        const typedDealers: DealerData[] = dealersData.map(dealer => ({
          ...dealer,
          verification_status: dealer.verification_status as VerificationStatus
        }));
        
        return typedDealers;
      } catch (error) {
        console.error('Error fetching dealers:', error);
        toast.error('Failed to load dealers');
        return [];
      }
    }
  });

  const handleApproveDealer = async () => {
    if (!selectedDealer) return;
    
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      // Call the RPC function to verify the dealer
      const { data, error } = await adminSupabase.rpc(
        'verify_dealer',
        { 
          p_dealer_id: selectedDealer.id,
          p_admin_id: user.id,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success(`${selectedDealer.dealership_name} has been approved`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setAdminNotes("");
      refetch();
    } catch (error) {
      console.error('Error approving dealer:', error);
      toast.error('Failed to approve dealer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDealer = async () => {
    if (!selectedDealer || !rejectionReason) return;
    
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      // Call the RPC function to reject the dealer
      const { data, error } = await adminSupabase.rpc(
        'reject_dealer',
        { 
          p_dealer_id: selectedDealer.id,
          p_admin_id: user.id,
          p_rejection_reason: rejectionReason,
          p_notes: adminNotes
        }
      );
      
      if (error) throw error;
      
      toast.success(`${selectedDealer.dealership_name} has been rejected`);
      setIsReviewOpen(false);
      setSelectedDealer(null);
      setRejectionReason("");
      setAdminNotes("");
      refetch();
    } catch (error) {
      console.error('Error rejecting dealer:', error);
      toast.error('Failed to reject dealer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async (dealer: DealerData, newStatus: boolean) => {
    setIsProcessing(true);
    
    try {
      // Get the admin's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated as admin');
      
      if (newStatus) {
        // Approve
        const { data, error } = await adminSupabase.rpc(
          'verify_dealer',
          { 
            p_dealer_id: dealer.id,
            p_admin_id: user.id,
            p_notes: "Quick verification via toggle switch"
          }
        );
        
        if (error) throw error;
        toast.success(`${dealer.dealership_name} has been approved`);
      } else {
        // Reject
        const { data, error } = await adminSupabase.rpc(
          'reject_dealer',
          { 
            p_dealer_id: dealer.id,
            p_admin_id: user.id,
            p_rejection_reason: "Verification revoked",
            p_notes: "Quick rejection via toggle switch"
          }
        );
        
        if (error) throw error;
        toast.success(`${dealer.dealership_name} verification has been revoked`);
      }
      
      refetch();
    } catch (error) {
      console.error('Error toggling dealer verification:', error);
      toast.error('Failed to update dealer verification status');
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dealer Verification</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => refetch()}>
              <Loader2 className="h-4 w-4" />
              Refresh
            </Button>
            {activeTab === "pending" && (
              <Button className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Pending <Badge variant="secondary" className="ml-1">{dealers?.filter(d => d.verification_status === 'pending').length || 0}</Badge>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as VerificationStatus | "all")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              All Dealers
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all" ? "All Dealers" :
                   activeTab === "pending" ? "Pending Verifications" : 
                   activeTab === "approved" ? "Approved Dealers" : "Rejected Applications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                                      onCheckedChange={(checked) => handleToggleVerification(dealer, checked)}
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
                              onClick={() => {
                                setSelectedDealer(dealer);
                                setIsReviewOpen(true);
                                // Initialize rejection reason if dealer was previously rejected
                                setRejectionReason(dealer.verification_status === 'rejected' ? "Verification revoked" : "");
                                setAdminNotes("");
                              }}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedDealer && (
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Dealer Verification Review</DialogTitle>
              <DialogDescription>
                Review dealer information and approve or reject the application
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dealership Information</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      {selectedDealer.dealership_name}
                    </p>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {selectedDealer.address}
                    </p>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Tax ID: {selectedDealer.tax_id}
                    </p>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Business Registry: {selectedDealer.business_registry_number}
                    </p>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      License Number: {selectedDealer.license_number}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      {selectedDealer.supervisor_name}
                    </p>
                  </div>
                </div>

                {selectedDealer.verification_status === 'rejected' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                    <div className="mt-2 bg-red-50 p-3 rounded-md">
                      <p className="text-sm text-red-700">Verification was rejected</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quick Verification</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <Switch 
                      checked={selectedDealer.verification_status === 'approved'}
                      onCheckedChange={(checked) => {
                        handleToggleVerification(selectedDealer, checked);
                        setIsReviewOpen(false);
                      }}
                      disabled={isProcessing}
                    />
                    <span>
                      {selectedDealer.verification_status === 'approved' 
                        ? 'Verified' 
                        : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                  <div className="mt-2">
                    {getStatusBadge(selectedDealer.verification_status)}
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted on {new Date(selectedDealer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Admin Notes</h3>
                  <Textarea 
                    value={adminNotes} 
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this verification"
                    className="mt-2"
                    disabled={selectedDealer.verification_status !== 'pending'}
                  />
                </div>

                {selectedDealer.verification_status === 'pending' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                    <Textarea 
                      value={rejectionReason} 
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Required if rejecting the application"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2 justify-end w-full">
                <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                  Close
                </Button>
                
                {selectedDealer.verification_status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={handleRejectDealer}
                      disabled={isProcessing || !rejectionReason}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Reject
                    </Button>
                    <Button 
                      onClick={handleApproveDealer}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default DealerVerification;
