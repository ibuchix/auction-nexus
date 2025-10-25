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
  financeDocCount?: number;
  serviceHistoryDocCount?: number;
}

export function VehicleDetailsTab({ formData, errors, updateField, financeDocCount = 0, serviceHistoryDocCount = 0 }: VehicleDetailsTabProps) {
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

        <div className="col-span-2 mt-4">
          <h3 className="text-sm font-semibold mb-3">Registration & Documentation</h3>
        </div>

        <div>
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            value={formData.registration_number || ''}
            onChange={(e) => updateField('registration_number', e.target.value)}
            placeholder="e.g., ABC 1234"
          />
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_registered_in_poland"
              checked={formData.is_registered_in_poland}
              onCheckedChange={(checked) => updateField('is_registered_in_poland', checked)}
            />
            <Label htmlFor="is_registered_in_poland" className="cursor-pointer">
              Registered in Poland
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_private_plate"
              checked={formData.has_private_plate}
              onCheckedChange={(checked) => updateField('has_private_plate', checked)}
            />
            <Label htmlFor="has_private_plate" className="cursor-pointer">
              Has Private Plate
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_service_history"
              checked={formData.has_service_history}
              onCheckedChange={(checked) => updateField('has_service_history', checked)}
            />
            <Label htmlFor="has_service_history" className="cursor-pointer">
              Has Service History
            </Label>
          </div>
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

        <div className="col-span-2 mt-4">
          <h3 className="text-sm font-semibold mb-3">Finance Information</h3>
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_outstanding_finance"
              checked={formData.has_outstanding_finance}
              onCheckedChange={(checked) => updateField('has_outstanding_finance', checked)}
            />
            <Label htmlFor="has_outstanding_finance" className="cursor-pointer">
              Has Outstanding Finance
            </Label>
          </div>
        </div>

        {formData.has_outstanding_finance && (
          <>
            <div>
              <Label htmlFor="finance_amount">Finance Amount (PLN)</Label>
              <Input
                id="finance_amount"
                type="number"
                value={formData.finance_amount || 0}
                onChange={(e) => updateField('finance_amount', parseFloat(e.target.value) || 0)}
                placeholder="Outstanding finance amount"
              />
            </div>

            {formData.finance_document_name && (
              <div>
                <Label>Finance Document</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={formData.finance_document_name}
                    disabled
                    className="flex-1"
                  />
                  {formData.finance_document_url && (
                    <a
                      href={formData.finance_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
                {formData.finance_document_uploaded_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded: {new Date(formData.finance_document_uploaded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="col-span-2 mt-4">
          <h3 className="text-sm font-semibold mb-3">Documentation Status</h3>
        </div>

        <div className="col-span-2 p-4 border rounded-lg bg-muted/50 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_service_history"
                checked={formData.has_service_history}
                disabled
              />
              <Label htmlFor="has_service_history" className="cursor-default">
                Has Service History
              </Label>
            </div>
          </div>

          {(financeDocCount > 0 || serviceHistoryDocCount > 0) && (
            <div className="text-sm space-y-1 pt-2 border-t">
              <p className="font-medium text-muted-foreground">Uploaded Files:</p>
              {financeDocCount > 0 && (
                <p className="text-muted-foreground">📄 Finance Documents: {financeDocCount} {financeDocCount === 1 ? 'file' : 'files'}</p>
              )}
              {serviceHistoryDocCount > 0 && (
                <p className="text-muted-foreground">📋 Service History: {serviceHistoryDocCount} {serviceHistoryDocCount === 1 ? 'file' : 'files'}</p>
              )}
              <p className="text-xs text-muted-foreground pt-2">
                View all documents in the "Documents" tab above
              </p>
            </div>
          )}
        </div>

        <div className="col-span-2 mt-4">
          <h3 className="text-sm font-semibold mb-3">Other Details</h3>
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Checkbox
            id="is_selling_on_behalf"
            checked={formData.is_selling_on_behalf}
            onCheckedChange={(checked) => updateField('is_selling_on_behalf', checked)}
          />
          <Label htmlFor="is_selling_on_behalf" className="cursor-pointer">
            Selling on behalf of someone else
          </Label>
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
