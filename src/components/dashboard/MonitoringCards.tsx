import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MonitoringCardsProps {
  pendingVerifications: number;
  activeAuctions: number;
  suspiciousActivities: number;
}

export function MonitoringCards({
  pendingVerifications,
  activeAuctions,
  suspiciousActivities,
}: MonitoringCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pending Dealer Verifications
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{pendingVerifications || 0}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            View All
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Active Auctions
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{activeAuctions || 0}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            Manage
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-red-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Suspicious Activities
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{suspiciousActivities || 0}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            Investigate
          </Button>
        </div>
      </div>
    </div>
  );
}