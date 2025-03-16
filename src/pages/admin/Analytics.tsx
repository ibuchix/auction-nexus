
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { StatsOverview } from "@/components/analytics/StatsOverview";
import { SalesVolumeChart } from "@/components/analytics/SalesVolumeChart";
import { PriceTrendChart } from "@/components/analytics/PriceTrendChart";
import { SummaryTable } from "@/components/analytics/SummaryTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });

  const { summaries, isLoading, refetch, totals, averageSalePrice } = useAnalyticsData(dateRange);

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <AnalyticsHeader 
            dateRange={dateRange}
            setDateRange={setDateRange}
            onRefresh={() => refetch()}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <StatsOverview
                totalAuctions={totals.totalAuctions}
                totalSold={totals.totalSold}
                totalValue={totals.totalValue}
                averageSalePrice={averageSalePrice}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-4 text-primary">Sales Volume Trend</h2>
                <div className="h-[350px]">
                  <SalesVolumeChart data={summaries || []} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-4 text-primary">Price Trend Analysis</h2>
                <div className="h-[350px]">
                  <PriceTrendChart data={summaries || []} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-primary">Summary Performance</h2>
              <SummaryTable data={summaries || []} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
