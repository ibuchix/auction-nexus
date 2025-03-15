
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data, error } = await supabase.functions.invoke('process-proxy-bids');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: data.message || "Proxy bids processed",
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
        description: data.message || "Scheduled auctions started",
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
      <Button onClick={handleManualAuctionClose}>
        Close Ended Auctions
      </Button>
      <Button onClick={handleProcessProxyBids} variant="outline">
        Process Proxy Bids
      </Button>
      <Button onClick={handleStartScheduledAuctions} variant="secondary">
        Start Scheduled Auctions
      </Button>
    </div>
  );
}
