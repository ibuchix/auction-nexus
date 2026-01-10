import { useState, useMemo } from "react";
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
  has_full_registration_document: boolean | null;
  has_outstanding_finance: boolean | null;
  finance_amount: number | null;
  finance_document_url: string | null;
  finance_document_name: string | null;
  finance_document_uploaded_at: string | null;
  service_history_type: string | null;
  seller_notes: string | null;
  name: string | null;
  street_address: string | null;
  town: string | null;
  postcode: string | null;
  county: string | null;
  mobile_number: string | null;
  reserve_price: number | null;
  seller_acceptable_price: number | null;
  created_at: string;
  status: string | null;
  valuation_result: any;
  updated_at: string | null;
  fuel_type: string | null;
  images: ManualValuationImage[];
  // Condition questions
  ac_working: boolean | null;
  windows_working: boolean | null;
  tires_legal_depth: boolean | null;
  runs_smoothly: boolean | null;
  has_scratches: boolean | null;
  has_dents: boolean | null;
  has_rust: boolean | null;
  has_interior_stains: boolean | null;
  engine_faults: boolean | null;
  gearbox_faults: boolean | null;
  electrical_faults: boolean | null;
  engine_smokes: boolean | null;
  brakes_noisy: boolean | null;
  suspension_noisy: boolean | null;
  warning_lights_on: boolean | null;
}

export function useManualValuation() {
  const [selectedValuation, setSelectedValuation] = useState<ManualValuationData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStagingOpen, setIsStagingOpen] = useState(false);
  const [reservePrice, setReservePrice] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const queryClient = useQueryClient();

  // Fetch manual valuations
  const { data: valuations, isLoading, refetch } = useQuery({
    queryKey: ["manual-valuations", activeStatus],
    queryFn: async () => {
      try {
        console.log("Fetching manual valuations with status:", activeStatus);
        const { data, error } = await supabase.rpc('admin_get_manual_valuations', {
          p_status: activeStatus === "all" ? null : activeStatus
        });

        if (error) {
          console.error("RPC error:", error);
          throw error;
        }

        console.log("Raw RPC data:", data);

        if (!data) {
          console.log("No data received");
          return [];
        }

        // The RPC returns a plain JSONB array directly
        if (Array.isArray(data)) {
          console.log("Parsed valuations:", data);
          return data as unknown as ManualValuationData[];
        }

        // Fallback for wrapped response format (legacy support)
        const response = data as { success: boolean; data?: any[]; error?: string };
        if (response.success && Array.isArray(response.data)) {
          return response.data as ManualValuationData[];
        }

        console.log("RPC returned unexpected format:", data);
        return [];
      } catch (error) {
        console.error("Error fetching manual valuations:", error);
        throw error;
      }
    },
  });

  // Filter valuations based on search term
  const filteredValuations = useMemo(() => {
    if (!valuations) return [];
    
    if (!searchTerm.trim()) {
      return valuations;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    return valuations.filter((valuation) => {
      // Search by vehicle title (make + model)
      const vehicleTitle = `${valuation.make || ''} ${valuation.model || ''}`.toLowerCase();
      if (vehicleTitle.includes(searchLower)) return true;
      
      // Search by seller name
      if (valuation.name?.toLowerCase().includes(searchLower)) return true;
      
      // Search by VIN
      if (valuation.vin?.toLowerCase().includes(searchLower)) return true;
      
      // Search by seller email
      if (valuation.contact_email?.toLowerCase().includes(searchLower)) return true;
      
      return false;
    });
  }, [valuations, searchTerm]);

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
    mutationFn: async ({ valuationId, reservePrice }: { 
      valuationId: string; 
      reservePrice: number; 
    }) => {
      const { data: result, error } = await supabase.rpc('admin_transfer_manual_valuation_to_cars_enhanced', {
        p_manual_valuation_id: valuationId,
        p_reserve_price: reservePrice
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

  const handleConfirmTransfer = async () => {
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
      reservePrice: priceNumber
    });
  };

  const handleCancelStaging = () => {
    setIsStagingOpen(false);
    setIsDetailsOpen(true);
  };

  return {
    valuations: filteredValuations,
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
    searchTerm,
    setSearchTerm,
    openDetailsDialog,
    handleUpdateValuation,
    handleTransferToCars,
    handlePrepareTransfer,
    handleConfirmTransfer,
    handleCancelStaging,
    isUpdating: updateValuationMutation.isPending
  };
}