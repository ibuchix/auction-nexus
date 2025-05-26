
import { Phone, User, Mail, Briefcase, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  sellerVerificationStatus?: {
    verification_status?: string;
    is_verified?: boolean;
  };
}

export function SellerInfo({ 
  seller, 
  mobileNumber, 
  dealerInfo, 
  address, 
  seller_name,
  sellerVerificationStatus 
}: SellerInfoProps) {
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

  const getVerificationBadge = () => {
    if (sellerVerificationStatus?.is_verified) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified Seller
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        {sellerVerificationStatus?.verification_status || 'Unverified'}
      </Badge>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2 flex items-center justify-between">
        Seller Information
        {sellerVerificationStatus && getVerificationBadge()}
      </h4>
      <div className="space-y-2">
        {displayName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{displayName}</span>
          </div>
        )}
        
        {mobileNumber && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm">{mobileNumber}</span>
          </div>
        )}
        
        {seller?.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm">{seller.email}</span>
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
            <span>Seller ID: {seller.id.slice(0, 8)}...</span>
          </div>
        )}
      </div>
    </div>
  );
}
