import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useValuationStats } from "@/hooks/useValuationStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ValuationStatsCard = () => {
  const { stats, todayCount, weekTotal, isLoading, error, refetch } = useValuationStats();

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Valuation Checks Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load valuation stats</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Valuation Checks (Last 7 Days)
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <ValuationStatsSkeleton />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{todayCount}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-2xl font-bold text-foreground">{weekTotal}</p>
                </div>
                <p className="text-xs text-muted-foreground">Week Total</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [value, "Checks"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Auto-refresh indicator */}
            <p className="text-[10px] text-muted-foreground text-center">
              Auto-refreshes every 30 seconds
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ValuationStatsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
    <Skeleton className="h-[140px] w-full rounded-lg" />
  </div>
);
