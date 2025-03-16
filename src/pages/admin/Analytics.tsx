
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { StatsOverview } from "@/components/analytics/StatsOverview";
import { SalesVolumeChart } from "@/components/analytics/SalesVolumeChart";
import { PriceTrendChart } from "@/components/analytics/PriceTrendChart";
import { SummaryTable } from "@/components/analytics/SummaryTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { summaries, isLoading, refetch, totals, averageSalePrice } = useAnalyticsData(dateRange);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(`${!isDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 min-h-screen pb-10`}>
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-sm transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <AnalyticsHeader 
              dateRange={dateRange}
              setDateRange={setDateRange}
              onRefresh={() => refetch()}
            />
            <Toggle 
              pressed={isDarkMode} 
              onPressedChange={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="ml-2"
            >
              {isDarkMode ? 
                <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" /> : 
                <Sun className="h-5 w-5 transition-transform duration-300 rotate-90" />
              }
            </Toggle>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-white' : 'border-primary'}`}></div>
          </div>
        ) : (
          <div className="grid gap-6 animate-fade-in">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-sm transition-colors duration-300 transform hover:shadow-md hover:translate-y-[-2px]`}>
              <StatsOverview
                totalAuctions={totals.totalAuctions}
                totalSold={totals.totalSold}
                totalValue={totals.totalValue}
                averageSalePrice={averageSalePrice}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-sm h-full transition-colors duration-300 transform hover:shadow-md hover:translate-y-[-2px]`}>
                <h2 className="text-xl font-semibold mb-4 text-primary">Sales Volume Trend</h2>
                <div className="h-[350px]">
                  <SalesVolumeChart data={summaries || []} />
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-sm h-full transition-colors duration-300 transform hover:shadow-md hover:translate-y-[-2px]`}>
                <h2 className="text-xl font-semibold mb-4 text-primary">Price Trend Analysis</h2>
                <div className="h-[350px]">
                  <PriceTrendChart data={summaries || []} />
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-sm transition-colors duration-300 transform hover:shadow-md hover:translate-y-[-2px]`}>
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
