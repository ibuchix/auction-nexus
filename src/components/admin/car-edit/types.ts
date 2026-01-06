import { z } from "zod";

// Validation schemas
export const vehicleDetailsSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  make: z.string().min(1, "Make required"),
  model: z.string().min(1, "Model required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  vin: z.string().min(5, "VIN must be at least 5 characters").max(17),
  reserve_price: z.number().min(1, "Reserve price must be positive"),
  transmission: z.enum(['manual', 'automatic']),
  fuel_type: z.string().nullable().optional(),
  engine_capacity: z.string().nullable().optional(),
  seat_material: z.string().nullable().optional(),
  is_damaged: z.boolean().nullable().optional(),
  service_history_type: z.string().nullable().optional(),
  number_of_keys: z.number().int().min(0).max(5),
  seller_notes: z.string().nullable().optional(),
  features: z.any().optional(),
  registration_number: z.string().nullable().optional(),
  has_outstanding_finance: z.boolean().nullable().optional(),
  finance_amount: z.number().min(0).optional(),
  is_selling_on_behalf: z.boolean().nullable().optional(),
  is_registered_in_poland: z.boolean().nullable().optional(),
  has_full_registration_document: z.boolean().nullable().optional(),
  has_service_history: z.boolean().nullable().optional(),
  valuation_data: z.any().optional(),
  finance_document_name: z.string().nullable().optional(),
  finance_document_url: z.string().nullable().optional(),
  finance_document_uploaded_at: z.string().nullable().optional(),
  // New vehicle history & specifications fields
  is_polish_origin: z.boolean().nullable().optional(),
  owners_count_poland: z.number().int().min(0).nullable().optional(),
  import_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  is_damaged_record_poland: z.boolean().nullable().optional(),
  is_damaged_record_abroad: z.boolean().nullable().optional(),
  is_accident_record_poland: z.boolean().nullable().optional(),
  is_accident_record_abroad: z.boolean().nullable().optional(),
  has_mileage_discrepancy: z.boolean().nullable().optional(),
  is_recorded_stolen: z.boolean().nullable().optional(),
  technical_inspection_valid_until: z.string().nullable().optional(),
  horsepower: z.number().int().min(0).nullable().optional(),
  first_registration_date: z.string().nullable().optional()
});

export const sellerInfoSchema = z.object({
  seller_name: z.string().min(1, "Name required"),
  mobile_number: z.string().regex(/^\+?[0-9\s-()]+$/, "Invalid phone format"),
  contact_email: z.string().email("Invalid email format").nullable().optional(),
  street_address: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  county: z.string().nullable().optional()
});

export type VehicleDetailsFormData = z.infer<typeof vehicleDetailsSchema>;
export type SellerInfoFormData = z.infer<typeof sellerInfoSchema>;

export interface CarEditFormData extends VehicleDetailsFormData, SellerInfoFormData {}

export interface CarImage {
  id: string;
  file_path: string;
  category: string;
  display_order: number;
  url: string;
}

export interface CarDocument {
  id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  category: string;
  display_order: number;
  url: string;
  uploaded_at: string;
  source: 'car_file_uploads' | 'manual_file_uploads';
}

export interface CarVideo {
  id: string;
  file_path: string;
  file_type: string;
  category: string;
  display_order: number;
  url: string;
  source: 'car_file_uploads' | 'manual_file_uploads';
}
