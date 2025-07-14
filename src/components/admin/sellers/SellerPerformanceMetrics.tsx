
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { 
  TrendingUp, ShoppingBag, BadgeCheck, BarChart, 
  DollarSign, Clock, Award, AlertTriangle 
} from "lucide-react";
import { 
  Card, CardHeader, CardTitle, CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerPerformanceMetricsProps {
  sellerId: string;
}

export function SellerPerformanceMetrics({ sellerId }: SellerPerformanceMetricsProps) {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'year'>('all');
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['sellerPerformanceMetrics', sellerId, timeframe],
    queryFn: async () => {
      // For now, return mock data since seller_performance_metrics doesn't exist
      // This will be replaced when the actual table/view is created
      return {
        total_listings: 0,
        active_listings: 0,
        sold_listings: 0,
        listing_approval_rate: 0,
        total_earnings: 0,
        highest_price_sold: 0,
        average_price: 0,
        average_time_to_sell: null,
        reserve_price_met_rate: 0,
        last_listing_date: null,
        last_sale_date: null,
        cancelled_listings: 0
      };
    },
    enabled: !!sellerId,
  });

  // Function to format currency values
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Function to format percentage values
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  // Format the average time to sell
  const formatAverageTime = (interval: string | null | undefined) => {
    if (!interval) return "N/A";
    
    // Simple parsing of PostgreSQL interval format
    const days = interval.match(/(\d+) days?/)?.[1];
    const hours = interval.match(/(\d+):(\d+):(\d+)/)?.[1];
    
    if (days && parseInt(days) > 0) {
      return `${days} day${parseInt(days) > 1 ? 's' : ''}`;
    } else if (hours && parseInt(hours) > 0) {
      return `${hours} hour${parseInt(hours) > 1 ? 's' : ''}`;
    } else {
      return "< 1 hour";
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-500">Error loading seller performance metrics: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No performance metrics available for this seller.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate the success rate (sold listings / total listings)
  const successRate = metrics.total_listings > 0 
    ? metrics.sold_listings / metrics.total_listings 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Seller Performance</h2>
        <div className="flex space-x-2">
          <Badge 
            className={`cursor-pointer ${timeframe === 'all' ? 'bg-primary' : 'bg-secondary'}`}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Badge>
          <Badge 
            className={`cursor-pointer ${timeframe === 'year' ? 'bg-primary' : 'bg-secondary'}`}
            onClick={() => setTimeframe('year')}
          >
            This Year
          </Badge>
          <Badge 
            className={`cursor-pointer ${timeframe === 'month' ? 'bg-primary' : 'bg-secondary'}`}
            onClick={() => setTimeframe('month')}
          >
            This Month
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <StatCard 
          title="Total Listings" 
          value={metrics.total_listings || 0} 
          icon={ShoppingBag}
        />
        <StatCard 
          title="Active Listings" 
          value={metrics.active_listings || 0} 
          icon={AlertTriangle}
        />
        <StatCard 
          title="Sold Listings" 
          value={metrics.sold_listings || 0} 
          icon={BadgeCheck}
          trend={metrics.total_listings > 0 ? {
            value: parseFloat((successRate * 100).toFixed(1)),
            isPositive: successRate >= 0.5
          } : undefined}
        />
        <StatCard 
          title="Approval Rate" 
          value={formatPercentage(metrics.listing_approval_rate) || "N/A"} 
          icon={Award}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(metrics.total_earnings) || "$0"} 
          icon={DollarSign}
        />
        <StatCard 
          title="Highest Sale" 
          value={formatCurrency(metrics.highest_price_sold) || "$0"} 
          icon={TrendingUp}
        />
        <StatCard 
          title="Average Sale Price" 
          value={formatCurrency(metrics.average_price) || "$0"} 
          icon={BarChart}
        />
        <StatCard 
          title="Avg Time to Sell" 
          value={formatAverageTime(metrics.average_time_to_sell as unknown as string) || "N/A"} 
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-medium">{formatPercentage(successRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve Price Met Rate:</span>
              <span className="font-medium">{formatPercentage(metrics.reserve_price_met_rate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Listing:</span>
              <span className="font-medium">
                {metrics.last_listing_date 
                  ? new Date(metrics.last_listing_date).toLocaleDateString() 
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sale:</span>
              <span className="font-medium">
                {metrics.last_sale_date 
                  ? new Date(metrics.last_sale_date).toLocaleDateString() 
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cancelled Listings:</span>
              <span className="font-medium">{metrics.cancelled_listings || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
