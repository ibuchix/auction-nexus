import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle, Gavel, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch pending dealer verifications
  const { data: pendingDealers } = useQuery({
    queryKey: ['pendingDealers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('verification_status', 'pending');
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent suspicious activities
  const { data: suspiciousActivities } = useQuery({
    queryKey: ['suspiciousActivities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_metrics')
        .select('*')
        .eq('success', false)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent auction results
  const { data: recentAuctions } = useQuery({
    queryKey: ['recentAuctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent bid validations
  const { data: recentBids } = useQuery({
    queryKey: ['recentBids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            System Management
          </h1>
          <Button onClick={handleManualAuctionClose}>
            Manual Auction Close
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dealer Verification Card */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Dealer Verification</CardTitle>
              <ShieldCheck className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {pendingDealers?.length || 0} dealers pending verification
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/dealers')}
                >
                  View Dealers
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suspicious Activity Card */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Suspicious Activity</CardTitle>
              <AlertTriangle className="h-6 w-6 text-yellow-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {suspiciousActivities?.length || 0} recent suspicious activities detected
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/activity')}
                >
                  View Activities
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auction Management Card */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Auction Management</CardTitle>
              <Gavel className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {recentAuctions?.length || 0} recent auction closings
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/auctions')}
                >
                  View Auctions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bid Validation Card */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Bid Validation</CardTitle>
              <CheckCircle2 className="h-6 w-6 text-green-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {recentBids?.length || 0} recent bids processed
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/bids')}
                >
                  View Bids
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;