
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ['activeSellers'],
    queryFn: async () => {
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, updated_at')
          .eq('role', 'seller');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        if (!profilesData) return [];
        
        const sellersWithDetails = await Promise.all(
          profilesData.map(async (profile) => {
            if (!profile || typeof profile.id !== 'string') {
              console.error('Invalid profile data:', profile);
              return null;
            }

            const { data: carsData, error: carsError } = await supabase
              .from('cars')
              .select('mobile_number')
              .eq('seller_id', profile.id)
              .eq('status', 'available')
              .limit(1);
            
            if (carsError) {
              console.error('Error fetching car data:', carsError);
            }
            
            const { data: nameData, error: nameError } = await supabase
              .from('cars')
              .select('title')
              .eq('seller_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (nameError) {
              console.error('Error fetching name data:', nameError);
            }
            
            return {
              id: profile.id,
              role: profile.role,
              created_at: profile.updated_at,
              name: nameData?.[0]?.title?.split(' ')[0] || 'N/A',
              mobile_number: carsData?.[0]?.mobile_number || 'N/A',
              address: 'N/A',
            } as Seller;
          })
        );
        
        return sellersWithDetails.filter((seller): seller is Seller => seller !== null);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        throw error;
      }
    }
  });

  const handleDeleteSeller = async () => {
    if (!selectedSeller) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedSeller.id);

      if (error) throw error;

      toast.success('Seller account removed successfully');
      setIsDeleteDialogOpen(false);
      setSelectedSeller(null);
      refetch();
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
