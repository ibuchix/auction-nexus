
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  mobile_number: string | null;
  address: string | null;
}

export const useSellerManagement = () => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { operations, userId } = useAdmin();

  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ['activeSellers'],
    queryFn: async () => {
      try {
        // Use the admin operations to fetch all sellers
        const sellersData = await operations.getAllSellers();
        if (!sellersData) {
          console.error('Failed to fetch sellers data');
          return [];
        }
        return sellersData as Seller[];
      } catch (error) {
        console.error('Error fetching sellers:', error);
        toast.error('Failed to load sellers data');
        throw error;
      }
    }
  });

  const handleDeleteClick = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller || !userId) return;

    try {
      // Use admin operations to delete the seller
      const result = await operations.deleteSeller(selectedSeller.id);
      
      if (result) {
        toast.success('Seller account removed successfully');
        setIsDeleteDialogOpen(false);
        setSelectedSeller(null);
        refetch();
      } else {
        throw new Error('Failed to delete seller');
      }
    } catch (error) {
      throw error; // Let the dialog component handle the error
    }
  };

  return {
    sellers,
    isLoading,
    selectedSeller,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteClick,
    handleDeleteSeller
  };
};
