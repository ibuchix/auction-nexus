import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShieldCheck, AlertTriangle, Gavel, CheckCircle2, 
  ArrowRight, Activity, MessageSquare, TrendingUp,
  Megaphone, Settings, FileText, LogIn
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Auction Monitoring */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Auction Monitoring</CardTitle>
              <Gavel className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor active auctions and their performance
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/auctions/monitor')}
                >
                  View Auctions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Dispute Resolution</CardTitle>
              <MessageSquare className="h-6 w-6 text-yellow-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Handle user disputes and claims
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/disputes')}
                >
                  View Disputes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Analytics</CardTitle>
              <TrendingUp className="h-6 w-6 text-green-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View auction performance metrics
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Announcements</CardTitle>
              <Megaphone className="h-6 w-6 text-blue-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage system-wide announcements
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/announcements')}
                >
                  Manage Announcements
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Detection */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Fraud Detection</CardTitle>
              <ShieldCheck className="h-6 w-6 text-red-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor and manage suspicious activities
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/fraud')}
                >
                  View Alerts
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Compliance</CardTitle>
              <FileText className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access compliance reports and tools
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/compliance')}
                >
                  View Reports
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Audit Logs</CardTitle>
              <LogIn className="h-6 w-6 text-gray-500 transition-transform group-hover:scale-110" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View user activity and system logs
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => navigate('/admin/audit-logs')}
                >
                  View Logs
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