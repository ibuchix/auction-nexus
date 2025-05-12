
import { Phone, User, Mail, Briefcase, MapPin } from "lucide-react";
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
  address?: string;
  seller_name?: string;
}

export function SellerInfo({ seller, mobileNumber, dealerInfo, address, seller_name }: SellerInfoProps) {
  if (!seller && !mobileNumber && !dealerInfo && !address && !seller_name) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
        <div className="text-sm text-muted-foreground italic">No seller information available</div>
      </div>
    );
  }

  // Display name from seller_name field if available, otherwise from seller profile
  const displayName = seller_name || seller?.full_name;

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
      <div className="space-y-2">
        {displayName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm">{displayName}</span>
          </div>
        )}
        
        {mobileNumber && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm">{mobileNumber}</span>
          </div>
        )}
        
        {address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">{address}</span>
          </div>
        )}
        
        {dealerInfo?.dealership_name && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
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
