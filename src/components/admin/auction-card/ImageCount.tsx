import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, FileArchive, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportCarImagesToZip } from "@/utils/exportCarImages";
import { fetchCarImagesFromDatabase } from "@/utils/imageUtils";

interface ImageCountProps {
  carId: string;
  car?: any;
}

export function ImageCount({ carId, car }: ImageCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchImageCount = async () => {
      try {
        // Use RPC function to bypass RLS (same as VehicleImages component)
        const { data: fileUploadsData, error } = await supabase
          .rpc('admin_get_car_files', { p_car_id: carId });
        
        if (error) {
          console.error('Error fetching image count:', error);
          setCount(0);
          return;
        }
        
        const fileUploads = (fileUploadsData as any[]) || [];
        const imageCount = fileUploads.filter(f => f.file_type?.startsWith('image/')).length;
        
        setCount(imageCount);
      } catch (error) {
        console.error('Error fetching image count:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageCount();
  }, [carId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const images = await fetchCarImagesFromDatabase(carId);
      
      if (!images || images.length === 0) {
        toast.error("No images available to export");
        return;
      }

      await exportCarImagesToZip(images, {
        title: car?.title || 'Vehicle',
        vin: typeof car?.vin === 'string' ? car.vin : undefined,
        make: car?.make,
        model: car?.model,
        year: car?.year,
      });

      toast.success(`Successfully exported ${images.length} images to ZIP`);
    } catch (error) {
      console.error("Failed to export images:", error);
      toast.error("Failed to export images");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <ImageIcon className="h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1">
        <ImageIcon className="h-3 w-3" />
        {count === 0 ? 'No images' : `${count} image${count === 1 ? '' : 's'}`}
      </Badge>
      
      {count && count > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="h-6 text-xs gap-1"
        >
          {isExporting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <FileArchive className="h-3 w-3" />
              Export ZIP
            </>
          )}
        </Button>
      )}
    </div>
  );
}
