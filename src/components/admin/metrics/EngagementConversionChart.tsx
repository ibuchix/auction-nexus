import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { MetricsSnapshot } from "@/hooks/useMetricsData";
import { format } from "date-fns";

const chartConfig = {
  dealer_activation_rate: { label: "Dealer Activation %", color: "hsl(var(--primary))" },
  seller_acceptance_rate: { label: "Seller Acceptance %", color: "hsl(210 80% 50%)" },
  sell_through_rate: { label: "Sell-through %", color: "hsl(150 60% 40%)" },
};

export function EngagementConversionChart({ data }: { data: MetricsSnapshot[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
        No snapshot data yet. First weekly snapshot will appear next Monday.
      </div>
    );
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
        <YAxis domain={[0, 100]} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="dealer_activation_rate" stroke="var(--color-dealer_activation_rate)" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="seller_acceptance_rate" stroke="var(--color-seller_acceptance_rate)" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="sell_through_rate" stroke="var(--color-sell_through_rate)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  );
}
