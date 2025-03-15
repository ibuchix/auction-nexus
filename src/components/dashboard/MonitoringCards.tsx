
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonitoringCardsProps {
  pendingVerifications: number;
  activeAuctions: number;
  suspiciousActivities: number;
  onCardClick: {
    verifications: () => void;
    auctions: () => void;
    activities: () => void;
  };
}

export function MonitoringCards({
  pendingVerifications,
  activeAuctions,
  suspiciousActivities,
  onCardClick
}: MonitoringCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <div 
        onClick={onCardClick.verifications}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pending Dealer Verifications
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{pendingVerifications}</span>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </div>

      <div 
        onClick={onCardClick.auctions}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Active Auctions
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{activeAuctions}</span>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      </div>

      <div 
        onClick={onCardClick.activities}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-red-500" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Suspicious Activities
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{suspiciousActivities}</span>
          <Button variant="outline" size="sm">Investigate</Button>
        </div>
      </div>
    </div>
  );
}
