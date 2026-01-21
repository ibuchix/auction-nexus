import { ValuationStatsCard } from "@/components/admin/dashboard/ValuationStatsCard";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";

const ValuationStats = () => {
  return (
    <div className="space-y-6 mx-auto max-w-6xl">
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-4 rounded-lg shadow-sm">
        <DashboardHeader title="Valuation Statistics" />
      </div>

      <ValuationStatsCard />
    </div>
  );
};

export default ValuationStats;
