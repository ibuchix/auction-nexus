
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { PriceTrendChart } from "@/components/analytics/PriceTrendChart";
import { SalesVolumeChart } from "@/components/analytics/SalesVolumeChart";
import { SummaryTable } from "@/components/analytics/SummaryTable";
import { StatsOverview } from "@/components/analytics/StatsOverview";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsData, DateRange } from "@/hooks/useAnalyticsData";
import { addDays, addMonths, startOfMonth, endOfMonth } from "date-fns";

// Define prop interfaces for components to match their expected props
interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
  metrics: {
    totalAuctions: number;
    totalValue: number;
    averagePrice: number;
  };
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  presets: { label: string; range: DateRange }[];
}

interface StatsOverviewProps {
  stats: {
    totalAuctions: number;
    totalSold: number;
    totalUnsold: number;
    totalValue: number;
    averagePrice: number;
  };
}

interface SummaryTableProps {
  data: any[];
  loading: boolean;
}

const Analytics = () => {
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(addMonths(now, -1)),
    to: endOfMonth(now)
  });
  
  const { 
    summaries,
    isLoading,
    totals,
    averageSalePrice
  } = useAnalyticsData(dateRange);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnalyticsHeader 
          title="Auction Analytics"
          subtitle="Performance overview and metrics"
          metrics={{
            totalAuctions: totals.totalAuctions,
            totalValue: totals.totalValue,
            averagePrice: averageSalePrice
          }}
        />
        
        <DateRangeSelector
          dateRange={dateRange}
          onChange={setDateRange}
          presets={[
            { label: "Last 7 days", range: { from: addDays(now, -7), to: now } },
            { label: "Last 30 days", range: { from: addDays(now, -30), to: now } },
            { label: "This month", range: { from: startOfMonth(now), to: now } },
            { label: "Last month", range: { from: startOfMonth(addMonths(now, -1)), to: endOfMonth(addMonths(now, -1)) } },
          ]}
        />
        
        <StatsOverview
          stats={{
            totalAuctions: totals.totalAuctions,
            totalSold: totals.totalSold,
            totalUnsold: totals.totalUnsold,
            totalValue: totals.totalValue,
            averagePrice: averageSalePrice
          }}
        />
        
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceTrendChart data={summaries || []} />
              <SalesVolumeChart data={summaries || []} />
            </div>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Auction Summary Data</CardTitle>
                <CardDescription>Detailed summary of auction performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SummaryTable data={summaries || []} loading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
