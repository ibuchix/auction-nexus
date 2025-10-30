import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useCarEdit } from "./hooks/useCarEdit";
import { useFileManagement } from "./hooks/useFileManagement";
import { VehicleDetailsTab } from "./tabs/VehicleDetailsTab";
import { ImagesTab } from "./tabs/ImagesTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { SellerInfoTab } from "./tabs/SellerInfoTab";
import { FeaturesTab } from "./tabs/FeaturesTab";

interface AdminCarEditDialogProps {
  auction: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminCarEditDialog({ auction, isOpen, onClose, onSuccess }: AdminCarEditDialogProps) {
  const {
    formData,
    errors,
    isSaving,
    updateField,
    saveChanges
  } = useCarEdit(auction);

  const {
    images,
    documents,
    isLoadingImages,
    isLoadingDocuments,
    isUploading,
    uploadFile,
    deleteFile,
    reorderFiles
  } = useFileManagement(auction.id, auction.seller_id || auction.sellerId);

  const isActiveAuction = auction.auctionStatus === 'active' || auction.auction_status === 'active';

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Listing</DialogTitle>
          <DialogDescription>
            Update vehicle details, manage images, and edit seller information
          </DialogDescription>
        </DialogHeader>

        {isActiveAuction && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">Active Auction</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              This auction is currently live. Changes may affect active bidders.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="vehicle" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicle" className="mt-4">
            <VehicleDetailsTab
              formData={formData}
              errors={errors}
              updateField={updateField}
              financeDocCount={documents.filter(d => d.category === 'finance').length}
              serviceHistoryDocCount={documents.filter(d => d.category === 'service_history').length}
            />
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <FeaturesTab features={formData.features || {}} />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <ImagesTab
              images={images}
              isLoading={isLoadingImages}
              isUploading={isUploading}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              reorderFiles={reorderFiles}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DocumentsTab
              documents={documents}
              isLoading={isLoadingDocuments}
              isUploading={isUploading}
              uploadDocument={uploadFile}
              deleteDocument={deleteFile}
            />
          </TabsContent>

          <TabsContent value="seller" className="mt-4">
            <SellerInfoTab
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
