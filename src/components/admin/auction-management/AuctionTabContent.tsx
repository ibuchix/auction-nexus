import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAuctionCard } from "@/components/admin/AdminAuctionCard";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { Auction } from "@/types/auction";
import { AuctionCardSkeletonList } from "./AuctionCardSkeleton";
interface AuctionTabContentProps {
  title: string;
  icon: React.ReactNode;
  auctions: Auction[] | undefined;
  isLoading: boolean;
  allowEdit?: boolean;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
  onScheduleClick?: (auction: Auction) => void;
  showScheduleButton?: boolean;
  onSuccess?: () => void;
  autoLoadImages?: boolean;
  showImageCount?: boolean;
  onExport?: () => void;
  isExporting?: boolean;
  totalCount?: number;
}
export function AuctionTabContent({
  title,
  icon,
  auctions,
  isLoading,
  allowEdit = false,
  onPause,
  onCancel,
  onStart,
  onScheduleClick,
  showScheduleButton = false,
  onSuccess,
  autoLoadImages = true,
  showImageCount = false,
  onExport,
  isExporting = false,
  totalCount
}: AuctionTabContentProps) {
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isExporting || isLoading || !auctions || auctions.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {totalCount ? `(${totalCount})` : ''} to CSV
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <AuctionCardSkeletonList count={3} />
        ) : auctions?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No {title.toLowerCase()}</p>
          </div>
        ) : (
          auctions?.map(listing => (
            <div key={listing.id} className={showScheduleButton ? "relative" : ""}>
              {showScheduleButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onScheduleClick && onScheduleClick(listing)} 
                  className="absolute right-44 top-3 z-5 text-left text-sm bg-green-500 hover:bg-green-400 mx-0 my-[12px]"
                >
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              )}
              <AdminAuctionCard 
                auction={listing} 
                allowEdit={allowEdit} 
                onPause={onPause} 
                onCancel={onCancel} 
                onStart={onStart} 
                onSuccess={onSuccess} 
                autoLoadImages={autoLoadImages}
                showImageCount={showImageCount}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>;
}