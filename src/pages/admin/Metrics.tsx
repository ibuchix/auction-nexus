import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMetricsData } from "@/hooks/useMetricsData";
import { MetricCard } from "@/components/admin/metrics/MetricCard";
import { SupplyDemandChart } from "@/components/admin/metrics/SupplyDemandChart";
import { EngagementConversionChart } from "@/components/admin/metrics/EngagementConversionChart";
import { CampaignTrackingTab } from "@/components/admin/campaign-tracking/CampaignTrackingTab";
import { BarChart3, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function Metrics() {
  const { live, history, isLoading, error } = useMetricsData();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Metrics</h1>
          <p className="text-muted-foreground">Error loading metrics. Please try again.</p>
        </div>
      </div>
    );
  }

  const lastSnapshot = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Metrics</h1>
          <p className="text-muted-foreground">
            Source of truth for all platform KPIs — live values with weekly snapshots
          </p>
        </div>
        {lastSnapshot && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            Last snapshot: {format(new Date(lastSnapshot.snapshot_date), "MMM d, yyyy")}
          </div>
        )}
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList>
          <TabsTrigger value="kpis">Platform KPIs</TabsTrigger>
          <TabsTrigger value="tracking">Campaign Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-6">
          {/* 8 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : live ? (
              <>
                <MetricCard title="Total Listings" value={live.total_listings} previousValue={lastSnapshot?.total_listings} format="number" description="Active auction schedules" />
                <MetricCard title="Total Bids" value={live.total_bids} previousValue={lastSnapshot?.total_bids} format="number" description="Bids on active listings" />
                <MetricCard title="Active Dealers (7d)" value={live.active_dealers_7d} previousValue={lastSnapshot?.active_dealers_7d} format="number" description={`of ${live.total_approved_dealers} approved`} />
                <MetricCard title="Dealer Activation" value={live.dealer_activation_rate} previousValue={lastSnapshot?.dealer_activation_rate} format="percent" description="Active / approved dealers" />
                <MetricCard title="Avg Bids / Listing" value={live.avg_bids_per_listing} previousValue={lastSnapshot?.avg_bids_per_listing} format="decimal" description="Liquidity density" />
                <MetricCard title="Listings with 2+ Bids" value={live.pct_listings_2plus_bids} previousValue={lastSnapshot?.pct_listings_2plus_bids} format="percent" description="Auction competitiveness" />
                <MetricCard title="Seller Acceptance" value={live.seller_acceptance_rate} previousValue={lastSnapshot?.seller_acceptance_rate} format="percent" description="Accepted / decided" />
                <MetricCard title="Sell-through Rate" value={live.sell_through_rate} previousValue={lastSnapshot?.sell_through_rate} format="percent" description="Sold / total results" />
              </>
            ) : null}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Supply & Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[250px] w-full" /> : <SupplyDemandChart data={history} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Engagement & Conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[250px] w-full" /> : <EngagementConversionChart data={history} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <CampaignTrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
