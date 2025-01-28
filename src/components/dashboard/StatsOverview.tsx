import { StatCard } from "@/components/StatCard";
import { Users, Gavel, DollarSign, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  sellerCount: number;
  dealerCount: number;
  monthlyRevenue: number;
  successRate: number;
}

export function StatsOverview({
  sellerCount,
  dealerCount,
  monthlyRevenue,
  successRate,
}: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="transform hover:scale-105 transition-transform duration-300">
        <StatCard
          title="Active Sellers"
          value={sellerCount?.toString() || "0"}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
      </div>
      <div className="transform hover:scale-105 transition-transform duration-300">
        <StatCard
          title="Verified Dealers"
          value={dealerCount?.toString() || "0"}
          icon={Gavel}
          trend={{ value: 8, isPositive: true }}
        />
      </div>
      <div className="transform hover:scale-105 transition-transform duration-300">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue || 0)}
          icon={DollarSign}
          trend={{ value: 5, isPositive: true }}
        />
      </div>
      <div className="transform hover:scale-105 transition-transform duration-300">
        <StatCard
          title="Success Rate"
          value={`${successRate || 0}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>
    </div>
  );
}