
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { extractAllCarImages, fetchCarImagesFromDatabase, type CategorizedImage } from "@/utils/imageUtils";
import { useImageCache } from "@/hooks/useImageCache";

interface VehicleImagesProps {
  images?: string[];
  car?: any; // For accessing all image sources
}

export function VehicleImages({ images, car }: VehicleImagesProps) {
  const [allImages, setAllImages] = useState<CategorizedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showAllImages, setShowAllImages] = useState(false);
  const { getCachedImages, setCachedImages } = useImageCache();

  useEffect(() => {
    const loadImages = async () => {
      if (car?.id) {
        // Check cache first
        const cachedImages = getCachedImages(car.id);
        if (cachedImages) {
          console.log(`[VehicleImages] Using cached images for car ${car.id}`);
          setAllImages(cachedImages);
          return;
        }
        
        // For admin, fetch images from database using car ID
        setIsLoading(true);
        setError(null);
        
        try {
          const dbImages = await fetchCarImagesFromDatabase(car.id);
          
          if (dbImages.length > 0) {
            setAllImages(dbImages);
            setCachedImages(car.id, dbImages);
          } else {
            // Fallback to legacy method if no database images found
            const legacyImages = extractAllCarImages(car);
            setAllImages(legacyImages);
            setCachedImages(car.id, legacyImages);
          }
        } catch (err) {
          console.error('Error loading images:', err);
          setError('Failed to load images');
          // Fallback to legacy method on error
          const legacyImages = extractAllCarImages(car);
          setAllImages(legacyImages);
          setCachedImages(car.id, legacyImages);
        } finally {
          setIsLoading(false);
        }
      } else if (images) {
        // Use provided images array
        const imageList = images.map((url, index) => ({ url, category: 'General', index }));
        setAllImages(imageList);
      } else {
        setAllImages([]);
      }
    };

    loadImages();
  }, [car?.id, images, getCachedImages, setCachedImages]);

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

  if (isLoading) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading images...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }
  
  if (!allImages.length) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  // Progressive loading: show first 4 images initially
  const displayedImages = showAllImages ? allImages : allImages.slice(0, 4);
  const remainingCount = allImages.length - 4;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Vehicle Images ({allImages.length})</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {displayedImages.map((image, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity relative group aspect-[4/3] overflow-hidden rounded"
                style={{ minHeight: '128px', maxHeight: '128px' }}
                onClick={() => {
                  setSelectedImage(image.url);
                  setImageIndex(index);
                }}
              >
                {!loadedImages.has(index) && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded" />
                )}
                <img
                  src={image.url}
                  alt={`${image.category} image ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="200"
                  height="150"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
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
                  loading="eager"
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
      
      {/* Show "Load More Images" button if there are more than 4 images */}
      {!showAllImages && remainingCount > 0 && (
        <div className="text-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllImages(true)}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Show {remainingCount} more image{remainingCount !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
      
      {showAllImages && allImages.length > 4 && (
        <div className="text-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllImages(false)}
            className="text-xs"
          >
            Show less
          </Button>
        </div>
      )}
    </div>
  );
}
