
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  verification_status: string | null;
  is_verified: boolean;
  total_listings: number;
  active_listings: number;
}

export const useSellerManagement = () => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { operations, userId } = useAdmin();

  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ['activeSellers'],
    queryFn: async () => {
      try {
        console.log('Fetching sellers with admin operations...');
        // Use the admin operations to fetch all sellers
        const sellersData = await operations.getAllSellers();
        if (!sellersData || !Array.isArray(sellersData)) {
          console.error('Invalid sellers data format:', sellersData);
          return [];
        }
        console.log('Fetched sellers data:', sellersData);
        return sellersData as Seller[];
      } catch (error) {
        console.error('Error fetching sellers:', error);
        toast.error('Failed to load sellers data');
        return [];
      }
    }
  });

  const handleDeleteClick = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller) {
      toast.error('No seller selected for deletion');
      return;
    }

    try {
      console.log('Deleting seller:', selectedSeller.id);
      const result = await operations.deleteSeller(selectedSeller.id);
      
      if (result) {
        toast.success('Seller account removed successfully');
        setIsDeleteDialogOpen(false);
        setSelectedSeller(null);
        refetch();
      } else {
        toast.error('Failed to remove seller - the operation did not complete successfully');
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      throw error;
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
