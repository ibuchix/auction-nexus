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
        const { count: imageCount } = await supabase
          .from('car_file_uploads')
          .select('*', { count: 'exact', head: true })
          .eq('car_id', carId)
          .eq('file_type', 'image');
        
        setCount(imageCount || 0);
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
