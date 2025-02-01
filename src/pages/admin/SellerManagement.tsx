import { DashboardLayout } from "@/components/DashboardLayout";
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
  email: string | null;
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
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('seller_id')
        .eq('status', 'available');

      if (carsError) throw carsError;

      const sellerIds = [...new Set(cars?.map(car => car.seller_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, email:auth_users(email)')
        .in('id', sellerIds)
        .eq('role', 'seller');

      if (profilesError) throw profilesError;

      // Transform the data to match our Seller interface
      return profiles.map(profile => ({
        ...profile,
        email: profile.email?.email // Nested email from auth.users
      }));
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Active Sellers</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers?.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>{seller.name}</TableCell>
                  <TableCell>{seller.email}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
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
    </DashboardLayout>
  );
};

export default SellerManagement;