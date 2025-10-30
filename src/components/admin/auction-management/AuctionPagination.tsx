import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AuctionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
}

export function AuctionPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onGoToPage
}: AuctionPaginationProps) {
  // Calculate display range
  const startItem = totalCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  // Generate page numbers to display (max 5 visible at a time)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Smart pagination: show current page + 2 on each side
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }
    
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ];
  };
  
  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) {
    // Don't show pagination if only 1 page
    return null;
  }
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-card rounded-b-lg">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalCount}</span> cars
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {/* Show first page if not in range */}
        {pageNumbers[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGoToPage(1)}
            >
              1
            </Button>
            {pageNumbers[0] > 2 && (
              <span className="text-muted-foreground px-2">...</span>
            )}
          </>
        )}
        
        {/* Page number buttons */}
        {pageNumbers.map(pageNum => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onGoToPage(pageNum)}
            className="min-w-[2.5rem]"
          >
            {pageNum}
          </Button>
        ))}
        
        {/* Show last page if not in range */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-muted-foreground px-2">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGoToPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
