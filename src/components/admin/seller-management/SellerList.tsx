
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  mobile_number: string | null;
  address: string | null;
}

interface SellerListProps {
  sellers: Seller[];
  onDeleteClick: (seller: Seller) => void;
  isLoading: boolean;
}

export const SellerList = ({ sellers, onDeleteClick, isLoading }: SellerListProps) => {
  return (
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
                    onClick={() => onDeleteClick(seller)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                {isLoading ? "Loading..." : "No active sellers found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
