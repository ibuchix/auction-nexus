import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { MetricsSnapshot } from "@/hooks/useMetricsData";
import { format } from "date-fns";

const chartConfig = {
  total_listings: { label: "Listings", color: "hsl(var(--primary))" },
  total_bids: { label: "Bids", color: "hsl(var(--destructive))" },
};

export function SupplyDemandChart({ data }: { data: MetricsSnapshot[] }) {
  if (data.length === 0) {
    return <EmptyChart message="No snapshot data yet. First weekly snapshot will appear next Monday." />;
  }

  const chartData = data.map((d) => ({
    ...d,
    date: format(new Date(d.snapshot_date), "MMM d"),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="total_listings" stroke="var(--color-total_listings)" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="total_bids" stroke="var(--color-total_bids)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
      {message}
    </div>
  );
}
