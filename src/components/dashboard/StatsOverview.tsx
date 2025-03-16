
import { StatCard } from "@/components/StatCard";
import { Users, Gavel, DollarSign, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  sellerCount: number;
  dealerCount: number;
  monthlyRevenue: number;
  successRate: number;
  onCardClick: {
    sellers: () => void;
    dealers: () => void;
    revenue: () => void;
    success: () => void;
  };
}

export function StatsOverview({
  sellerCount,
  dealerCount,
  monthlyRevenue,
  successRate,
  onCardClick
}: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={onCardClick.sellers}
          className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
        >
          <StatCard
            title="Active Sellers"
            value={sellerCount.toString()}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        <div 
          onClick={onCardClick.dealers}
          className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
        >
          <StatCard
            title="Verified Dealers"
            value={dealerCount.toString()}
            icon={Gavel}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        <div 
          onClick={onCardClick.revenue}
          className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
        >
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
        </div>
        <div 
          onClick={onCardClick.success}
          className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
        >
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>
      </div>
    </div>
  );
}
