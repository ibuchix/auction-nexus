import { ValuationStatsCard } from "@/components/admin/dashboard/ValuationStatsCard";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const ValuationStats = () => {
  return (
    <div className="space-y-6 mx-auto max-w-4xl">
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-4 rounded-lg shadow-sm">
        <DashboardHeader title="Valuation Statistics" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValuationStatsCard />
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              About Valuation Checks
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              This dashboard tracks the number of vehicle valuation checks performed by sellers on the platform.
            </p>
            <p>
              Each check represents a seller querying the valuation system to get an estimated price for their vehicle before listing.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Data refreshes automatically every 30 seconds</li>
              <li>Shows the last 7 days of activity</li>
              <li>Today's count updates in real-time</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValuationStats;
