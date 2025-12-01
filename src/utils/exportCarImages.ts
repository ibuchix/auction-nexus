import JSZip from 'jszip';
import { CategorizedImage } from './imageUtils';

interface CarInfo {
  title: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
}

export async function exportCarImagesToZip(
  images: CategorizedImage[],
  carInfo: CarInfo,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  
  // Create a folder for the car images
  const folderName = carInfo.title?.replace(/[^a-z0-9]/gi, '_') || 'vehicle_images';
  const folder = zip.folder(folderName);
  
  if (!folder) {
    throw new Error('Failed to create ZIP folder');
  }

  // Add a text file with car details
  const detailsContent = `
Vehicle Details
===============
Title: ${carInfo.title || 'N/A'}
VIN: ${typeof carInfo.vin === 'string' ? carInfo.vin : 'N/A'}
Make: ${carInfo.make || 'N/A'}
Model: ${carInfo.model || 'N/A'}
Year: ${carInfo.year || 'N/A'}
Total Images: ${images.length}
Export Date: ${new Date().toLocaleString()}
  `.trim();
  
  folder.file('vehicle_details.txt', detailsContent);

  // Download and add each image to the ZIP
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    onProgress?.(i + 1, images.length);
    
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create filename with category and index
      const extension = getFileExtension(image.url) || 'jpg';
      const categoryName = image.category.replace(/[^a-z0-9]/gi, '_');
      const filename = `${String(i + 1).padStart(2, '0')}_${categoryName}.${extension}`;
      
      folder.file(filename, blob);
    } catch (error) {
      console.error(`Failed to fetch image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }

  // Generate and download the ZIP file
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}_images.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getFileExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
}
