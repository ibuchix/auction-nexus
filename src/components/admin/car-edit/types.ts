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
  fuel_type: z.string().optional(),
  seat_material: z.string().optional(),
  is_damaged: z.boolean(),
  service_history_type: z.string().optional(),
  number_of_keys: z.number().int().min(0).max(5),
  seller_notes: z.string().optional(),
  features: z.any().optional(),
  registration_number: z.string().optional(),
  has_outstanding_finance: z.boolean().default(false),
  finance_amount: z.number().min(0).optional(),
  is_selling_on_behalf: z.boolean().default(false),
  is_registered_in_poland: z.boolean().default(true),
  has_full_registration_document: z.boolean().default(false),
  has_service_history: z.boolean().default(false),
  valuation_data: z.any().optional(),
  finance_document_name: z.string().optional(),
  finance_document_url: z.string().optional(),
  finance_document_uploaded_at: z.string().optional()
});

export const sellerInfoSchema = z.object({
  seller_name: z.string().min(1, "Name required"),
  mobile_number: z.string().regex(/^\+?[0-9\s-()]+$/, "Invalid phone format"),
  street_address: z.string().optional(),
  town: z.string().optional(),
  postcode: z.string().optional(),
  county: z.string().optional()
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
