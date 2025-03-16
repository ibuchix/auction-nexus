
import { StatCard } from "@/components/StatCard";
import { CalendarIcon, DollarSign, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  totalAuctions: number;
  totalSold: number;
  totalValue: number;
  averageSalePrice: number;
}

export function StatsOverview({ totalAuctions, totalSold, totalValue, averageSalePrice }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Auctions"
        value={totalAuctions}
        icon={CalendarIcon}
      />
      <StatCard
        title="Vehicles Sold"
        value={Number(totalSold)}
        icon={CalendarIcon}
        trend={{
          value: Number(((totalSold) / (totalAuctions || 1) * 100).toFixed(1)),
          isPositive: true
        }}
      />
      <StatCard
        title="Total Value"
        value={`$${(totalValue).toLocaleString()}`}
        icon={DollarSign}
      />
      <StatCard
        title="Average Sale Price"
        value={`$${averageSalePrice.toLocaleString()}`}
        icon={TrendingUp}
      />
    </div>
  );
}
