import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, Gavel, DollarSign, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your auction management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sellers"
            value="156"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Auctions"
            value="23"
            icon={Gavel}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Monthly Revenue"
            value="$45,231"
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Success Rate"
            value="92%"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Placeholder for activity feed */}
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;