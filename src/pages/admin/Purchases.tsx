
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { PurchaseFilters } from "@/components/admin/purchases/PurchaseFilters";
import { PurchaseTable } from "@/components/admin/purchases/PurchaseTable";
import { RefundDialog } from "@/components/admin/purchases/RefundDialog";
import { Purchase } from "@/types/purchases";

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
      const query = supabase
        .from('dealer_purchases')
        .select(`
          id,
          dealer_id,
          car_id,
          amount,
          status,
          created_at,
          purchase_date,
          refund_date,
          refund_reason,
          refunded_by,
          notes,
          transaction_reference,
          updated_at,
          dealer:dealers!dealer_id(id, dealership_name),
          car:cars!car_id(id, title)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (statusFilter !== "all") {
        query.eq('status', statusFilter);
      }
      
      if (dealerFilter) {
        query.ilike('dealer.dealership_name', `%${dealerFilter}%`);
      }

      const { data: purchasesData, error } = await query;
      
      if (error) throw error;
      
      const transformedData = (purchasesData || []).map(purchase => ({
        ...purchase,
        dealer: purchase.dealer ? {
          id: purchase.dealer.id,
          business_name: purchase.dealer.dealership_name
        } : null,
        car: purchase.car as Purchase['car']
      }));

      return transformedData;
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
          <PurchaseFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dealerFilter={dealerFilter}
            setDealerFilter={setDealerFilter}
            onRefresh={refetch}
          />
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <PurchaseTable
            purchases={purchases || []}
            onRefundClick={setSelectedPurchase}
          />
        )}

        <RefundDialog
          purchase={selectedPurchase}
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          refundReason={refundReason}
          setRefundReason={setRefundReason}
          onRefund={handleRefund}
        />
      </div>
    </DashboardLayout>
  );
};

export default Purchases;
