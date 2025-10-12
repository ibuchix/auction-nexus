import { useState } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { useToast } from "@/hooks/use-toast";
import { objectToSnakeCase } from "@/utils/caseConverter";
import { vehicleDetailsSchema, sellerInfoSchema, type CarEditFormData } from "../types";

export function useCarEdit(auction: any) {
  const [formData, setFormData] = useState<CarEditFormData>({
    title: auction.title || '',
    make: auction.make || '',
    model: auction.model || '',
    year: auction.year || new Date().getFullYear(),
    mileage: auction.mileage || 0,
    vin: auction.vin || '',
    reserve_price: auction.reserve_price || auction.reservePrice || 0,
    transmission: auction.transmission || 'manual',
    fuel_type: auction.fuel_type || auction.fuelType || '',
    seat_material: auction.seat_material || auction.seatMaterial || '',
    is_damaged: auction.is_damaged || auction.isDamaged || false,
    service_history_type: auction.service_history_type || auction.serviceHistoryType || '',
    number_of_keys: auction.number_of_keys || auction.numberOfKeys || 1,
    seller_notes: auction.seller_notes || auction.sellerNotes || '',
    features: auction.features || {},
    seller_name: auction.seller_name || auction.sellerName || '',
    mobile_number: auction.mobile_number || auction.mobileNumber || '',
    street_address: auction.street_address || auction.streetAddress || '',
    town: auction.town || '',
    postcode: auction.postcode || '',
    county: auction.county || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof CarEditFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      vehicleDetailsSchema.parse({
        title: formData.title,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        vin: formData.vin,
        reserve_price: formData.reserve_price,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        seat_material: formData.seat_material,
        is_damaged: formData.is_damaged,
        service_history_type: formData.service_history_type,
        number_of_keys: formData.number_of_keys,
        seller_notes: formData.seller_notes,
        features: formData.features
      });

      sellerInfoSchema.parse({
        seller_name: formData.seller_name,
        mobile_number: formData.mobile_number,
        street_address: formData.street_address,
        town: formData.town,
        postcode: formData.postcode,
        county: formData.county
      });

      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const saveChanges = async (): Promise<boolean> => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    try {
      const updateData = objectToSnakeCase(formData);
      
      const { error } = await adminSupabase
        .from('cars')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "Vehicle listing updated successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save changes",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    errors,
    isSaving,
    updateField,
    saveChanges,
    setFormData
  };
}
