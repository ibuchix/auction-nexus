import { StatCard } from "@/components/StatCard";
import { CalendarIcon, DollarSign, TrendingUp, BarChart2 } from "lucide-react";

export interface StatsOverviewProps {
  stats: {
    totalAuctions: number;
    totalSold: number;
    totalUnsold: number;
    totalValue: number;
    averagePrice: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
        <StatCard
          title="Total Auctions"
          value={stats.totalAuctions}
          icon={CalendarIcon}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <StatCard
          title="Vehicles Sold"
          value={Number(stats.totalSold)}
          icon={BarChart2}
          trend={{
            value: Number(((stats.totalSold) / (stats.totalAuctions || 1) * 100).toFixed(1)),
            isPositive: true
          }}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <StatCard
          title="Total Value"
          value={`$${(stats.totalValue).toLocaleString()}`}
          icon={DollarSign}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        <StatCard
          title="Average Sale Price"
          value={`$${stats.averagePrice.toLocaleString()}`}
          icon={TrendingUp}
          className="card-hover"
        />
      </div>
    </div>
  );
}
