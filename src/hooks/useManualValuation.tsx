import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ManualValuationImage {
  id: string;
  file_path: string;
  file_type: string;
  category: string | null;
  display_order: number;
  created_at: string;
}

export interface ManualValuationData {
  id: string;
  user_id: string;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  transmission: string | null;
  mileage: number | null;
  registration_number: string | null;
  features: any;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  is_damaged: boolean | null;
  is_registered_in_poland: boolean | null;
  seat_material: string | null;
  number_of_keys: number | null;
  has_tool_pack: boolean | null;
  has_documentation: boolean | null;
  is_selling_on_behalf: boolean | null;
  has_private_plate: boolean | null;
  finance_amount: number | null;
  service_history_type: string | null;
  seller_notes: string | null;
  name: string | null;
  address: string | null;
  mobile_number: string | null;
  created_at: string;
  status: string | null;
  valuation_result: any;
  updated_at: string | null;
  fuel_type: string | null;
  images: ManualValuationImage[];
}

export function useManualValuation() {
  const [selectedValuation, setSelectedValuation] = useState<ManualValuationData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [reservePrice, setReservePrice] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const queryClient = useQueryClient();

  // Fetch manual valuations
  const { data: valuations, isLoading, refetch } = useQuery({
    queryKey: ["manual-valuations", activeStatus],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('admin_get_manual_valuations', {
          p_status: activeStatus === "all" ? null : activeStatus
        });

        if (error) throw error;

        const parsedData = data?.[0] || [];
        return Array.isArray(parsedData) ? parsedData as unknown as ManualValuationData[] : [] as ManualValuationData[];
      } catch (error) {
        console.error("Error fetching manual valuations:", error);
        throw error;
      }
    },
  });

  // Update manual valuation
  const updateValuationMutation = useMutation({
    mutationFn: async ({ valuationId, data }: { valuationId: string; data: any }) => {
      const { data: result, error } = await supabase.rpc('admin_update_manual_valuation', {
        p_valuation_id: valuationId,
        p_valuation_data: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-valuations"] });
      toast.success("Valuation updated successfully");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update valuation");
    },
  });

  // Transfer to cars table
  const transferToCarsOperationMutation = useMutation({
    mutationFn: async ({ valuationId, reservePrice }: { valuationId: string; reservePrice: number }) => {
      const { data: result, error } = await supabase.rpc('admin_transfer_manual_valuation_to_cars', {
        p_valuation_id: valuationId,
        p_reserve_price: reservePrice
      });

      if (error) throw error;
      return result as any;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["manual-valuations"] });
      
      if (result?.success) {
        toast.success("Car transferred to auction successfully!");
        setSelectedValuation(null);
        setIsDetailsOpen(false);
        setReservePrice("");
      } else {
        toast.error(result?.error || "Transfer failed");
      }
      setIsTransferring(false);
    },
    onError: (error) => {
      console.error("Transfer error:", error);
      toast.error("Failed to transfer car to auction");
      setIsTransferring(false);
    },
  });

  const openDetailsDialog = (valuation: ManualValuationData) => {
    setSelectedValuation(valuation);
    setIsDetailsOpen(true);
    setReservePrice("");
  };

  const handleUpdateValuation = (data: any) => {
    if (!selectedValuation) return;
    
    updateValuationMutation.mutate({
      valuationId: selectedValuation.id,
      data
    });
  };

  const handleTransferToCars = async () => {
    if (!selectedValuation || !reservePrice) {
      toast.error("Please enter a reserve price");
      return;
    }

    const priceNumber = parseFloat(reservePrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error("Please enter a valid reserve price");
      return;
    }

    setIsTransferring(true);
    transferToCarsOperationMutation.mutate({
      valuationId: selectedValuation.id,
      reservePrice: priceNumber
    });
  };

  return {
    valuations: valuations || [],
    isLoading,
    refetch,
    selectedValuation,
    isDetailsOpen,
    setIsDetailsOpen,
    reservePrice,
    setReservePrice,
    isTransferring,
    activeStatus,
    setActiveStatus,
    openDetailsDialog,
    handleUpdateValuation,
    handleTransferToCars,
    isUpdating: updateValuationMutation.isPending
  };
}