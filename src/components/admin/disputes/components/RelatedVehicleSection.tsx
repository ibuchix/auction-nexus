
import { Dispute } from "@/types/disputes";
import { Car } from "lucide-react";

interface RelatedVehicleSectionProps {
  dispute: Dispute;
}

export function RelatedVehicleSection({ dispute }: RelatedVehicleSectionProps) {
  if (!dispute.car_id) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-gray-400" />
        <h4 className="font-medium">Related Vehicle</h4>
      </div>
      <div className="pl-7 space-y-2">
        <p className="font-medium">
          {dispute.car_id.title || `${dispute.car_id.make} ${dispute.car_id.model} ${dispute.car_id.year}`}
        </p>
        {dispute.car_id.images && dispute.car_id.images.length > 0 && (
          <div className="mt-2">
            <img 
              src={dispute.car_id.images[0]} 
              alt="Vehicle" 
              className="w-full max-w-sm rounded-md object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
