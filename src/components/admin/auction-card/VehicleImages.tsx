
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractAllCarImages, type CategorizedImage } from "@/utils/imageUtils";

interface VehicleImagesProps {
  images?: string[];
  car?: any; // For accessing all image sources
}

export function VehicleImages({ images, car }: VehicleImagesProps) {
  // Use the utility to get all images from all sources
  const allImages = car ? extractAllCarImages(car) : 
    (images || []).map((url, index) => ({ url, category: 'General', index }));
  
  if (!allImages.length) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
        <div className="text-sm text-muted-foreground">No images available</div>
      </div>
    );
  }
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage && imageIndex < allImages.length - 1) {
      setImageIndex(imageIndex + 1);
      setSelectedImage(allImages[imageIndex + 1].url);
    }
  };
  
  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage && imageIndex > 0) {
      setImageIndex(imageIndex - 1);
      setSelectedImage(allImages[imageIndex - 1].url);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Vehicle Images ({allImages.length})</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {allImages.map((image, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity relative"
                onClick={() => {
                  setSelectedImage(image.url);
                  setImageIndex(index);
                }}
              >
                <img
                  src={image.url}
                  alt={`${image.category} image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 left-1 text-xs bg-black/70 text-white"
                >
                  {image.category}
                </Badge>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
              <div className="relative h-full flex-1 flex items-center justify-center bg-black">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-black/50 text-white z-10"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {imageIndex > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute left-2 rounded-full bg-black/50 text-white z-10"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                
                {imageIndex < allImages.length - 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-2 rounded-full bg-black/50 text-white z-10"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
                
                <img
                  src={selectedImage || ''}
                  alt="Vehicle image full size"
                  className="max-h-[calc(90vh-2rem)] max-w-full object-contain"
                />
              </div>
              <div className="p-4 text-center bg-white">
                <p className="text-sm font-medium">
                  {allImages[imageIndex]?.category} - Image {imageIndex + 1} of {allImages.length}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
