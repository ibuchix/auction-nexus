
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AdminActions } from "@/components/admin/dashboard/AdminActions";
import { AdminCardGrid } from "@/components/dashboard/AdminCardGrid";
import { MonitoringCards } from "@/components/dashboard/MonitoringCards";
import { useDashboardData } from "@/hooks/useDashboardData";

interface DashboardContentProps {
  currentTime: Date;
}

export function DashboardContent({ currentTime }: DashboardContentProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    sellerCount, 
    dealerCount, 
    monthlyRevenue, 
    successRate,
    pendingVerifications,
    activeAuctions,
    suspiciousActivities
  } = useDashboardData();

  return (
    <div className="w-full py-6 px-6 relative z-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <DashboardHeader
          title="Admin Dashboard"
          currentTime={currentTime}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pendingVerifications={pendingVerifications}
          suspiciousActivities={suspiciousActivities}
        />
        
        <AdminActions />
      </div>

      <StatsOverview
        sellerCount={sellerCount}
        dealerCount={dealerCount}
        monthlyRevenue={monthlyRevenue}
        successRate={successRate}
        onCardClick={{
          sellers: () => navigate('/admin/sellers'),
          dealers: () => navigate('/admin/dealers/verification'),
          revenue: () => navigate('/admin/analytics'),
          success: () => navigate('/admin/analytics')
        }}
      />

      <div className="my-6">
        <MonitoringCards
          pendingVerifications={pendingVerifications}
          activeAuctions={activeAuctions}
          suspiciousActivities={suspiciousActivities}
          onCardClick={{
            verifications: () => navigate('/admin/dealers/verification'),
            auctions: () => navigate('/admin/auctions/monitor'),
            activities: () => navigate('/admin/fraud')
          }}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Management Console</h2>
        <AdminCardGrid />
      </div>
    </div>
  );
}
