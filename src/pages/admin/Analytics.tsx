
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
      <div className="space-y-6">
        <AnalyticsHeader 
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={() => refetch()}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <StatsOverview
              totalAuctions={totals.totalAuctions}
              totalSold={totals.totalSold}
              totalValue={totals.totalValue}
              averageSalePrice={averageSalePrice}
            />

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <SalesVolumeChart data={summaries || []} />
              <PriceTrendChart data={summaries || []} />
            </div>

            <SummaryTable data={summaries || []} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
