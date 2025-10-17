
import { adminSupabase } from "@/integrations/supabase/adminClient";

export interface CategorizedImage {
  url: string;
  category: string;
  index: number;
}

// Legacy function for backward compatibility
export function extractAllCarImages(car: any): CategorizedImage[] {
  const allImages: CategorizedImage[] = [];
  let imageIndex = 0;

  // Extract from images array
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((url: string) => {
      allImages.push({
        url,
        category: 'General',
        index: imageIndex++
      });
    });
  }

  // Extract from required_photos object
  if (car.required_photos && typeof car.required_photos === 'object') {
    Object.entries(car.required_photos).forEach(([category, url]) => {
      if (typeof url === 'string' && url.trim()) {
        allImages.push({
          url: url as string,
          category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          index: imageIndex++
        });
      }
    });
  }

  // Extract from additional_photos array
  if (car.additional_photos && Array.isArray(car.additional_photos)) {
    car.additional_photos.forEach((url: string) => {
      if (typeof url === 'string' && url.trim()) {
        allImages.push({
          url,
          category: 'Additional',
          index: imageIndex++
        });
      }
    });
  }

  return allImages;
}

// New async function to fetch images from car_file_uploads table
export async function fetchCarImagesFromDatabase(carId: string): Promise<CategorizedImage[]> {
  if (!carId) return [];

  try {
    console.log('Fetching car images from database for car ID:', carId);
    
    const { data: fileUploads, error } = await adminSupabase
      .from('car_file_uploads')
      .select('*')
      .eq('car_id', carId)
      .eq('upload_status', 'completed')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching car file uploads:', error);
      return [];
    }

    if (!fileUploads || fileUploads.length === 0) {
      console.log('No file uploads found for car:', carId);
      return [];
    }

    console.log('Found file uploads:', fileUploads);

    // Create signed URLs for each image
    const imagesWithUrls: CategorizedImage[] = [];
    
    for (let i = 0; i < fileUploads.length; i++) {
      const upload = fileUploads[i];
      
      try {
        // Detect which bucket to use based on file path
        const bucket = upload.file_path.startsWith('manual-valuations/') 
          ? 'manual-valuation-photos' 
          : 'car-images';
        
        // Generate signed URL from appropriate storage bucket
        const { data: urlData, error: urlError } = await adminSupabase.storage
          .from(bucket)
          .createSignedUrl(upload.file_path, 3600); // 1 hour expiry

        if (urlError) {
          console.error(`[Image Fetch Error] Failed to create signed URL
            - File: ${upload.file_path}
            - Bucket: ${bucket}
            - Error: ${urlError.message}
            - Car ID: ${carId}
            - Upload ID: ${upload.id}`
          );
          
          // DON'T auto-delete - could be temporary issue or permission problem
          // Admin can manually mark as deleted if truly invalid
          continue;
        }

        if (urlData?.signedUrl) {
          imagesWithUrls.push({
            url: urlData.signedUrl,
            category: formatImageCategory(upload.category || 'General'),
            index: i
          });
        }
      } catch (urlErr) {
        console.error('Exception creating signed URL:', urlErr);
      }
    }

    console.log('Successfully created signed URLs for', imagesWithUrls.length, 'images');
    return imagesWithUrls;

  } catch (error) {
    console.error('Error in fetchCarImagesFromDatabase:', error);
    return [];
  }
}

// Helper function to format category names
function formatImageCategory(category: string): string {
  if (!category) return 'General';
  
  const categoryMap: { [key: string]: string } = {
    'exterior_front': 'Exterior Front',
    'exterior_rear': 'Exterior Rear', 
    'exterior_left': 'Exterior Left',
    'exterior_right': 'Exterior Right',
    'interior_front': 'Interior Front',
    'interior_rear': 'Interior Rear',
    'engine_bay': 'Engine Bay',
    'dashboard': 'Dashboard',
    'rim_front_left': 'Front Left Rim',
    'rim_front_right': 'Front Right Rim',
    'rim_rear_left': 'Rear Left Rim',
    'rim_rear_right': 'Rear Right Rim',
    'additional_1': 'Additional',
    'additional_2': 'Additional',
    'additional_3': 'Additional',
    'additional_4': 'Additional'
  };

  return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getImageUrlsOnly(car: any): string[] {
  return extractAllCarImages(car).map(img => img.url);
}
