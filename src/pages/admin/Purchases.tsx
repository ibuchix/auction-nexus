
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { RefreshCw, Calendar as CalendarIcon, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";

type Purchase = {
  id: string;
  dealer_id: string;
  car_id: string;
  amount: number;
  status: string;
  created_at: string;
  purchase_date: string;
  refund_date?: string;
  refund_reason?: string;
  refunded_by?: string;
  notes?: string;
  transaction_reference?: string;
  updated_at: string;
  dealer: {
    id: string;
    business_name: string;
  };
  car: {
    id: string;
    title: string;
  };
};

const Purchases = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dealerFilter, setDealerFilter] = useState<string>("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const { data: purchases, isLoading, refetch } = useQuery({
    queryKey: ['purchases', dateRange, statusFilter, dealerFilter],
    queryFn: async () => {
      let query = supabase
        .from('dealer_purchases')
        .select(`
          *,
          dealer:dealers(id, business_name),
          car:cars(id, title)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      if (dealerFilter) {
        query = query.ilike('dealer.business_name', `%${dealerFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Purchase[];
    }
  });

  const handleRefund = async () => {
    if (!selectedPurchase) return;
    
    try {
      const { error } = await supabase
        .from('dealer_purchases')
        .update({ 
          status: 'refunded',
          refund_reason: refundReason,
          refunded_at: new Date().toISOString()
        })
        .eq('id', selectedPurchase.id);

      if (error) throw error;
      
      toast.success("Purchase refunded successfully");
      setSelectedPurchase(null);
      setRefundReason("");
      refetch();
    } catch (error) {
      toast.error("Failed to process refund");
      console.error("Refund error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dealer Purchases</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Filter by dealer name..."
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={() => refetch()} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
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
                      <TableCell>{purchase.dealer.business_name}</TableCell>
                      <TableCell>{purchase.car.title}</TableCell>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={purchase.status !== 'completed'}
                              onClick={() => setSelectedPurchase(purchase)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Refund</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to refund this purchase? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Refund Reason
                              </label>
                              <Input
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Enter reason for refund"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={handleRefund}
                                disabled={!refundReason}
                              >
                                Confirm Refund
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Purchases;
