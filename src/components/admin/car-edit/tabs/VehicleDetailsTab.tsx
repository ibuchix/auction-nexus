import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

        <div>
          <Label htmlFor="horsepower">Horsepower (HP)</Label>
          <Input
            id="horsepower"
            type="number"
            value={formData.horsepower || ''}
            onChange={(e) => updateField('horsepower', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g., 184"
          />
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

        <div>
          <Label>Date of First Registration</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !formData.first_registration_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.first_registration_date ? (
                  format(new Date(formData.first_registration_date), "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.first_registration_date ? new Date(formData.first_registration_date) : undefined}
                onSelect={(date) => updateField('first_registration_date', date ? date.toISOString().split('T')[0] : null)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {formData.first_registration_date && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-xs"
              onClick={() => updateField('first_registration_date', null)}
            >
              Clear date
            </Button>
          )}
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Registration Status</Label>
            {formData.is_registered_in_poland === null ? (
              <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                ⚠️ Not Specified by Seller
              </Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_registered_in_poland"
                  checked={formData.is_registered_in_poland === true}
                  onCheckedChange={(checked) => updateField('is_registered_in_poland', checked)}
                />
                <Label htmlFor="is_registered_in_poland" className="cursor-pointer">
                  Registered in Poland
                </Label>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Full Registration Document</Label>
            {formData.has_full_registration_document === null ? (
              <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                ⚠️ Not Specified by Seller
              </Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_full_registration_document"
                  checked={formData.has_full_registration_document === true}
                  onCheckedChange={(checked) => updateField('has_full_registration_document', checked)}
                />
                <Label htmlFor="has_full_registration_document" className="cursor-pointer">
                  Has Full Registration Document
                </Label>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Service History</Label>
            {formData.has_service_history === null ? (
              <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                ⚠️ Not Specified by Seller
              </Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_service_history"
                  checked={formData.has_service_history === true}
                  onCheckedChange={(checked) => updateField('has_service_history', checked)}
                />
                <Label htmlFor="has_service_history" className="cursor-pointer">
                  Has Service History
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle History & Records Section */}
        <div className="col-span-2 mt-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Vehicle History & Records
          </h3>
        </div>

        <div className="col-span-2 p-4 border rounded-lg bg-muted/30 space-y-4">
          {/* Origin & Ownership */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Origin & Ownership</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Country of Origin</Label>
                <RadioGroup
                  value={formData.is_polish_origin === null ? '' : formData.is_polish_origin ? 'poland' : 'imported'}
                  onValueChange={(value) => updateField('is_polish_origin', value === 'poland' ? true : value === 'imported' ? false : null)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poland" id="origin-poland" />
                    <Label htmlFor="origin-poland" className="cursor-pointer">Poland</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imported" id="origin-imported" />
                    <Label htmlFor="origin-imported" className="cursor-pointer">Imported/Abroad</Label>
                  </div>
                </RadioGroup>
                {formData.is_polish_origin === null && (
                  <Badge variant="outline" className="mt-2 w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                    ⚠️ Not Specified
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="owners_count_poland">Number of Owners in Poland</Label>
                <Input
                  id="owners_count_poland"
                  type="number"
                  min={0}
                  value={formData.owners_count_poland ?? ''}
                  onChange={(e) => updateField('owners_count_poland', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            {formData.is_polish_origin === false && (
              <div className="max-w-xs">
                <Label htmlFor="import_year">Year of Import</Label>
                <Input
                  id="import_year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={formData.import_year ?? ''}
                  onChange={(e) => updateField('import_year', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 2022"
                />
              </div>
            )}
          </div>

          {/* History Records */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">History Records</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_damaged_record_poland"
                  checked={formData.is_damaged_record_poland === true}
                  onCheckedChange={(checked) => updateField('is_damaged_record_poland', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="is_damaged_record_poland" className="cursor-pointer text-sm">
                  Damaged record (Poland)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_damaged_record_abroad"
                  checked={formData.is_damaged_record_abroad === true}
                  onCheckedChange={(checked) => updateField('is_damaged_record_abroad', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="is_damaged_record_abroad" className="cursor-pointer text-sm">
                  Damaged record (Abroad)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_accident_record_poland"
                  checked={formData.is_accident_record_poland === true}
                  onCheckedChange={(checked) => updateField('is_accident_record_poland', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="is_accident_record_poland" className="cursor-pointer text-sm">
                  Accident record (Poland)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_accident_record_abroad"
                  checked={formData.is_accident_record_abroad === true}
                  onCheckedChange={(checked) => updateField('is_accident_record_abroad', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="is_accident_record_abroad" className="cursor-pointer text-sm">
                  Accident record (Abroad)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_mileage_discrepancy"
                  checked={formData.has_mileage_discrepancy === true}
                  onCheckedChange={(checked) => updateField('has_mileage_discrepancy', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="has_mileage_discrepancy" className="cursor-pointer text-sm">
                  Mileage discrepancy recorded
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recorded_stolen"
                  checked={formData.is_recorded_stolen === true}
                  onCheckedChange={(checked) => updateField('is_recorded_stolen', checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor="is_recorded_stolen" className="cursor-pointer text-sm text-destructive">
                  Recorded as stolen
                </Label>
              </div>
            </div>
          </div>

          {/* Technical Inspection */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Technical Inspection</h4>
            
            <div className="max-w-xs">
              <Label>Badanie Techniczne Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.technical_inspection_valid_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.technical_inspection_valid_until ? (
                      format(new Date(formData.technical_inspection_valid_until), "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.technical_inspection_valid_until ? new Date(formData.technical_inspection_valid_until) : undefined}
                    onSelect={(date) => updateField('technical_inspection_valid_until', date ? date.toISOString().split('T')[0] : null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.technical_inspection_valid_until && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => updateField('technical_inspection_valid_until', null)}
                >
                  Clear date
                </Button>
              )}
            </div>
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
          <Label className="text-muted-foreground">Seller's Acceptable Price (PLN)</Label>
          <div className="mt-1 p-2 bg-muted/50 rounded-md border">
            {formData.seller_acceptable_price != null ? (
              <span className="font-semibold text-primary">
                {formData.seller_acceptable_price.toLocaleString('pl-PL')} PLN
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">Not specified by seller</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The minimum price the seller will accept (read-only)
          </p>
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
          <Label htmlFor="engine_capacity">Engine Capacity</Label>
          <Input
            id="engine_capacity"
            value={formData.engine_capacity || ''}
            onChange={(e) => updateField('engine_capacity', e.target.value)}
            placeholder="e.g., 2.0L, 3000cc"
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
          <Label>Outstanding Finance Status</Label>
          {formData.has_outstanding_finance === null ? (
            <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 mt-2">
              ⚠️ Not Specified by Seller
            </Badge>
          ) : (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="has_outstanding_finance"
                checked={formData.has_outstanding_finance === true}
                onCheckedChange={(checked) => updateField('has_outstanding_finance', checked)}
              />
              <Label htmlFor="has_outstanding_finance" className="cursor-pointer">
                Has Outstanding Finance
              </Label>
            </div>
          )}
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
                id="has_service_history_status"
                checked={formData.has_service_history}
                disabled
              />
              <Label htmlFor="has_service_history_status" className="cursor-default">
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

        <div className="col-span-2">
          <Label>Selling on Behalf Status</Label>
          {formData.is_selling_on_behalf === null ? (
            <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 mt-2">
              ⚠️ Not Specified by Seller
            </Badge>
          ) : (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is_selling_on_behalf"
                checked={formData.is_selling_on_behalf === true}
                onCheckedChange={(checked) => updateField('is_selling_on_behalf', checked)}
              />
              <Label htmlFor="is_selling_on_behalf" className="cursor-pointer">
                Selling on behalf of someone else
              </Label>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <Label>Vehicle Condition Status</Label>
          {formData.is_damaged === null ? (
            <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 mt-2">
              ⚠️ Not Specified by Seller
            </Badge>
          ) : (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is_damaged"
                checked={formData.is_damaged === true}
                onCheckedChange={(checked) => updateField('is_damaged', checked)}
              />
              <Label htmlFor="is_damaged" className="cursor-pointer">
                Vehicle has damage
              </Label>
            </div>
          )}
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
          {errors.seller_notes && <p className="text-sm text-destructive mt-1">{errors.seller_notes}</p>}
        </div>
      </div>
    </div>
  );
}
