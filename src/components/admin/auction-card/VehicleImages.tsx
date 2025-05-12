
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleImagesProps {
  images?: string[];
}

export function VehicleImages({ images }: VehicleImagesProps) {
  if (!images?.length) return null;
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage && imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
      setSelectedImage(images[imageIndex + 1]);
    }
  };
  
  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage && imageIndex > 0) {
      setImageIndex(imageIndex - 1);
      setSelectedImage(images[imageIndex - 1]);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Vehicle Images ({images.length})</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.map((image, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setSelectedImage(image);
                  setImageIndex(index);
                }}
              >
                <img
                  src={image}
                  alt={`Vehicle image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
              <div className="relative h-full flex-1 flex items-center justify-center bg-black">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-black/50 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {imageIndex > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute left-2 rounded-full bg-black/50 text-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                
                {imageIndex < images.length - 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-2 rounded-full bg-black/50 text-white"
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
                  Image {imageIndex + 1} of {images.length}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
