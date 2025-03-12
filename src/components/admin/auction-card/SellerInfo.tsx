
import { Phone, User, Mail, Briefcase } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SellerInfoProps {
  seller?: Profile;
  mobileNumber?: string;
  dealerInfo?: {
    dealership_name?: string;
    license_number?: string;
    business_registry_number?: string;
  };
}

export function SellerInfo({ seller, mobileNumber, dealerInfo }: SellerInfoProps) {
  if (!seller && !mobileNumber && !dealerInfo) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
        <div className="text-sm text-muted-foreground italic">No seller information available</div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm">{seller?.full_name || 'N/A'}</span>
        </div>
        {mobileNumber && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm">{mobileNumber}</span>
          </div>
        )}
        {dealerInfo?.dealership_name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm">{dealerInfo.dealership_name}</span>
          </div>
        )}
        {dealerInfo?.license_number && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm">License: {dealerInfo.license_number}</span>
          </div>
        )}
        {dealerInfo?.business_registry_number && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm">Business Reg: {dealerInfo.business_registry_number}</span>
          </div>
        )}
        {seller?.id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ID: {seller.id}</span>
          </div>
        )}
      </div>
    </div>
  );
}
