
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const { toast } = useToast();

  const { data: purchases, isLoading, refetch } = useQuery({
    queryKey: ['adminPurchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealer_purchases')
        .select(`
          *,
          dealer:dealers(dealership_name),
          car:cars(title, make, model, year)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  const handleRefund = async () => {
    if (!selectedPurchase || !refundReason) return;

    const { error } = await supabase
      .from('dealer_purchases')
      .update({ 
        status: 'refunded',
        refund_date: new Date().toISOString(),
        refund_reason: refundReason,
        refunded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', selectedPurchase.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Purchase has been marked as refunded."
    });

    setRefundDialogOpen(false);
    setSelectedPurchase(null);
    setRefundReason("");
    refetch();
  };

  const filteredPurchases = purchases?.filter(purchase => {
    const matchesSearch = 
      purchase.car.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.dealer.dealership_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <Button onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by vehicle or dealer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <option value="all">All Status</option>
            <option value="purchased">Purchased</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : filteredPurchases?.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4">
                      {purchase.car.year} {purchase.car.make} {purchase.car.model}
                    </td>
                    <td className="px-6 py-4">{purchase.dealer.dealership_name}</td>
                    <td className="px-6 py-4">${purchase.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === 'refunded' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {purchase.status !== 'refunded' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setRefundDialogOpen(true);
                          }}
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Please provide a reason for the refund. This will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Refund Reason</label>
              <Textarea
                placeholder="Enter the reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialogOpen(false);
                setSelectedPurchase(null);
                setRefundReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={!refundReason}
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Purchases;
