import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileArchive } from "lucide-react";
import { toast } from "sonner";
import { exportCarImagesToZip } from "@/utils/exportCarImages";
import { CategorizedImage, fetchCarImagesFromDatabase } from "@/utils/imageUtils";
import { useImageCache } from "@/hooks/useImageCache";

interface ExportImagesButtonProps {
  car: any;
  images?: CategorizedImage[];
}

export function ExportImagesButton({ car, images: providedImages }: ExportImagesButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { getCachedImages } = useImageCache();

  const handleExport = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: 0 });
    
    try {
      // Use provided images, cached images, or fetch new ones
      let images = providedImages;
      
      if (!images || images.length === 0) {
        if (car?.id) {
          images = getCachedImages(car.id);
          if (!images) {
            toast.info("Fetching images...");
            images = await fetchCarImagesFromDatabase(car.id);
          }
        }
      }

      if (!images || images.length === 0) {
        toast.error("No images available to export");
        return;
      }

      setProgress({ current: 0, total: images.length });

      await exportCarImagesToZip(
        images,
        {
          title: car.title,
          vin: typeof car.vin === 'string' ? car.vin : undefined,
          make: car.make,
          model: car.model,
          year: car.year,
        },
        (current, total) => setProgress({ current, total })
      );

      toast.success(`Successfully exported ${images.length} images to ZIP`);
    } catch (error) {
      console.error("Failed to export images:", error);
      toast.error("Failed to export images. Please try again.");
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress.total > 0 
            ? `${progress.current}/${progress.total}` 
            : 'Preparing...'}
        </>
      ) : (
        <>
          <FileArchive className="h-4 w-4" />
          Export ZIP
        </>
      )}
    </Button>
  );
}
