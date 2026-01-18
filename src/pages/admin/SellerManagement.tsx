import { useState, useMemo } from "react";
import { Loader2, Download } from "lucide-react";
import { SellerList } from "@/components/admin/seller-management/SellerList";
import { DeleteSellerDialog } from "@/components/admin/seller-management/DeleteSellerDialog";
import { SellerPagination } from "@/components/admin/seller-management/SellerPagination";
import { SellerSearch } from "@/components/admin/seller-management/SellerSearch";
import { useSellerManagement } from "@/hooks/useSellerManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportSellersToCSV } from "@/utils/exportSellers";

const SellerManagement = () => {
  const {
    sellers,
    isLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteClick,
    handleDeleteSeller
  } = useSellerManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSellers = useMemo(() => {
    if (!sellers || !Array.isArray(sellers)) return [];
    if (!searchTerm.trim()) return sellers;

    const searchLower = searchTerm.toLowerCase();
    return sellers.filter((seller) => 
      seller.email?.toLowerCase().includes(searchLower)
    );
  }, [sellers, searchTerm]);

  const totalSellers = filteredSellers.length;
  const totalPages = Math.ceil(totalSellers / pageSize);

  const paginatedSellers = useMemo(() => {
    if (!Array.isArray(filteredSellers)) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSellers.slice(startIndex, endIndex);
  }, [filteredSellers, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleExportEmails = () => {
    if (paginatedSellers.length === 0) {
      toast.error("No sellers on current page to export");
      return;
    }

    try {
      exportSellersToCSV(paginatedSellers, 'emails_only');
      toast.success(`Exported ${paginatedSellers.length} seller email(s)`);
    } catch (error) {
      console.error('Error exporting sellers:', error);
      toast.error('Failed to export seller emails');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <p className="text-muted-foreground">Manage and monitor seller accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleExportEmails}
            disabled={paginatedSellers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Emails
            {paginatedSellers.length > 0 && (
              <Badge variant="secondary" className="ml-1">{paginatedSellers.length}</Badge>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            Total Sellers: {sellers?.length || 0}
          </div>
        </div>
      </div>

      <SellerSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <div className="bg-white rounded-lg shadow">
        <SellerList 
          sellers={paginatedSellers} 
          onDeleteClick={handleDeleteClick}
          isLoading={isLoading}
        />

        {totalSellers > 0 && (
          <SellerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalSellers}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <DeleteSellerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteSeller={handleDeleteSeller}
      />
    </div>
  );
};

export default SellerManagement;
