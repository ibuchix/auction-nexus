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
import { BadgesTab } from "./tabs/BadgesTab";

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
    videos,
    isLoadingImages,
    isLoadingDocuments,
    isLoadingVideos,
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
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
            <FeaturesTab 
              features={formData.features || {}} 
              conditionQuestions={{
                ac_working: auction.ac_working ?? auction.acWorking ?? null,
                runs_smoothly: auction.runs_smoothly ?? auction.runsSmoothly ?? null,
                tires_legal_depth: auction.tires_legal_depth ?? auction.tiresLegalDepth ?? null,
                windows_working: auction.windows_working ?? auction.windowsWorking ?? null,
                has_dents: auction.has_dents ?? auction.hasDents ?? null,
                has_scratches: auction.has_scratches ?? auction.hasScratches ?? null,
                has_rust: auction.has_rust ?? auction.hasRust ?? null,
                has_interior_stains: auction.has_interior_stains ?? auction.hasInteriorStains ?? null,
                engine_faults: auction.engine_faults ?? auction.engineFaults ?? null,
                engine_smokes: auction.engine_smokes ?? auction.engineSmokes ?? null,
                gearbox_faults: auction.gearbox_faults ?? auction.gearboxFaults ?? null,
                electrical_faults: auction.electrical_faults ?? auction.electricalFaults ?? null,
                brakes_noisy: auction.brakes_noisy ?? auction.brakesNoisy ?? null,
                suspension_noisy: auction.suspension_noisy ?? auction.suspensionNoisy ?? null,
                warning_lights_on: auction.warning_lights_on ?? auction.warningLightsOn ?? null,
              }}
            />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <ImagesTab
              images={images}
              videos={videos}
              isLoading={isLoadingImages}
              isLoadingVideos={isLoadingVideos}
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
