
import { format } from "date-fns";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Purchase } from "../../../types/purchases";

interface PurchaseTableProps {
  purchases: Purchase[];
  onRefundClick: (purchase: Purchase) => void;
}

export const PurchaseTable = ({ purchases, onRefundClick }: PurchaseTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Dealer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases?.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{format(new Date(purchase.created_at), "PP")}</TableCell>
              <TableCell>{purchase.dealer?.business_name}</TableCell>
              <TableCell>{purchase.car?.title}</TableCell>
              <TableCell>${purchase.amount.toLocaleString()}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    purchase.status === 'refunded' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                  {purchase.status}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={purchase.status !== 'completed'}
                  onClick={() => onRefundClick(purchase)}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Refund
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
