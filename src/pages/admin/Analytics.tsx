
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });

  const { data: summaries, isLoading, refetch } = useQuery({
    queryKey: ['auctionSummaries', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_daily_summaries')
        .select('*')
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate totals and averages
  const totals = summaries?.reduce((acc, curr) => ({
    totalAuctions: (acc.totalAuctions || 0) + curr.total_auctions_closed,
    totalSold: (acc.totalSold || 0) + curr.sold_vehicles,
    totalUnsold: (acc.totalUnsold || 0) + curr.unsold_vehicles,
    totalValue: (acc.totalValue || 0) + curr.total_value,
    averagePrice: [...(acc.averagePrice || []), curr.average_sale_price]
  }), {} as any);

  const averageSalePrice = totals?.averagePrice?.reduce((a: number, b: number) => a + b, 0) / totals?.averagePrice?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track auction performance and trends
            </p>
          </div>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange(range);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={() => refetch()} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Auctions"
                value={totals?.totalAuctions || 0}
                icon={CalendarIcon}
              />
              <StatCard
                title="Vehicles Sold"
                value={totals?.totalSold || 0}
                trend={{
                  value: ((totals?.totalSold || 0) / (totals?.totalAuctions || 1) * 100).toFixed(1),
                  isPositive: true
                }}
              />
              <StatCard
                title="Total Value"
                value={`$${(totals?.totalValue || 0).toLocaleString()}`}
              />
              <StatCard
                title="Average Sale Price"
                value={`$${averageSalePrice.toLocaleString()}`}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Sales Volume</CardTitle>
                  <CardDescription>Number of vehicles sold per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={summaries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), "MMM dd")}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), "PP")}
                          formatter={(value: any) => [value, "Vehicles"]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sold_vehicles" 
                          name="Sold"
                          stroke="#10b981" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="unsold_vehicles" 
                          name="Unsold"
                          stroke="#ef4444" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Sale Price Trend</CardTitle>
                  <CardDescription>Daily average sale price of vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={summaries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), "MMM dd")}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), "PP")}
                          formatter={(value: any) => [`$${value.toLocaleString()}`, "Average Price"]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="average_sale_price" 
                          name="Average Price"
                          stroke="#6366f1" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
                <CardDescription>Detailed view of auction performance by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Total Auctions</th>
                        <th className="py-3 px-4 text-left">Sold</th>
                        <th className="py-3 px-4 text-left">Unsold</th>
                        <th className="py-3 px-4 text-left">Total Value</th>
                        <th className="py-3 px-4 text-left">Avg. Sale Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries?.map((summary) => (
                        <tr key={summary.date} className="border-b">
                          <td className="py-3 px-4">{format(new Date(summary.date), "PP")}</td>
                          <td className="py-3 px-4">{summary.total_auctions_closed}</td>
                          <td className="py-3 px-4">{summary.sold_vehicles}</td>
                          <td className="py-3 px-4">{summary.unsold_vehicles}</td>
                          <td className="py-3 px-4">${summary.total_value.toLocaleString()}</td>
                          <td className="py-3 px-4">${summary.average_sale_price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
