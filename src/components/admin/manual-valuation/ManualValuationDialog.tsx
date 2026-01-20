import { useState, useEffect } from "react";
import { Car, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualValuationData } from "@/hooks/useManualValuation";
import { ManualValuationImages } from "./ManualValuationImages";
import { ManualValuationFinancial } from "./ManualValuationFinancial";
import { ManualValuationFeatures } from "./ManualValuationFeatures";

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

  // Clear edit data when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEditData({});
    }
  }, [isOpen]);

  // Clear edit data when valuation updates (after successful save)
  useEffect(() => {
    if (selectedValuation) {
      setEditData({});
    }
  }, [selectedValuation?.updated_at]);

  if (!selectedValuation) return null;

  const handleUpdateField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (Object.keys(editData).length > 0) {
      onUpdateValuation(editData);
      // Don't clear editData here - let the useEffect handle it after refetch
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Vehicle Details</TabsTrigger>
            <TabsTrigger value="financial">Financial & Docs</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
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
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={editData.registration_number !== undefined ? editData.registration_number : (selectedValuation.registration_number || "")}
                  onChange={(e) => handleUpdateField("registration_number", e.target.value)}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_registration_date">Date of First Registration</Label>
                <Input
                  id="first_registration_date"
                  type="date"
                  value={editData.first_registration_date !== undefined ? editData.first_registration_date : (selectedValuation.first_registration_date || "")}
                  onChange={(e) => handleUpdateField("first_registration_date", e.target.value || null)}
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
              <div className="space-y-2">
                <Label htmlFor="seat_material">Seat Material</Label>
                <Select
                  value={editData.seat_material !== undefined ? editData.seat_material : (selectedValuation.seat_material || selectedValuation.valuation_result?.seat_material || "")}
                  onValueChange={(value) => handleUpdateField("seat_material", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seat material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fabric">Fabric</SelectItem>
                    <SelectItem value="leather">Leather</SelectItem>
                    <SelectItem value="synthetic">Synthetic</SelectItem>
                    <SelectItem value="alcantara">Alcantara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vehicle Condition & Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vehicle Condition & Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Vehicle Condition</Label>
                    {selectedValuation.is_damaged === null ? (
                      <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        ⚠️ Not Specified by Seller
                      </Badge>
                    ) : selectedValuation.is_damaged ? (
                      <Badge variant="destructive" className="w-fit">
                        ⚠️ Vehicle is Damaged
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        ✓ No Damage Reported
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Registration Document</Label>
                    {selectedValuation.has_full_registration_document === null ? (
                      <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        ⚠️ Not Specified by Seller
                      </Badge>
                    ) : selectedValuation.has_full_registration_document ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 w-fit">
                        ✓ Full Registration Document
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">
                        ⚠️ No Full Registration
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Registration Status</Label>
                    {selectedValuation.is_registered_in_poland === null ? (
                      <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        ⚠️ Not Specified by Seller
                      </Badge>
                    ) : selectedValuation.is_registered_in_poland ? (
                      <Badge className="w-fit">Registered in Poland</Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">Not Registered in Poland</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Number of Keys</Label>
                    <div className="text-sm font-medium">
                      {selectedValuation.number_of_keys || 'Not specified'} key(s)
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Service History</Label>
                    <Badge variant={
                      selectedValuation.service_history_type === 'full' ? 'default' :
                      selectedValuation.service_history_type === 'partial' ? 'secondary' :
                      'outline'
                    } className="w-fit">
                      {selectedValuation.service_history_type || 'None'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Documentation Available</Label>
                    {selectedValuation.has_documentation ? (
                      <Badge className="w-fit">✓ Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">No</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Selling on Behalf</Label>
                    {selectedValuation.is_selling_on_behalf === null ? (
                      <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        ⚠️ Not Specified by Seller
                      </Badge>
                    ) : selectedValuation.is_selling_on_behalf ? (
                      <Badge variant="secondary" className="w-fit">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">No</Badge>
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </Card>

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

            {/* Reserve Price */}
            <div className="space-y-2">
              <Label htmlFor="reserve_price">Reserve Price (PLN)</Label>
              <Input
                id="reserve_price"
                type="number"
                value={editData.reserve_price !== undefined ? editData.reserve_price : (reservePrice || "")}
                onChange={(e) => {
                  const value = e.target.value;
                  handleUpdateField("reserve_price", value ? parseFloat(value) : null);
                  onReservePriceChange(value);
                }}
                placeholder="Enter reserve price in PLN"
              />
            </div>

            {/* Seller Notes (editable by admin) */}
            <div className="space-y-2">
              <Label htmlFor="seller_notes">
                Seller Notes
                <span className="text-xs text-muted-foreground ml-2">
                  (Editable by admin)
                </span>
              </Label>
              <Textarea
                id="seller_notes"
                value={editData.seller_notes !== undefined ? editData.seller_notes : (selectedValuation.seller_notes || "")}
                onChange={(e) => handleUpdateField("seller_notes", e.target.value)}
                rows={4}
                placeholder="Seller's notes about the vehicle..."
              />
            </div>

            {/* Prepare Transfer Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Prepare for Transfer
              </h3>
              <Button 
                onClick={onTransferToCars}
                disabled={isTransferring || !reservePrice || selectedValuation.status === "transferred"}
                className="w-full"
              >
                {isTransferring ? (
                  "Preparing..."
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Prepare for Transfer to Cars Table
                  </>
                )}
              </Button>
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

          <TabsContent value="financial">
            <ManualValuationFinancial valuation={selectedValuation} />
          </TabsContent>

          <TabsContent value="features">
            <ManualValuationFeatures valuation={selectedValuation} />
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