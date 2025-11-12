import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImageCountProps {
  carId: string;
}

export function ImageCount({ carId }: ImageCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <ImageIcon className="h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <ImageIcon className="h-3 w-3" />
      {count === 0 ? 'No images' : `${count} image${count === 1 ? '' : 's'}`}
    </Badge>
  );
}
