import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AuctionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Image skeleton */}
          <Skeleton className="h-32 w-48 rounded-md flex-shrink-0" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Details */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuctionCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <AuctionCardSkeleton key={i} />
      ))}
    </div>
  );
}
