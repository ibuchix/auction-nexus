import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { useToast } from "@/hooks/use-toast";
import type { CarImage } from "../types";

export function useImageManagement(carId: string, sellerId: string) {
  const [images, setImages] = useState<CarImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchImages = async () => {
    if (!carId) return;
    
    setIsLoading(true);
    try {
      const { data: fileUploads, error } = await adminSupabase
        .from('car_file_uploads')
        .select('*')
        .eq('car_id', carId)
        .eq('upload_status', 'completed')
        .order('display_order');

      if (error) throw error;

      if (fileUploads && fileUploads.length > 0) {
        const imagesWithUrls: CarImage[] = [];
        
        for (const upload of fileUploads) {
          const { data: urlData } = await adminSupabase.storage
            .from('car-images')
            .createSignedUrl(upload.file_path, 3600);

          if (urlData?.signedUrl) {
            imagesWithUrls.push({
              id: upload.id,
              file_path: upload.file_path,
              category: upload.category || 'general',
              display_order: upload.display_order || 0,
              url: urlData.signedUrl
            });
          }
        }
        
        setImages(imagesWithUrls);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error loading images",
        description: "Failed to load vehicle images",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, category: string) => {
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const filePath = `${carId}/${category}/${timestamp}-${file.name}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('car-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const nextOrder = Math.max(0, ...images.map(img => img.display_order)) + 1;
      
      const { error: dbError } = await adminSupabase
        .from('car_file_uploads')
        .insert({
          car_id: carId,
          seller_id: sellerId,
          file_path: filePath,
          file_type: file.type,
          category: category,
          display_order: nextOrder,
          upload_status: 'completed'
        });

      if (dbError) throw dbError;

      toast({
        title: "Image uploaded",
        description: "Image added successfully"
      });

      await fetchImages();
      return true;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageId: string, filePath: string) => {
    try {
      const { error: dbError } = await adminSupabase
        .from('car_file_uploads')
        .update({ 
          upload_status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId);

      if (dbError) throw dbError;

      adminSupabase.storage
        .from('car-images')
        .remove([filePath])
        .catch(console.error);

      toast({
        title: "Image deleted",
        description: "Image removed successfully"
      });

      await fetchImages();
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete image",
        variant: "destructive"
      });
      return false;
    }
  };

  const reorderImages = async (reorderedImages: CarImage[]) => {
    try {
      const updates = reorderedImages.map((img, index) => 
        adminSupabase
          .from('car_file_uploads')
          .update({ display_order: index })
          .eq('id', img.id)
      );

      await Promise.all(updates);

      toast({
        title: "Order updated",
        description: "Image order saved successfully"
      });

      await fetchImages();
      return true;
    } catch (error: any) {
      console.error('Error reordering images:', error);
      toast({
        title: "Reorder failed",
        description: error.message || "Failed to update image order",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchImages();
  }, [carId]);

  return {
    images,
    isLoading,
    isUploading,
    uploadImage,
    deleteImage,
    reorderImages,
    refetch: fetchImages
  };
}
