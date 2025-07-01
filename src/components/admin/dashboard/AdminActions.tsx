
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, PackageCheck } from "lucide-react";

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
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={handleManualAuctionClose} 
        className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 shadow-sm hover:shadow-md transition-all"
      >
        <PackageCheck className="h-4 w-4" />
        <span>Close Auctions</span>
      </Button>
      <Button 
        onClick={handleStartScheduledAuctions} 
        variant="secondary" 
        className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md transition-all"
      >
        <CalendarClock className="h-4 w-4" />
        <span>Start Auctions</span>
      </Button>
    </div>
  );
}
