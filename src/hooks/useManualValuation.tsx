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
  const [isStagingOpen, setIsStagingOpen] = useState(false);
  const [reservePrice, setReservePrice] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const queryClient = useQueryClient();

  // Fetch manual valuations
  const { data: valuations, isLoading, refetch } = useQuery({
    queryKey: ["manual-valuations", activeStatus],
    queryFn: async () => {
      try {
        console.log("Fetching manual valuations with status:", activeStatus);
        const { data, error } = await supabase.rpc('admin_get_manual_valuations', {
          p_status: activeStatus === "all" ? "all" : activeStatus
        });

        if (error) {
          console.error("RPC error:", error);
          throw error;
        }

        console.log("Raw RPC data:", data);

        // The RPC returns a direct jsonb object with { success: true, data: [...] }
        if (!data || typeof data !== 'object') {
          console.log("No data or invalid format");
          return [];
        }

        // Handle the jsonb return format - data is the actual response object
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          console.log("Parsed valuations:", data.data);
          return data.data as ManualValuationData[];
        } else {
          console.log("RPC returned unexpected format:", data);
          return [];
        }
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

  // Enhanced transfer to cars table with staging
  const enhancedTransferToCarsOperationMutation = useMutation({
    mutationFn: async ({ valuationId, reservePrice, carUpdates }: { 
      valuationId: string; 
      reservePrice: number; 
      carUpdates?: any;
    }) => {
      const { data: result, error } = await supabase.rpc('admin_transfer_manual_valuation_to_cars_enhanced', {
        p_valuation_id: valuationId,
        p_reserve_price: reservePrice,
        p_car_updates: carUpdates || null
      });

      if (error) throw error;
      return result as any;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["manual-valuations"] });
      
      if (result?.success) {
        toast.success("Car transferred to cars table successfully!");
        setSelectedValuation(null);
        setIsDetailsOpen(false);
        setIsStagingOpen(false);
        setReservePrice("");
      } else {
        toast.error(result?.error || "Transfer failed");
      }
      setIsTransferring(false);
    },
    onError: (error) => {
      console.error("Enhanced transfer error:", error);
      toast.error("Failed to transfer car to cars table");
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

    // Open staging dialog instead of immediate transfer
    setIsStagingOpen(true);
  };

  const handlePrepareTransfer = () => {
    if (!selectedValuation) return;
    setIsDetailsOpen(false);
    setIsStagingOpen(true);
  };

  const handleConfirmTransfer = async (carUpdates: any) => {
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
    enhancedTransferToCarsOperationMutation.mutate({
      valuationId: selectedValuation.id,
      reservePrice: priceNumber,
      carUpdates: carUpdates
    });
  };

  const handleCancelStaging = () => {
    setIsStagingOpen(false);
    setIsDetailsOpen(true);
  };

  return {
    valuations: valuations || [],
    isLoading,
    refetch,
    selectedValuation,
    isDetailsOpen,
    setIsDetailsOpen,
    isStagingOpen,
    setIsStagingOpen,
    reservePrice,
    setReservePrice,
    isTransferring,
    activeStatus,
    setActiveStatus,
    openDetailsDialog,
    handleUpdateValuation,
    handleTransferToCars,
    handlePrepareTransfer,
    handleConfirmTransfer,
    handleCancelStaging,
    isUpdating: updateValuationMutation.isPending
  };
}