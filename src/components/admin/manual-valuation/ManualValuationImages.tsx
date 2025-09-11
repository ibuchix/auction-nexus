import { useState } from "react";
import { Image as ImageIcon, Eye, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ManualValuationImage } from "@/hooks/useManualValuation";

interface ManualValuationImagesProps {
  images: ManualValuationImage[];
}

const getCategoryBadge = (category: string | null) => {
  if (!category) return null;
  
  const categoryNames: Record<string, string> = {
    exterior_front: "Exterior Front",
    exterior_rear: "Exterior Rear", 
    exterior_left: "Exterior Left",
    exterior_right: "Exterior Right",
    interior_front: "Interior Front",
    interior_rear: "Interior Rear",
    engine_bay: "Engine Bay",
    dashboard: "Dashboard",
    documents: "Documents",
    damage: "Damage",
    additional: "Additional"
  };

  return (
    <Badge variant="secondary" className="text-xs">
      {categoryNames[category] || category}
    </Badge>
  );
};

export function ManualValuationImages({ images }: ManualValuationImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No images available</p>
      </div>
    );
  }

  const getImageUrl = (filePath: string) => {
    return `https://sdvakfhmoaoucmhbhwvy.supabase.co/storage/v1/object/public/${filePath}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={getImageUrl(image.file_path)}
                  alt={`Manual valuation ${image.category || 'photo'}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage(getImageUrl(image.file_path))}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
                {image.category && (
                  <div className="absolute top-2 left-2">
                    {getCategoryBadge(image.category)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm text-muted-foreground">
                  Order: {image.display_order}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {image.file_type}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size view"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}