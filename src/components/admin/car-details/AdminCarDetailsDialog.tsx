
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Calendar, 
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface CarDetails {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin: string;
  status: string;
  seller_id: string;
  seller_name?: string;
  mobile_number?: string;
  address?: string;
  features?: any;
  is_damaged?: boolean;
  is_registered_in_poland?: boolean;
  has_private_plate?: boolean;
  finance_amount?: number;
  service_history_type?: string;
  seller_notes?: string;
  seat_material?: string;
  number_of_keys?: number;
  transmission?: string;
  required_photos?: any;
  additional_photos?: any;
  valuation_data?: any;
  created_at: string;
  updated_at: string;
  sellers?: {
    verification_status: string;
    is_verified: boolean;
    created_at: string;
  };
  car_file_uploads?: any[];
}

interface AdminCarDetailsDialogProps {
  car: CarDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCarDetailsDialog = ({ car, isOpen, onClose }: AdminCarDetailsDialogProps) => {
  if (!car) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: "bg-green-50 text-green-700 border-green-200", label: "Available" },
      sold: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Sold" },
      pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
      rejected: { color: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
      withdrawn: { color: "bg-gray-50 text-gray-700 border-gray-200", label: "Withdrawn" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getVerificationBadge = (isVerified: boolean, status: string) => {
    if (isVerified) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified Seller
      </Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
      <AlertCircle className="w-3 h-3 mr-1" />
      {status || 'Unverified'}
    </Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pl-PL').format(mileage) + ' km';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {car.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Make & Model</p>
                  <p className="font-semibold">{car.make} {car.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p className="font-semibold">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="font-semibold text-green-600">{formatPrice(car.price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mileage</p>
                  <p className="font-semibold">{formatMileage(car.mileage)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">VIN</p>
                  <p className="font-mono text-sm">
                    {typeof car.vin === 'string' ? car.vin : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                {getStatusBadge(car.status)}
              </div>
              
              {car.features && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Features</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(car.features).map(([key, value]) => (
                      value && <Badge key={key} variant="secondary" className="text-xs">{key.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Seller Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Seller Name</p>
                <p className="font-semibold">{car.seller_name || 'Unknown'}</p>
              </div>
              
              {car.mobile_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm">{car.mobile_number}</p>
                </div>
              )}
              
              {car.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm">{car.address}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Verification Status</p>
                {getVerificationBadge(
                  car.sellers?.is_verified || false, 
                  car.sellers?.verification_status || 'unverified'
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Seller Since</p>
                <p className="text-sm">
                  {car.sellers?.created_at ? new Date(car.sellers.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Condition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Vehicle Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Damaged</p>
                  <Badge variant={car.is_damaged ? "destructive" : "outline"}>
                    {car.is_damaged ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Registered in Poland</p>
                  <Badge variant={car.is_registered_in_poland ? "outline" : "secondary"}>
                    {car.is_registered_in_poland ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Private Plate</p>
                  <Badge variant={car.has_private_plate ? "outline" : "secondary"}>
                    {car.has_private_plate ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Number of Keys</p>
                  <p className="font-semibold">{car.number_of_keys || 'Not specified'}</p>
                </div>
              </div>
              
              {car.seat_material && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Seat Material</p>
                  <p className="font-semibold">{car.seat_material}</p>
                </div>
              )}
              
              {car.service_history_type && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Service History</p>
                  <p className="font-semibold">{car.service_history_type}</p>
                </div>
              )}
              
              {car.finance_amount && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Finance Amount</p>
                  <p className="font-semibold text-orange-600">{formatPrice(car.finance_amount)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images and Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {car.required_photos && Object.keys(car.required_photos).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Required Photos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(car.required_photos).map(([category, url]) => (
                      <div key={category} className="text-xs">
                        <Badge variant="outline" className="w-full justify-start">
                          {category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {car.additional_photos && car.additional_photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Additional Photos</p>
                  <Badge variant="secondary">{car.additional_photos.length} photos</Badge>
                </div>
              )}
              
              {car.car_file_uploads && car.car_file_uploads.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Uploaded Files</p>
                  <div className="space-y-1">
                    {car.car_file_uploads.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <FileText className="w-3 h-3" />
                        <span>{file.category || 'Document'}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.upload_status || 'completed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seller Notes */}
        {car.seller_notes && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Seller Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{car.seller_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Valuation Data */}
        {car.valuation_data && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valuation Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(car.valuation_data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-sm">{new Date(car.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm">{new Date(car.updated_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
