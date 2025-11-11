import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CarImage, CarDocument } from "../types";
import { isImageFile, isDocumentFile, getStorageBucket, extractFileName } from "@/utils/fileManagement";

export function useFileManagement(carId: string, sellerId: string) {
  const [images, setImages] = useState<CarImage[]>([]);
  const [documents, setDocuments] = useState<CarDocument[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!carId) return;
    
    setIsLoadingImages(true);
    setIsLoadingDocuments(true);
    
    try {
      // Use SECURITY DEFINER function to fetch car files (bypasses RLS for admins)
      const { data: carFilesResult, error: carFilesError } = await supabase
        .rpc('admin_get_car_files', { p_car_id: carId });
      
      if (carFilesError) throw carFilesError;
      
      const result = carFilesResult as { success: boolean; files?: any[]; error?: string };
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to fetch car files');
      }
      
      // Step 2: Get car's manual_valuation_id if it exists
      const { data: carData } = await supabase
        .from('cars')
        .select('valuation_data')
        .eq('id', carId)
        .single();
      
      const manualValuationId = carData?.valuation_data 
        ? (carData.valuation_data as any)?.manual_valuation_id 
        : null;
      
      // Step 3: Fetch from manual_file_uploads if applicable
      let manualFiles: any[] = [];
      if (manualValuationId) {
        const { data, error: manualFilesError } = await supabase
          .from('manual_file_uploads')
          .select('*')
          .eq('manual_valuation_id', manualValuationId)
          .eq('upload_status', 'completed')
          .order('display_order');
        
        if (manualFilesError) throw manualFilesError;
        manualFiles = data || [];
      }
      
      // Step 4: Combine car files from RPC with manual files
      const carFiles = result.files || [];
      const allFiles = [
        ...carFiles,
        ...manualFiles.map(f => ({ ...f, source: 'manual_file_uploads' as const }))
      ];
      
      const imagesList: CarImage[] = [];
      const documentsList: CarDocument[] = [];
      
      for (const file of allFiles) {
        const isImage = isImageFile(file.file_type, file.file_path);
        const isDoc = isDocumentFile(file.file_type, file.file_path);
        
        // Use signed URL from RPC for car files, or generate for manual files
        let signedUrl = file.signed_url;
        if (!signedUrl && file.source === 'manual_file_uploads') {
          const bucket = getStorageBucket(file.file_path, isDoc);
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(file.file_path, 3600);
          signedUrl = urlData?.signedUrl;
        }
        
        if (signedUrl) {
          if (isImage) {
            imagesList.push({
              id: file.id,
              file_path: file.file_path,
              category: file.category || 'general',
              display_order: file.display_order || 0,
              url: signedUrl
            });
          } else if (isDoc) {
            documentsList.push({
              id: file.id,
              file_path: file.file_path,
              file_type: file.file_type,
              file_name: extractFileName(file.file_path),
              category: file.category || 'other',
              display_order: file.display_order || 0,
              url: signedUrl,
              uploaded_at: file.created_at,
              source: file.source
            });
          }
        }
      }
      
      setImages(imagesList);
      setDocuments(documentsList);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error loading files",
        description: "Failed to load vehicle files",
        variant: "destructive"
      });
    } finally {
      setIsLoadingImages(false);
      setIsLoadingDocuments(false);
    }
  };

  const uploadFile = async (file: File, category: string, fileType: 'image' | 'document') => {
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const bucket = fileType === 'document' ? 'car-files' : 'car-images';
      const filePath = `${carId}/${category}/${timestamp}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const currentFiles = fileType === 'image' ? images : documents;
      const nextOrder = Math.max(0, ...currentFiles.map(f => f.display_order)) + 1;
      
      const { error: dbError } = await supabase
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
        title: `${fileType === 'image' ? 'Image' : 'Document'} uploaded`,
        description: "File added successfully"
      });

      await fetchFiles();
      return true;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: string, filePath: string, source: 'car' | 'manual') => {
    try {
      const tableName = source === 'car' ? 'car_file_uploads' : 'manual_file_uploads';
      
      const { error: dbError } = await supabase
        .from(tableName)
        .update({ 
          upload_status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Determine bucket and delete file
      const isDoc = isDocumentFile('', filePath);
      const bucket = getStorageBucket(filePath, isDoc);

      supabase.storage
        .from(bucket)
        .remove([filePath])
        .catch(console.error);

      toast({
        title: "File deleted",
        description: "File removed successfully"
      });

      await fetchFiles();
      return true;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive"
      });
      return false;
    }
  };

  const reorderFiles = async (reorderedFiles: (CarImage | CarDocument)[]) => {
    try {
      const updates = reorderedFiles.map((file, index) => 
        supabase
          .from('car_file_uploads')
          .update({ display_order: index })
          .eq('id', file.id)
      );

      await Promise.all(updates);

      toast({
        title: "Order updated",
        description: "File order saved successfully"
      });

      await fetchFiles();
      return true;
    } catch (error: any) {
      console.error('Error reordering files:', error);
      toast({
        title: "Reorder failed",
        description: error.message || "Failed to update file order",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [carId]);

  return {
    images,
    documents,
    isLoadingImages,
    isLoadingDocuments,
    isUploading,
    uploadFile,
    deleteFile,
    reorderFiles,
    refetch: fetchFiles
  };
}
