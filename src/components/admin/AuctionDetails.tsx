import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Image, FileText, File, Eye } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Car = Database['public']['Tables']['cars']['Row'] & {
  car_file_uploads: Database['public']['Tables']['car_file_uploads']['Row'][];
};

interface AuctionDetailsProps {
  car: Car;
}

export function AuctionDetails({ car }: AuctionDetailsProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Images Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <Image className="h-4 w-4" />
          Images
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {car.images?.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <AspectRatio ratio={4/3}>
                <img 
                  src={image} 
                  alt={`Car image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </Card>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4" />
          Documents
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {car.car_file_uploads?.map((file, index) => (
            <Card key={index} className="p-3">
              <a 
                href={file.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-blue-600"
              >
                <File className="h-4 w-4" />
                {file.file_type}
              </a>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Details Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4" />
          Additional Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">VIN</p>
            <p className="text-sm text-gray-600">{car.vin}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Mileage</p>
            <p className="text-sm text-gray-600">{car.mileage?.toLocaleString()} km</p>
          </div>
          <div>
            <p className="text-sm font-medium">Registration</p>
            <p className="text-sm text-gray-600">{car.registration_number || 'N/A'}</p>
          </div>
          {car.features && (
            <div className="col-span-full">
              <p className="text-sm font-medium">Features</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(car.features as Record<string, boolean>)
                  .filter(([_, value]) => value)
                  .map(([key]) => (
                    <span 
                      key={key} 
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}