import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CarEditFormData } from "../types";

interface SellerInfoTabProps {
  formData: CarEditFormData;
  errors: Record<string, string>;
  updateField: (field: keyof CarEditFormData, value: any) => void;
}

export function SellerInfoTab({ formData, errors, updateField }: SellerInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="seller_name">Seller Name *</Label>
          <Input
            id="seller_name"
            value={formData.seller_name}
            onChange={(e) => updateField('seller_name', e.target.value)}
            placeholder="Full name"
          />
          {errors.seller_name && <p className="text-sm text-destructive mt-1">{errors.seller_name}</p>}
        </div>

        <div className="col-span-2">
          <Label htmlFor="mobile_number">Mobile Number *</Label>
          <Input
            id="mobile_number"
            value={formData.mobile_number}
            onChange={(e) => updateField('mobile_number', e.target.value)}
            placeholder="+48 123 456 789"
          />
          {errors.mobile_number && <p className="text-sm text-destructive mt-1">{errors.mobile_number}</p>}
        </div>

        <div className="col-span-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => updateField('contact_email', e.target.value)}
            placeholder="email@example.com"
          />
          {errors.contact_email && <p className="text-sm text-destructive mt-1">{errors.contact_email}</p>}
        </div>

        <div className="col-span-2">
          <Label htmlFor="street_address">Street Address</Label>
          <Input
            id="street_address"
            value={formData.street_address || ''}
            onChange={(e) => updateField('street_address', e.target.value)}
            placeholder="Street name and number"
          />
        </div>

        <div>
          <Label htmlFor="town">Town/City</Label>
          <Input
            id="town"
            value={formData.town || ''}
            onChange={(e) => updateField('town', e.target.value)}
            placeholder="City name"
          />
        </div>

        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            value={formData.postcode || ''}
            onChange={(e) => updateField('postcode', e.target.value)}
            placeholder="00-000"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="county">County/Region</Label>
          <Input
            id="county"
            value={formData.county || ''}
            onChange={(e) => updateField('county', e.target.value)}
            placeholder="County or region"
          />
        </div>
      </div>
    </div>
  );
}
