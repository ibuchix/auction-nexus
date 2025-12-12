import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { CarImage, CarDocument, CarVideo } from "../types";
import { isImageFile, isDocumentFile, isVideoFile, getStorageBucket, extractFileName } from "@/utils/fileManagement";

export function useFileManagement(carId: string, sellerId: string) {
  const { user, session, isAdmin, isLoading: authLoading } = useAuth();
  const [images, setImages] = useState<CarImage[]>([]);
  const [documents, setDocuments] = useState<CarDocument[]>([]);
  const [videos, setVideos] = useState<CarVideo[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!carId) {
      console.log('[useFileManagement] No carId provided, skipping fetch');
      return;
    }

    // Wait for authentication to be ready
    if (authLoading) {
      console.log('[useFileManagement] Auth still loading, will retry when ready');
      return;
    }

    // Verify we have a valid session and admin status
    if (!session || !user || !isAdmin) {
      console.error('[useFileManagement] Missing auth requirements:', {
        hasSession: !!session,
        hasUser: !!user,
        isAdmin,
        userId: user?.id
      });
      toast({
        title: "Authentication required",
        description: "You must be logged in as an admin to fetch files",
        variant: "destructive"
      });
      setIsLoadingImages(false);
      setIsLoadingDocuments(false);
      return;
    }

    console.log('[useFileManagement] Auth verified, starting to fetch files for carId:', carId, {
      userId: user.id,
      hasSession: !!session,
      isAdmin,
      sessionAccessToken: session.access_token?.substring(0, 20) + '...'
    });
    
    setIsLoadingImages(true);
    setIsLoadingDocuments(true);
    setIsLoadingVideos(true);
    
    try {
      // Use SECURITY DEFINER function to fetch car files (bypasses RLS for admins)
      console.log('[useFileManagement] Calling admin_get_car_files RPC with session...');
      const { data: carFiles, error: carFilesError } = await supabase
        .rpc('admin_get_car_files', { p_car_id: carId });
      
      if (carFilesError) {
        console.error('[useFileManagement] RPC error:', carFilesError);
        throw carFilesError;
      }
      
      const carFilesArray = (carFiles || []) as any[];
      console.log('[useFileManagement] Successfully fetched car files:', carFilesArray.length);
      
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
      const allFiles = [
        ...carFilesArray,
        ...manualFiles.map(f => ({ ...f, source: 'manual_file_uploads' as const }))
      ];
      
      const imagesList: CarImage[] = [];
      const documentsList: CarDocument[] = [];
      const videosList: CarVideo[] = [];
      
      for (const file of allFiles) {
        const isImage = isImageFile(file.file_type, file.file_path);
        const isDoc = isDocumentFile(file.file_type, file.file_path);
        const isVideo = isVideoFile(file.file_type, file.file_path);
        
        // Generate signed URL if not already present
        let signedUrl = file.signed_url;
        if (!signedUrl) {
          // Videos are stored in car-images bucket like images
          const bucket = isDoc ? 'car-files' : 'car-images';
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
          } else if (isVideo) {
            videosList.push({
              id: file.id,
              file_path: file.file_path,
              file_type: file.file_type,
              category: file.category || 'walkaround_video',
              display_order: file.display_order || 0,
              url: signedUrl,
              source: file.source || 'car_file_uploads'
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
      setVideos(videosList);
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
      setIsLoadingVideos(false);
    }
  };

  const uploadFile = async (file: File, category: string, fileType: 'image' | 'document') => {
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const bucket = fileType === 'document' ? 'car-files' : 'car-images';
      const filePath = `${carId}/${category}/${timestamp}-${file.name}`;

      // First upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Calculate next display order
      const currentFiles = fileType === 'image' ? images : documents;
      const nextOrder = Math.max(0, ...currentFiles.map(f => f.display_order)) + 1;
      
      // Use RPC function to bypass RLS
      const { data: fileId, error: dbError } = await supabase
        .rpc('admin_upload_car_file', {
          p_car_id: carId,
          p_seller_id: sellerId,
          p_file_path: filePath,
          p_file_type: file.type,
          p_category: category,
          p_display_order: nextOrder
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
      
      // Use RPC function to bypass RLS
      const { error: dbError } = await supabase
        .rpc('admin_delete_car_file', {
          p_file_id: fileId,
          p_table_name: tableName
        });

      if (dbError) throw dbError;

      // Determine bucket and delete file from storage
      const isDoc = isDocumentFile('', filePath);
      const bucket = getStorageBucket(filePath, isDoc);

      // Delete from storage (async, don't wait)
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
      // Prepare files array for RPC
      const filesForUpdate = reorderedFiles.map((file, index) => ({
        id: file.id,
        display_order: index
      }));

      // Use RPC function to bypass RLS
      const { error } = await supabase
        .rpc('admin_reorder_car_files', {
          p_files: filesForUpdate
        });

      if (error) throw error;

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
    // Only fetch files when auth is ready and we have admin status
    if (!authLoading && isAdmin && session && carId) {
      console.log('[useFileManagement] useEffect triggered - fetching files');
      fetchFiles();
    } else {
      console.log('[useFileManagement] useEffect - conditions not met:', {
        authLoading,
        isAdmin,
        hasSession: !!session,
        carId
      });
    }
  }, [carId, authLoading, isAdmin, session]);

  return {
    images,
    documents,
    videos,
    isLoadingImages,
    isLoadingDocuments,
    isLoadingVideos,
    isUploading,
    uploadFile,
    deleteFile,
    reorderFiles,
    refetch: fetchFiles
  };
}
