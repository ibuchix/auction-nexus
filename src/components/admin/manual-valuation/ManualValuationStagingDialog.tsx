import { useState, useEffect } from "react";
import { Car, Upload, DollarSign, ArrowRight, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { ManualValuationImages } from "./ManualValuationImages";

interface ManualValuationStagingDialogProps {
  selectedValuation: ManualValuationData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservePrice: string;
  onReservePriceChange: (price: string) => void;
  isTransferring: boolean;
  onConfirmTransfer: (carUpdates: any) => void;
  onCancel: () => void;
}

export const ManualValuationStagingDialog = ({
  selectedValuation,
  isOpen,
  onOpenChange,
  reservePrice,
  onReservePriceChange,
  isTransferring,
  onConfirmTransfer,
  onCancel,
}: ManualValuationStagingDialogProps) => {
  const [stagingData, setStagingData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (selectedValuation) {
      setStagingData({
        make: selectedValuation.make || "",
        model: selectedValuation.model || "",
        year: selectedValuation.year || "",
        mileage: selectedValuation.mileage || "",
        vin: selectedValuation.vin || "",
        transmission: selectedValuation.transmission || "",
        fuel_type: selectedValuation.fuel_type || "",
        notes: selectedValuation.notes || "",
        seller_notes: selectedValuation.seller_notes || "",
      });
    }
  }, [selectedValuation]);

  if (!selectedValuation) return null;

  const handleUpdateField = (field: string, value: any) => {
    setStagingData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      validateData({ ...stagingData, [field]: value });
    }
  };

  const validateData = (data: any = stagingData) => {
    const errors: string[] = [];

    if (!data.make || data.make.trim() === "") {
      errors.push("Make is required");
    }
    if (!data.model || data.model.trim() === "") {
      errors.push("Model is required");
    }
    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
      errors.push("Valid year is required");
    }
    if (!data.mileage || data.mileage < 0) {
      errors.push("Valid mileage is required");
    }
    if (!reservePrice || parseFloat(reservePrice) <= 0) {
      errors.push("Valid reserve price is required");
    }
    if (data.vin && data.vin.length > 0 && data.vin.length !== 17) {
      errors.push("VIN must be exactly 17 characters if provided");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleConfirmTransfer = () => {
    if (validateData()) {
      onConfirmTransfer(stagingData);
    }
  };

  const generatePreviewTitle = () => {
    const year = stagingData.year || selectedValuation.year;
    const make = stagingData.make || selectedValuation.make;
    const model = stagingData.model || selectedValuation.model;
    
    return `${year || ""} ${make?.toUpperCase() || "UNKNOWN"} ${model?.toUpperCase() || ""}`.trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Transfer Preview & Final Review
            </DialogTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Staging Mode
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Preview:</strong> {generatePreviewTitle()} will be created in the cars table with reserve price of {reservePrice ? `${reservePrice} PLN` : "TBD"}.
            </AlertDescription>
          </Alert>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Please fix the following issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Car Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staging_make">Make *</Label>
                  <Input
                    id="staging_make"
                    value={stagingData.make}
                    onChange={(e) => handleUpdateField("make", e.target.value)}
                    className={validationErrors.some(err => err.includes("Make")) ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_model">Model *</Label>
                  <Input
                    id="staging_model"
                    value={stagingData.model}
                    onChange={(e) => handleUpdateField("model", e.target.value)}
                    className={validationErrors.some(err => err.includes("Model")) ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_year">Year *</Label>
                  <Input
                    id="staging_year"
                    type="number"
                    value={stagingData.year}
                    onChange={(e) => handleUpdateField("year", parseInt(e.target.value) || "")}
                    className={validationErrors.some(err => err.includes("year")) ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_mileage">Mileage (km) *</Label>
                  <Input
                    id="staging_mileage"
                    type="number"
                    value={stagingData.mileage}
                    onChange={(e) => handleUpdateField("mileage", parseInt(e.target.value) || "")}
                    className={validationErrors.some(err => err.includes("mileage")) ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_vin">VIN</Label>
                  <Input
                    id="staging_vin"
                    value={stagingData.vin}
                    onChange={(e) => handleUpdateField("vin", e.target.value)}
                    className={`font-mono ${validationErrors.some(err => err.includes("VIN")) ? "border-red-500" : ""}`}
                    maxLength={17}
                  />
                  {stagingData.vin && stagingData.vin.length !== 17 && (
                    <p className="text-sm text-yellow-600">VIN should be 17 characters ({stagingData.vin.length}/17)</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_transmission">Transmission</Label>
                  <Select
                    value={stagingData.transmission}
                    onValueChange={(value) => handleUpdateField("transmission", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="cvt">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_fuel_type">Fuel Type</Label>
                  <Select
                    value={stagingData.fuel_type}
                    onValueChange={(value) => handleUpdateField("fuel_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Reserve Price */}
              <div className="space-y-4">
                <h4 className="font-semibold">Reserve Price *</h4>
                <div className="space-y-2">
                  <Label htmlFor="reserve_price">Reserve Price (PLN)</Label>
                  <Input
                    id="reserve_price"
                    type="number"
                    value={reservePrice}
                    onChange={(e) => onReservePriceChange(e.target.value)}
                    placeholder="Enter reserve price in PLN"
                    className={validationErrors.some(err => err.includes("reserve price")) ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-4">
                <h4 className="font-semibold">Notes & Comments</h4>
                <div className="space-y-2">
                  <Label htmlFor="staging_notes">Admin Notes</Label>
                  <Textarea
                    id="staging_notes"
                    value={stagingData.notes}
                    onChange={(e) => handleUpdateField("notes", e.target.value)}
                    rows={3}
                    placeholder="Add any admin notes about this valuation..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staging_seller_notes">Seller Notes</Label>
                  <Textarea
                    id="staging_seller_notes"
                    value={stagingData.seller_notes}
                    onChange={(e) => handleUpdateField("seller_notes", e.target.value)}
                    rows={2}
                    placeholder="Original seller notes..."
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Images & Seller Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images & Additional Information</h3>
              
              {/* Images */}
              <div className="space-y-2">
                <Label>Vehicle Images ({selectedValuation.images?.length || 0})</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <ManualValuationImages images={selectedValuation.images || []} />
                </div>
              </div>

              <Separator />

              {/* Seller Information (Read-only) */}
              <div className="space-y-4">
                <h4 className="font-semibold">Seller Information</h4>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <div><strong>Name:</strong> {selectedValuation.name || "N/A"}</div>
                  <div><strong>Email:</strong> {selectedValuation.contact_email || "N/A"}</div>
                  <div><strong>Mobile:</strong> {selectedValuation.mobile_number || selectedValuation.contact_phone || "N/A"}</div>
                  <div><strong>Address:</strong> {[
                    selectedValuation.street_address,
                    selectedValuation.town,
                    selectedValuation.postcode,
                    selectedValuation.county
                  ].filter(Boolean).join(', ') || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isTransferring}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => validateData()}
            >
              <Save className="mr-2 h-4 w-4" />
              Validate
            </Button>
          </div>
          <Button 
            onClick={handleConfirmTransfer}
            disabled={isTransferring || validationErrors.length > 0 || !reservePrice}
            className="bg-green-600 hover:bg-green-700"
          >
            {isTransferring ? (
              "Transferring..."
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Confirm Transfer to Cars Table
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};