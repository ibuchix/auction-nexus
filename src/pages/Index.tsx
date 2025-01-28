import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, Gavel, DollarSign, TrendingUp, Search, PlusCircle, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const Index = () => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">{formatDate(currentTime)}</p>
          </div>
          
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-[300px]"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button variant="default" className="shadow-sm">
                <PlusCircle className="mr-2" />
                New Auction
              </Button>
              <Button variant="outline" className="shadow-sm">
                <Settings className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sellers"
            value={sellerCount?.toString() || "0"}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Auctions"
            value={activeAuctions?.toString() || "0"}
            icon={Gavel}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue || 0)}
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate || 0}%`}
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Placeholder for activity feed */}
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;