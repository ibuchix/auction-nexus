import { useState } from "react";
import { Car, Upload, DollarSign, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { ManualValuationImages } from "./ManualValuationImages";

interface ManualValuationDialogProps {
  selectedValuation: ManualValuationData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservePrice: string;
  onReservePriceChange: (price: string) => void;
  isTransferring: boolean;
  isUpdating: boolean;
  onUpdateValuation: (data: any) => void;
  onTransferToCars: () => void;
}

export const ManualValuationDialog = ({
  selectedValuation,
  isOpen,
  onOpenChange,
  reservePrice,
  onReservePriceChange,
  isTransferring,
  isUpdating,
  onUpdateValuation,
  onTransferToCars,
}: ManualValuationDialogProps) => {
  const [editData, setEditData] = useState<any>({});

  if (!selectedValuation) return null;

  const handleUpdateField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (Object.keys(editData).length > 0) {
      onUpdateValuation(editData);
      setEditData({});
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "ready_for_transfer": return "bg-blue-100 text-blue-800";
      case "transferred": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Manual Valuation Details
            </DialogTitle>
            <Badge className={getStatusColor(selectedValuation.status)}>
              {selectedValuation.status || "Unknown"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Vehicle Details</TabsTrigger>
            <TabsTrigger value="images">Images ({selectedValuation.images?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={editData.make !== undefined ? editData.make : (selectedValuation.make || "")}
                  onChange={(e) => handleUpdateField("make", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={editData.model !== undefined ? editData.model : (selectedValuation.model || "")}
                  onChange={(e) => handleUpdateField("model", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={editData.year !== undefined ? editData.year : (selectedValuation.year || "")}
                  onChange={(e) => handleUpdateField("year", parseInt(e.target.value) || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={editData.mileage !== undefined ? editData.mileage : (selectedValuation.mileage || "")}
                  onChange={(e) => handleUpdateField("mileage", parseInt(e.target.value) || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={editData.vin !== undefined ? editData.vin : (selectedValuation.vin || "")}
                  onChange={(e) => handleUpdateField("vin", e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={editData.transmission !== undefined ? editData.transmission : (selectedValuation.transmission || "")}
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
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={editData.fuel_type !== undefined ? editData.fuel_type : (selectedValuation.fuel_type || "")}
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

            {/* Seller Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller_name">Seller Name</Label>
                <Input
                  id="seller_name"
                  value={editData.name !== undefined ? editData.name : (selectedValuation.name || "")}
                  onChange={(e) => handleUpdateField("name", e.target.value)}
                />
              </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={editData.contact_email !== undefined ? editData.contact_email : (selectedValuation.contact_email || "")}
                onChange={(e) => handleUpdateField("contact_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                value={editData.mobile_number !== undefined ? editData.mobile_number : (selectedValuation.mobile_number || selectedValuation.contact_phone || "")}
                onChange={(e) => handleUpdateField("mobile_number", e.target.value)}
              />
            </div>
              <div className="space-y-2">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                value={editData.street_address !== undefined ? editData.street_address : (selectedValuation.street_address || "")}
                onChange={(e) => handleUpdateField("street_address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="town">Town</Label>
              <Input
                id="town"
                value={editData.town !== undefined ? editData.town : (selectedValuation.town || "")}
                onChange={(e) => handleUpdateField("town", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={editData.postcode !== undefined ? editData.postcode : (selectedValuation.postcode || "")}
                onChange={(e) => handleUpdateField("postcode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={editData.county !== undefined ? editData.county : (selectedValuation.county || "")}
                onChange={(e) => handleUpdateField("county", e.target.value)}
              />
            </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editData.notes !== undefined ? editData.notes : (selectedValuation.notes || "")}
                onChange={(e) => handleUpdateField("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Reserve Price Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Set Reserve Price & Prepare Transfer
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="reserve_price">Reserve Price (PLN)</Label>
                  <Input
                    id="reserve_price"
                    type="number"
                    value={reservePrice}
                    onChange={(e) => onReservePriceChange(e.target.value)}
                    placeholder="Enter reserve price in PLN"
                  />
                </div>
                <Button 
                  onClick={onTransferToCars}
                  disabled={isTransferring || !reservePrice || selectedValuation.status === "transferred"}
                  className="mt-6"
                >
                  {isTransferring ? (
                    "Preparing..."
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Prepare for Transfer
                    </>
                  )}
                </Button>
              </div>
              {selectedValuation.status === "transferred" && (
                <p className="text-sm text-muted-foreground mt-2">
                  This valuation has already been transferred to the cars table.
                </p>
              )}
              {selectedValuation.status !== "transferred" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Prepare for Transfer" to review and finalize the car details before adding to the cars table.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="images">
            <ManualValuationImages images={selectedValuation.images || []} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleSaveChanges}
            disabled={isUpdating || Object.keys(editData).length === 0}
          >
            {isUpdating ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};