import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, Gavel, DollarSign, TrendingUp, Search, PlusCircle, Settings, ShieldCheck, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const { data: sellerCount } = useQuery({
    queryKey: ['sellerCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');
      return count || 0;
    }
  });

  const { data: activeAuctions } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: async () => {
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('is_auction', true)
        .eq('auction_status', 'active');
      return count || 0;
    }
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('auction_results')
        .select('final_price')
        .gte('created_at', startOfMonth.toISOString());

      const total = (data || []).reduce((sum, result) => sum + (result.final_price || 0), 0);
      return total;
    }
  });

  const { data: successRate } = useQuery({
    queryKey: ['successRate'],
    queryFn: async () => {
      const { data: results } = await supabase
        .from('auction_results')
        .select('*');

      if (!results?.length) return 0;

      const successful = results.filter(result => result.final_price >= (result.reserve_price || 0)).length;
      return Math.round((successful / results.length) * 100);
    }
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn: async () => {
      const { count } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');
      return count || 0;
    }
  });

  const { data: suspiciousActivities } = useQuery({
    queryKey: ['suspiciousActivities'],
    queryFn: async () => {
      const { count } = await supabase
        .from('bid_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('success', false);
      return count || 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAdminClick = () => {
    toast({
      title: "Admin Features Available",
      description: "You can now access dealer verification, suspicious activity monitoring, auction management, and bid validation from the admin dashboard.",
      duration: 5000,
    });
    navigate('/admin');
  };

  return (
    <DashboardLayout>
      {/* Decorative background pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
              Dashboard
            </h1>
            <p className="text-gray-500">{formatDate(currentTime)}</p>
          </div>
          
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform group-hover:scale-110" />
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-[300px] transition-all duration-300 border-gray-200 focus:border-primary hover:border-gray-300"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                className="shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                New Auction
              </Button>
              <Button 
                variant="outline" 
                className="shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 relative"
                onClick={handleAdminClick}
              >
                <ShieldCheck className="mr-2 h-4 w-4 transition-transform hover:rotate-12" />
                Admin
                {(pendingVerifications || suspiciousActivities) ? (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {(pendingVerifications || 0) + (suspiciousActivities || 0)}
                  </span>
                ) : null}
              </Button>
              <Button 
                variant="outline" 
                className="shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50"
              >
                <Settings className="mr-2 h-4 w-4 transition-transform hover:rotate-90" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <StatCard
              title="Total Sellers"
              value={sellerCount?.toString() || "0"}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <StatCard
              title="Active Auctions"
              value={activeAuctions?.toString() || "0"}
              icon={Gavel}
              trend={{ value: 8, isPositive: true }}
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(monthlyRevenue || 0)}
              icon={DollarSign}
              trend={{ value: 5, isPositive: true }}
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <StatCard
              title="Success Rate"
              value={`${successRate || 0}%`}
              icon={TrendingUp}
              trend={{ value: 3, isPositive: true }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pending Verifications
              </span>
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{pendingVerifications || 0}</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                View All
              </Button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Recent Auctions Closed
              </span>
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{activeAuctions || 0}</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Manage
              </Button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Suspicious Activities
              </span>
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{suspiciousActivities || 0}</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Investigate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
