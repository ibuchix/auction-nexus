
// Define a type for verification status
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface DealerData {
  id: string;
  supervisor_name: string;
  dealership_name: string;
  tax_id: string;
  business_registry_number: string;
  address: string;
  license_number: string;
  verification_status: VerificationStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}
