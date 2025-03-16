
import { StatCard } from "@/components/StatCard";
import { CalendarIcon, DollarSign, TrendingUp, BarChart2 } from "lucide-react";

interface StatsOverviewProps {
  totalAuctions: number;
  totalSold: number;
  totalValue: number;
  averageSalePrice: number;
}

export function StatsOverview({ totalAuctions, totalSold, totalValue, averageSalePrice }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
        <StatCard
          title="Total Auctions"
          value={totalAuctions}
          icon={CalendarIcon}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <StatCard
          title="Vehicles Sold"
          value={Number(totalSold)}
          icon={BarChart2}
          trend={{
            value: Number(((totalSold) / (totalAuctions || 1) * 100).toFixed(1)),
            isPositive: true
          }}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <StatCard
          title="Total Value"
          value={`$${(totalValue).toLocaleString()}`}
          icon={DollarSign}
          className="card-hover"
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        <StatCard
          title="Average Sale Price"
          value={`$${averageSalePrice.toLocaleString()}`}
          icon={TrendingUp}
          className="card-hover"
        />
      </div>
    </div>
  );
}
