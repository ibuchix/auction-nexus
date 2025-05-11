
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  mobile_number: string | null;
  address: string | null;
}

const SellerManagement = () => {
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
      toast.error('Failed to remove seller account');
      console.error('Error removing seller:', error);
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
        <h1 className="text-2xl font-bold">Active Sellers</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(sellers) && sellers.length > 0 ? (
              sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>{seller.name}</TableCell>
                  <TableCell>{seller.mobile_number}</TableCell>
                  <TableCell>{seller.address}</TableCell>
                  <TableCell>
                    {new Date(seller.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedSeller(seller);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No active sellers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Seller Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this seller account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSeller}
            >
              Remove Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerManagement;
