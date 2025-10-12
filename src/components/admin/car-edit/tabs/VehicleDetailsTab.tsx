import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { CarEditFormData } from "../types";

interface VehicleDetailsTabProps {
  formData: CarEditFormData;
  errors: Record<string, string>;
  updateField: (field: keyof CarEditFormData, value: any) => void;
}

export function VehicleDetailsTab({ formData, errors, updateField }: VehicleDetailsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., 2020 BMW 3 Series"
          />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => updateField('make', e.target.value)}
            placeholder="e.g., BMW"
          />
          {errors.make && <p className="text-sm text-destructive mt-1">{errors.make}</p>}
        </div>

        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => updateField('model', e.target.value)}
            placeholder="e.g., 3 Series"
          />
          {errors.model && <p className="text-sm text-destructive mt-1">{errors.model}</p>}
        </div>

        <div>
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => updateField('year', parseInt(e.target.value) || 0)}
            placeholder="e.g., 2020"
          />
          {errors.year && <p className="text-sm text-destructive mt-1">{errors.year}</p>}
        </div>

        <div>
          <Label htmlFor="mileage">Mileage (km) *</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
            placeholder="e.g., 50000"
          />
          {errors.mileage && <p className="text-sm text-destructive mt-1">{errors.mileage}</p>}
        </div>

        <div>
          <Label htmlFor="vin">VIN *</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => updateField('vin', e.target.value)}
            placeholder="Vehicle Identification Number"
          />
          {errors.vin && <p className="text-sm text-destructive mt-1">{errors.vin}</p>}
        </div>

        <div>
          <Label htmlFor="reserve_price">Reserve Price (PLN) *</Label>
          <Input
            id="reserve_price"
            type="number"
            value={formData.reserve_price}
            onChange={(e) => updateField('reserve_price', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 50000"
          />
          {errors.reserve_price && <p className="text-sm text-destructive mt-1">{errors.reserve_price}</p>}
        </div>

        <div>
          <Label htmlFor="transmission">Transmission *</Label>
          <Select
            value={formData.transmission}
            onValueChange={(value) => updateField('transmission', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
            </SelectContent>
          </Select>
          {errors.transmission && <p className="text-sm text-destructive mt-1">{errors.transmission}</p>}
        </div>

        <div>
          <Label htmlFor="fuel_type">Fuel Type</Label>
          <Input
            id="fuel_type"
            value={formData.fuel_type || ''}
            onChange={(e) => updateField('fuel_type', e.target.value)}
            placeholder="e.g., Petrol, Diesel"
          />
        </div>

        <div>
          <Label htmlFor="seat_material">Seat Material</Label>
          <Input
            id="seat_material"
            value={formData.seat_material || ''}
            onChange={(e) => updateField('seat_material', e.target.value)}
            placeholder="e.g., Leather, Fabric"
          />
        </div>

        <div>
          <Label htmlFor="service_history_type">Service History Type</Label>
          <Input
            id="service_history_type"
            value={formData.service_history_type || ''}
            onChange={(e) => updateField('service_history_type', e.target.value)}
            placeholder="e.g., Full, Partial"
          />
        </div>

        <div>
          <Label htmlFor="number_of_keys">Number of Keys *</Label>
          <Input
            id="number_of_keys"
            type="number"
            value={formData.number_of_keys}
            onChange={(e) => updateField('number_of_keys', parseInt(e.target.value) || 1)}
            min={0}
            max={5}
          />
          {errors.number_of_keys && <p className="text-sm text-destructive mt-1">{errors.number_of_keys}</p>}
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_damaged"
              checked={formData.is_damaged}
              onCheckedChange={(checked) => updateField('is_damaged', checked)}
            />
            <Label htmlFor="is_damaged" className="cursor-pointer">
              Vehicle has damage
            </Label>
          </div>
        </div>

        <div className="col-span-2">
          <Label htmlFor="seller_notes">Seller Notes</Label>
          <Textarea
            id="seller_notes"
            value={formData.seller_notes || ''}
            onChange={(e) => updateField('seller_notes', e.target.value)}
            placeholder="Additional notes about the vehicle..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
