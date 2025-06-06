
// Define a type for verification status
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface DealerData {
  id: string;
  userId: string;
  supervisorName: string;
  dealershipName: string;
  taxId: string;
  businessRegistryNumber: string;
  address: string;
  licenseNumber: string;
  verification_status: VerificationStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  email?: string; // Add email field
}
