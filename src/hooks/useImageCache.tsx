import { CategorizedImage } from "@/utils/imageUtils";

// In-memory cache for signed URLs with expiry
const imageCache = new Map<string, { 
  urls: CategorizedImage[], 
  timestamp: number,
  expiresAt: number 
}>();

export function useImageCache() {
  const getCachedImages = (carId: string): CategorizedImage[] | null => {
    const cached = imageCache.get(carId);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[Image Cache] HIT for car ${carId}`);
      return cached.urls;
    }
    if (cached) {
      console.log(`[Image Cache] EXPIRED for car ${carId}`);
      imageCache.delete(carId);
    }
    return null;
  };

  const setCachedImages = (carId: string, urls: CategorizedImage[]) => {
    console.log(`[Image Cache] STORING ${urls.length} images for car ${carId}`);
    imageCache.set(carId, {
      urls,
      timestamp: Date.now(),
      expiresAt: Date.now() + (50 * 60 * 1000) // 50 minutes (signed URLs expire in 60)
    });
  };

  const clearCache = () => {
    console.log('[Image Cache] CLEARING all cached images');
    imageCache.clear();
  };

  const getCacheStats = () => {
    const now = Date.now();
    const validEntries = Array.from(imageCache.values()).filter(
      entry => now < entry.expiresAt
    ).length;
    return {
      totalEntries: imageCache.size,
      validEntries,
      expiredEntries: imageCache.size - validEntries
    };
  };

  return { 
    getCachedImages, 
    setCachedImages, 
    clearCache,
    getCacheStats 
  };
}
