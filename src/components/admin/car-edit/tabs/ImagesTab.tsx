import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, GripVertical } from "lucide-react";
import type { CarImage } from "../types";

interface ImagesTabProps {
  images: CarImage[];
  isLoading: boolean;
  isUploading: boolean;
  uploadFile: (file: File, category: string, fileType: 'image') => Promise<boolean>;
  deleteFile: (fileId: string, filePath: string, source: 'car' | 'manual') => Promise<boolean>;
  reorderFiles: (images: CarImage[]) => Promise<boolean>;
}

export function ImagesTab({ images, isLoading, isUploading, uploadFile, deleteFile, reorderFiles }: ImagesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('exterior_front');
  const [deleteImageId, setDeleteImageId] = useState<{ id: string; path: string } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadFile(file, selectedCategory, 'image');
    }

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

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading images...</div>;
  }

  return (
    <div className="space-y-6">
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
                <SelectItem value="damage">Damage</SelectItem>
                <SelectItem value="general">General</SelectItem>
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
                  onClick={() => setDeleteImageId({ id: image.id, path: image.file_path })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2 bg-background">
                <p className="text-xs text-muted-foreground">
                  {image.category.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteImageId} onOpenChange={(open) => !open && setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently removed from the listing.
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
