import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAuctionCard } from "@/components/admin/AdminAuctionCard";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { Auction } from "@/types/auction";
interface AuctionTabContentProps {
  title: string;
  icon: React.ReactNode;
  auctions: Auction[] | undefined;
  isLoading: boolean;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
  onScheduleClick?: (auction: Auction) => void;
  showScheduleButton?: boolean;
}
export function AuctionTabContent({
  title,
  icon,
  auctions,
  isLoading,
  onPause,
  onCancel,
  onStart,
  onScheduleClick,
  showScheduleButton = false
}: AuctionTabContentProps) {
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <p className="text-center py-4">Loading...</p> : auctions?.length === 0 ? <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No {title.toLowerCase()}</p>
          </div> : auctions?.map(listing => <div key={listing.id} className={showScheduleButton ? "relative" : ""}>
              {showScheduleButton && <Button variant="outline" size="sm" onClick={() => onScheduleClick && onScheduleClick(listing)} className="absolute right-44 top-3 z-5 text-left text-sm bg-green-500 hover:bg-green-400">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Schedule
                </Button>}
              <AdminAuctionCard key={listing.id} auction={listing} onPause={onPause} onCancel={onCancel} onStart={onStart} />
            </div>)}
      </CardContent>
    </Card>;
}