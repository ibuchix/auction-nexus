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
  street_address: string | null;
  town: string | null;
  postcode: string | null;
  county: string | null;
  mobile_number: string | null;
  reserve_price: number | null;
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

        // The RPC returns { success: true, data: [...] }
        if (!data) {
          console.log("No data received");
          return [];
        }

        // Type cast the response to expected format
        const response = data as { success: boolean; data?: any[]; error?: string };

        // Check if the response has the expected structure
        if (response.success && Array.isArray(response.data)) {
          console.log("Parsed valuations:", response.data);
          return response.data as ManualValuationData[];
        } else if (response.success === false) {
          console.error("RPC returned error:", response.error);
          toast.error(response.error || "Failed to fetch valuations");
          return [];
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
    mutationFn: async ({ valuationId, reservePrice, adminNotes }: { 
      valuationId: string; 
      reservePrice: number; 
      adminNotes?: string;
    }) => {
      const { data: result, error } = await supabase.rpc('admin_transfer_manual_valuation_to_cars_enhanced', {
        p_manual_valuation_id: valuationId,
        p_reserve_price: reservePrice,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;
      
      // Type cast the RPC response
      const response = result as { success: boolean; car_id?: string; error?: string; message?: string };
      
      // The RPC returns { success, car_id?, error?, message? }
      if (!response.success) {
        throw new Error(response.error || 'Transfer failed');
      }
      
      return response;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["manual-valuations"] });
      
      // Show success message with car details
      const message = result.message || "Car transferred successfully and ready for auction scheduling!";
      toast.success(message);
      
      setSelectedValuation(null);
      setIsDetailsOpen(false);
      setIsStagingOpen(false);
      setReservePrice("");
      setIsTransferring(false);
    },
    onError: (error: any) => {
      console.error("Enhanced transfer error:", error);
      
      // Show specific error messages
      const errorMessage = error.message || "Failed to transfer valuation";
      
      if (errorMessage.includes('VIN already exists')) {
        toast.error("A car with this VIN already exists in the system");
      } else if (errorMessage.includes('Admin privileges')) {
        toast.error("You need admin privileges to transfer valuations");
      } else if (errorMessage.includes('not found')) {
        toast.error("Manual valuation not found");
      } else {
        toast.error(errorMessage);
      }
      
      setIsTransferring(false);
    },
  });

  const openDetailsDialog = (valuation: ManualValuationData) => {
    setSelectedValuation(valuation);
    setIsDetailsOpen(true);
    // Initialize reserve price from valuation data
    setReservePrice(valuation.reserve_price?.toString() || "");
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

  const handleConfirmTransfer = async (adminNotes?: string) => {
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
      adminNotes: adminNotes
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