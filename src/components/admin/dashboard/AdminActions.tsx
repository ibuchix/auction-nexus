
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, PackageCheck, Wallet } from "lucide-react";

export function AdminActions() {
  const { toast } = useToast();

  const handleManualAuctionClose = async () => {
    try {
      toast({
        title: "Processing",
        description: "Closing ended auctions...",
      });
      
      const { data, error } = await supabase.functions.invoke('close-ended-auctions');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Processed ${data.processed?.length || 0} auctions`,
      });
    } catch (error) {
      console.error("Error closing auctions:", error);
      toast({
        title: "Error",
        description: "Failed to close auctions",
        variant: "destructive",
      });
    }
  };

  const handleProcessProxyBids = async () => {
    try {
      toast({
        title: "Processing",
        description: "Processing proxy bids...",
      });
      
      // Call the RPC function directly since we now have a cron job
      const { data, error } = await supabase.rpc('process_pending_proxy_bids');
      
      if (error) throw error;
      
      // Parse the result to access the properties
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      toast({
        title: "Success",
        description: `Processed ${result.bids_processed || 0} bids across ${result.auctions_checked || 0} auctions`,
      });
    } catch (error) {
      console.error("Error processing proxy bids:", error);
      toast({
        title: "Error",
        description: "Failed to process proxy bids",
        variant: "destructive",
      });
    }
  };

  const handleStartScheduledAuctions = async () => {
    try {
      toast({
        title: "Processing",
        description: "Starting scheduled auctions...",
      });
      
      const { data, error } = await supabase.functions.invoke('start-scheduled-auctions');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${data.result?.auctions_started || 0} auctions started`,
      });
    } catch (error) {
      console.error("Error starting scheduled auctions:", error);
      toast({
        title: "Error",
        description: "Failed to start scheduled auctions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={handleManualAuctionClose} className="flex items-center gap-2">
        <PackageCheck className="h-4 w-4" />
        <span>Close Ended Auctions</span>
      </Button>
      <Button onClick={handleProcessProxyBids} variant="outline" className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span>Process Proxy Bids</span>
      </Button>
      <Button onClick={handleStartScheduledAuctions} variant="secondary" className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4" />
        <span>Start Scheduled Auctions</span>
      </Button>
    </div>
  );
}
