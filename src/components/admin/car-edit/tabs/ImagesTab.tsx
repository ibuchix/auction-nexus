import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, GripVertical, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CarImage, CarVideo } from "../types";

interface ImagesTabProps {
  images: CarImage[];
  videos: CarVideo[];
  isLoading: boolean;
  isLoadingVideos: boolean;
  isUploading: boolean;
  uploadFile: (file: File, category: string, fileType: 'image' | 'video') => Promise<boolean>;
  deleteFile: (fileId: string, filePath: string, source: 'car' | 'manual') => Promise<boolean>;
  reorderFiles: (images: CarImage[]) => Promise<boolean>;
}

export function ImagesTab({ images, videos, isLoading, isLoadingVideos, isUploading, uploadFile, deleteFile, reorderFiles }: ImagesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('exterior_front');
  const [deleteImageId, setDeleteImageId] = useState<{ id: string; path: string; type: 'image' | 'video' } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadFile(file, selectedCategory, 'image');
    }

    e.target.value = '';
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // File size validation (100MB limit for videos)
    const maxSizeMB = 100;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Video must be less than ${maxSizeMB}MB`,
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }
    
    await uploadFile(file, 'walkaround_video', 'video');
    e.target.value = '';
  };

  const handleDeleteConfirm = async () => {
    if (deleteImageId) {
      await deleteFile(deleteImageId.id, deleteImageId.path, 'car');
      setDeleteImageId(null);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    reorderFiles(newImages);
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading images...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Walkaround Video Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Walkaround Video</h3>
          </div>
          
          {/* Upload Video Button */}
          <Button asChild disabled={isUploading} variant="outline">
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : videos.length > 0 ? 'Replace Video' : 'Upload Video'}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.webm,.avi"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </label>
          </Button>
        </div>

        {isLoadingVideos ? (
          <div className="flex items-center justify-center py-4">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No walkaround video uploaded</p>
            <p className="text-sm text-muted-foreground mt-1">Upload a video to showcase the vehicle</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative group border rounded-lg overflow-hidden bg-muted">
                <video
                  src={video.url}
                  controls
                  className="w-full h-64 object-contain bg-black"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteImageId({ id: video.id, path: video.file_path, type: 'video' })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 bg-background">
                  <p className="text-sm font-medium">{formatCategory(video.category)}</p>
                  <p className="text-xs text-muted-foreground">{video.file_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="category">Image Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exterior_front">Exterior - Front</SelectItem>
                <SelectItem value="exterior_rear">Exterior - Rear</SelectItem>
                <SelectItem value="exterior_left">Exterior - Left</SelectItem>
                <SelectItem value="exterior_right">Exterior - Right</SelectItem>
                <SelectItem value="interior_front">Interior - Front</SelectItem>
                <SelectItem value="interior_rear">Interior - Rear</SelectItem>
                <SelectItem value="engine_bay">Engine Bay</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="rim_front_left">Rim - Front Left</SelectItem>
                <SelectItem value="rim_front_right">Rim - Front Right</SelectItem>
                <SelectItem value="rim_rear_left">Rim - Rear Left</SelectItem>
                <SelectItem value="rim_rear_right">Rim - Rear Right</SelectItem>
                <SelectItem value="additional_1">Additional 1</SelectItem>
                <SelectItem value="additional_2">Additional 2</SelectItem>
                <SelectItem value="additional_3">Additional 3</SelectItem>
                <SelectItem value="additional_4">Additional 4</SelectItem>
                <SelectItem value="additional_5">Additional 5</SelectItem>
                <SelectItem value="additional_6">Additional 6</SelectItem>
                <SelectItem value="additional_7">Additional 7</SelectItem>
                <SelectItem value="additional_8">Additional 8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button asChild disabled={isUploading}>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group border rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={`Vehicle ${image.category}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4 rotate-180" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === images.length - 1}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteImageId({ id: image.id, path: image.file_path, type: 'image' })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2 bg-background">
                <p className="text-xs text-muted-foreground">
                  {formatCategory(image.category)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteImageId} onOpenChange={(open) => !open && setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteImageId?.type === 'video' ? 'Video' : 'Image'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The {deleteImageId?.type === 'video' ? 'video' : 'image'} will be permanently removed from the listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
