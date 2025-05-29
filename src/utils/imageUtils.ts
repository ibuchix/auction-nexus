
export interface CategorizedImage {
  url: string;
  category: string;
  index: number;
}

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

export function getImageUrlsOnly(car: any): string[] {
  return extractAllCarImages(car).map(img => img.url);
}
