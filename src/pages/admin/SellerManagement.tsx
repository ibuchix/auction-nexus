
import { Loader2 } from "lucide-react";
import { SellerList } from "@/components/admin/seller-management/SellerList";
import { DeleteSellerDialog } from "@/components/admin/seller-management/DeleteSellerDialog";
import { useSellerManagement } from "@/hooks/useSellerManagement";

const SellerManagement = () => {
  const {
    sellers,
    isLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteClick,
    handleDeleteSeller
  } = useSellerManagement();

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
        <h1 className="text-2xl font-bold">Active Sellers</h1>
      </div>

      <SellerList 
        sellers={sellers || []} 
        onDeleteClick={handleDeleteClick}
        isLoading={isLoading}
      />

      <DeleteSellerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteSeller={handleDeleteSeller}
      />
    </div>
  );
};

export default SellerManagement;
