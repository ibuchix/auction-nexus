
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function AdminActions() {
  const { toast } = useToast();

  const handleManualAuctionClose = async () => {
    try {
      const { error } = await supabase.rpc('close_ended_auctions');
      if (error) throw error;
      toast({
        title: "Success",
        description: "Manual auction closing completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close auctions",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleManualAuctionClose}>
      Manual Auction Close
    </Button>
  );
}
