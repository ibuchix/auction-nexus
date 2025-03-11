
import { Phone, User } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SellerInfoProps {
  seller?: Profile;
  mobileNumber?: string;
}

export function SellerInfo({ seller, mobileNumber }: SellerInfoProps) {
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm">{seller?.full_name || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{mobileNumber || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
