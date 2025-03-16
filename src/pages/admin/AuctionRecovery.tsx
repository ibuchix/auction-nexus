
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RefreshCcw, Search, Shield, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AuctionOperationsLogView } from "@/components/admin/audit-logs/AuctionOperationsLogView";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/auction-management/StatusBadge";

interface RecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  onRecover: (auctionId: string, action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids') => Promise<void>;
}

function RecoveryDialog({ isOpen, onClose, auctionId, onRecover }: RecoveryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: auction, isLoading: isLoadingAuction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      if (!auctionId) return null;
      
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', auctionId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!auctionId
  });
  
  const handleRecover = async (action: 'reset' | 'force_complete' | 'force_start' | 'reset_bids') => {
    try {
      setIsLoading(true);
      await onRecover(auctionId, action);
      onClose();
      toast({
        title: "Recovery Successful",
        description: `The auction was successfully recovered with action: ${action}`
      });
    } catch (error) {
      console.error('Error recovering auction:', error);
      toast({
        title: "Recovery Failed",
        description: "There was an error recovering the auction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recover Auction</DialogTitle>
          <DialogDescription>
            Choose a recovery action for auction ID: {auctionId}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingAuction ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : auction ? (
          <div className="py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Title: <span className="font-normal">{auction.title || 'Untitled'}</span></p>
              <p className="text-sm font-medium">Current Status: <span className="font-normal"><StatusBadge status={auction.auction_status || 'unknown'} /></span></p>
              <p className="text-sm font-medium">Current Bid: <span className="font-normal">{auction.current_bid || 0}</span></p>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Auction Not Found</AlertTitle>
            <AlertDescription>This auction ID could not be found.</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-2">
          <Button 
            onClick={() => handleRecover('reset')} 
            disabled={isLoading || !auction} 
            variant="outline"
          >
            Reset to Ready State
          </Button>
          <Button 
            onClick={() => handleRecover('force_complete')} 
            disabled={isLoading || !auction || auction?.auction_status !== 'active'} 
            variant="outline"
          >
            Force Complete Auction
          </Button>
          <Button 
            onClick={() => handleRecover('force_start')} 
            disabled={isLoading || !auction || auction?.auction_status === 'active'} 
            variant="outline"
          >
            Force Start Auction
          </Button>
          <Button 
            onClick={() => handleRecover('reset_bids')} 
            disabled={isLoading || !auction} 
            variant="outline"
            className="text-yellow-600 hover:text-yellow-700"
          >
            Reset All Bids (Caution)
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const AuctionRecovery = () => {
  const { toast } = useToast();
  const { recoverAuction, resetSystemState } = useAuctionOperations();
  const [auctionId, setAuctionId] = useState("");
  const [searchAuctionId, setSearchAuctionId] = useState("");
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset the entire auction system? This will attempt to fix all inconsistencies and should only be used in emergency situations.")) {
      try {
        setIsResetting(true);
        await resetSystemState();
        toast({
          title: "System Reset Complete",
          description: "The auction system has been reset successfully."
        });
      } catch (error) {
        console.error('Error resetting system:', error);
        toast({
          title: "System Reset Failed",
          description: "There was an error resetting the auction system.",
          variant: "destructive"
        });
      } finally {
        setIsResetting(false);
      }
    }
  };
  
  const handleSearchAuction = () => {
    if (searchAuctionId.trim()) {
      setAuctionId(searchAuctionId.trim());
      setShowRecoveryDialog(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Auction Recovery & Operations
        </h1>
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <ShieldAlert className="h-5 w-5" />
                Auction Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Recover a specific auction that is stuck or in an inconsistent state.
              </p>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter auction ID" 
                  value={searchAuctionId} 
                  onChange={(e) => setSearchAuctionId(e.target.value)} 
                />
                <Button onClick={handleSearchAuction} disabled={!searchAuctionId.trim()}>
                  Recover
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                Emergency System Reset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Reset the entire auction system to fix all inconsistencies. Use only in emergency situations.
              </p>
              
              <Button 
                variant="destructive" 
                onClick={handleReset} 
                disabled={isResetting}
                className="w-full"
              >
                {isResetting ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Resetting System...
                  </>
                ) : (
                  <>Reset Auction System</>
                )}
              </Button>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-red-700">
                Warning: This will fix all stuck auctions and schedules.
              </p>
            </CardFooter>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Search className="h-5 w-5" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View all system operations and audit logs to identify issues.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('audit-logs')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-8" />
        
        <div id="audit-logs">
          <AuctionOperationsLogView />
        </div>
      </div>
      
      <RecoveryDialog 
        isOpen={showRecoveryDialog}
        onClose={() => setShowRecoveryDialog(false)}
        auctionId={auctionId}
        onRecover={recoverAuction}
      />
    </DashboardLayout>
  );
};

export default AuctionRecovery;
