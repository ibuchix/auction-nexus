import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { objectToSnakeCase } from "@/utils/caseConverter";
import { vehicleDetailsSchema, sellerInfoSchema, type CarEditFormData } from "../types";
import { supabase } from "@/integrations/supabase/client";

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
    engine_capacity: auction.engine_capacity || auction.engineCapacity || '',
    seat_material: auction.seat_material || auction.seatMaterial || '',
    is_damaged: auction.is_damaged ?? auction.isDamaged ?? null,
    service_history_type: auction.service_history_type || auction.serviceHistoryType || '',
    number_of_keys: auction.number_of_keys || auction.numberOfKeys || 1,
    seller_notes: auction.seller_notes || auction.sellerNotes || '',
    features: auction.features || {},
    seller_name: auction.seller_name || auction.sellerName || '',
    mobile_number: auction.mobile_number || auction.mobileNumber || '',
    contact_email: auction.contact_email || auction.contactEmail || '',
    street_address: auction.street_address || auction.streetAddress || '',
    town: auction.town || '',
    postcode: auction.postcode || '',
    county: auction.county || '',
    registration_number: auction.registration_number || auction.registrationNumber || '',
    has_outstanding_finance: auction.has_outstanding_finance ?? auction.hasOutstandingFinance ?? null,
    finance_amount: auction.finance_amount || auction.financeAmount || 0,
    is_selling_on_behalf: auction.is_selling_on_behalf ?? auction.isSellingOnBehalf ?? null,
    is_registered_in_poland: auction.is_registered_in_poland ?? auction.isRegisteredInPoland ?? null,
    has_full_registration_document: auction.has_full_registration_document ?? auction.hasFullRegistrationDocument ?? null,
    has_service_history: auction.has_service_history ?? auction.hasServiceHistory ?? null,
    valuation_data: auction.valuation_data || auction.valuationData || null,
    finance_document_name: auction.finance_document_name || auction.financeDocumentName || '',
    finance_document_url: auction.finance_document_url || auction.financeDocumentUrl || '',
    finance_document_uploaded_at: auction.finance_document_uploaded_at || auction.financeDocumentUploadedAt || null,
    // New vehicle history & specifications fields
    is_polish_origin: auction.is_polish_origin ?? auction.isPolishOrigin ?? null,
    owners_count_poland: auction.owners_count_poland ?? auction.ownersCountPoland ?? null,
    import_year: auction.import_year ?? auction.importYear ?? null,
    is_damaged_record_poland: auction.is_damaged_record_poland ?? auction.isDamagedRecordPoland ?? null,
    is_damaged_record_abroad: auction.is_damaged_record_abroad ?? auction.isDamagedRecordAbroad ?? null,
    is_accident_record_poland: auction.is_accident_record_poland ?? auction.isAccidentRecordPoland ?? null,
    is_accident_record_abroad: auction.is_accident_record_abroad ?? auction.isAccidentRecordAbroad ?? null,
    has_mileage_discrepancy: auction.has_mileage_discrepancy ?? auction.hasMileageDiscrepancy ?? null,
    is_recorded_stolen: auction.is_recorded_stolen ?? auction.isRecordedStolen ?? null,
    technical_inspection_valid_until: auction.technical_inspection_valid_until ?? auction.technicalInspectionValidUntil ?? null,
    horsepower: auction.horsepower ?? null,
    first_registration_date: auction.first_registration_date ?? auction.firstRegistrationDate ?? null
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
        engine_capacity: formData.engine_capacity,
        seat_material: formData.seat_material,
        is_damaged: formData.is_damaged,
        service_history_type: formData.service_history_type,
        number_of_keys: formData.number_of_keys,
        seller_notes: formData.seller_notes,
        features: formData.features,
        registration_number: formData.registration_number,
        has_outstanding_finance: formData.has_outstanding_finance,
        finance_amount: formData.finance_amount,
        is_selling_on_behalf: formData.is_selling_on_behalf,
        is_registered_in_poland: formData.is_registered_in_poland,
        has_full_registration_document: formData.has_full_registration_document,
        has_service_history: formData.has_service_history,
        valuation_data: formData.valuation_data,
        finance_document_name: formData.finance_document_name,
        finance_document_url: formData.finance_document_url,
        finance_document_uploaded_at: formData.finance_document_uploaded_at,
        // New vehicle history & specifications fields
        is_polish_origin: formData.is_polish_origin,
        owners_count_poland: formData.owners_count_poland,
        import_year: formData.import_year,
        is_damaged_record_poland: formData.is_damaged_record_poland,
        is_damaged_record_abroad: formData.is_damaged_record_abroad,
        is_accident_record_poland: formData.is_accident_record_poland,
        is_accident_record_abroad: formData.is_accident_record_abroad,
        has_mileage_discrepancy: formData.has_mileage_discrepancy,
        is_recorded_stolen: formData.is_recorded_stolen,
        technical_inspection_valid_until: formData.technical_inspection_valid_until,
        horsepower: formData.horsepower,
        first_registration_date: formData.first_registration_date
      });

      sellerInfoSchema.parse({
        seller_name: formData.seller_name,
        mobile_number: formData.mobile_number,
        contact_email: formData.contact_email,
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
          console.error('Validation error:', {
            field: err.path[0],
            message: err.message,
            value: err.value,
            received: typeof err.value
          });
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
      
      const { data: result, error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', auction.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

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
