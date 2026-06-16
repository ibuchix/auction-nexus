
// Define a type for verification status
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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
  email?: string;
  phoneNumber?: string;
  subscriptionStatus?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  subscriptionCancelAtPeriodEnd?: boolean;
}
