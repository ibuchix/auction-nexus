import { useState, useEffect } from "react";
import { Image as ImageIcon, Eye, X, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ManualValuationImage, ManualValuationVideo } from "@/hooks/useManualValuation";
import { supabase } from "@/integrations/supabase/client";

interface ManualValuationImagesProps {
  images: ManualValuationImage[];
  videos?: ManualValuationVideo[];
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
    additional: "Additional",
    walkaround_video: "Walkaround Video"
  };

  return (
    <Badge variant="secondary" className="text-xs">
      {categoryNames[category] || category}
    </Badge>
  );
};

export function ManualValuationImages({ images, videos = [] }: ManualValuationImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [signedVideoUrls, setSignedVideoUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSignedUrls = async () => {
      if ((!images || images.length === 0) && (!videos || videos.length === 0)) {
        setIsLoading(false);
        return;
      }

      const urlMap: Record<string, string> = {};
      const videoUrlMap: Record<string, string> = {};
      
      // Generate signed URLs for images
      for (const image of images) {
        try {
          const paths = [
            image.file_path,
            image.file_path.startsWith('manual-valuations/') 
              ? image.file_path.replace('manual-valuations/', '')
              : `manual-valuations/${image.file_path}`
          ];

          let signedUrl = null;
          
          for (const path of paths) {
            try {
              const { data, error } = await supabase.storage
                .from('manual-valuation-photos')
                .createSignedUrl(path, 3600);

              if (!error && data) {
                signedUrl = data.signedUrl;
                break;
              }
            } catch (pathError) {
              console.log(`Path ${path} failed, trying next...`);
            }
          }

          if (signedUrl) {
            urlMap[image.id] = signedUrl;
          } else {
            console.error(`Failed to create signed URL for image ${image.id}`);
          }
        } catch (error) {
          console.error(`Error processing image ${image.id}:`, error);
        }
      }

      // Generate signed URLs for videos
      for (const video of videos) {
        try {
          const paths = [
            video.file_path,
            video.file_path.startsWith('manual-valuations/') 
              ? video.file_path.replace('manual-valuations/', '')
              : `manual-valuations/${video.file_path}`
          ];

          let signedUrl = null;
          
          for (const path of paths) {
            try {
              const { data, error } = await supabase.storage
                .from('manual-valuation-photos')
                .createSignedUrl(path, 3600);

              if (!error && data) {
                signedUrl = data.signedUrl;
                break;
              }
            } catch (pathError) {
              console.log(`Video path ${path} failed, trying next...`);
            }
          }

          if (signedUrl) {
            videoUrlMap[video.id] = signedUrl;
          } else {
            console.error(`Failed to create signed URL for video ${video.id}`);
          }
        } catch (error) {
          console.error(`Error processing video ${video.id}:`, error);
        }
      }

      setSignedUrls(urlMap);
      setSignedVideoUrls(videoUrlMap);
      setIsLoading(false);
    };

    generateSignedUrls();
  }, [images, videos]);

  if ((!images || images.length === 0) && (!videos || videos.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
        <p>No images or videos available</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 animate-pulse" />
        <p>Loading media...</p>
      </div>
    );
  }

  return (
    <>
      {/* Walkaround Video Section */}
      {videos && videos.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Walkaround Video</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => {
              const videoUrl = signedVideoUrls[video.id];
              return (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-64 object-contain bg-black"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3">
                      <Badge variant="secondary">Walkaround Video</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{video.file_type}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Images Section */}
      {images && images.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Photos ({images.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => {
              const imageUrl = signedUrls[image.id];
              
              return (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative group">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Manual valuation ${image.category || 'photo'}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {imageUrl && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedImage(imageUrl)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      
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
              );
            })}
          </div>
        </>
      )}

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
