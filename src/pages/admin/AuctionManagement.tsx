import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuctionManagement = () => {
  const { toast } = useToast();

  const { data: activeAuctions } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_auction', true)
        .eq('auction_status', 'active');
      
      if (error) throw error;
      return data;
    }
  });

  const handleCancelAuction = async (auctionId: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ auction_status: 'cancelled' })
      .eq('id', auctionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel auction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Auction cancelled successfully",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Management</h1>
        </div>

        <div className="grid gap-6">
          {activeAuctions?.map((auction) => (
            <Card key={auction.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{auction.title}</h2>
                  <p className="text-gray-500">ID: {auction.id}</p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => handleCancelAuction(auction.id)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel Auction
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionManagement;