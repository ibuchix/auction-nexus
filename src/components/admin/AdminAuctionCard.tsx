
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuctionHeader } from "./auction-card/AuctionHeader";
import { EditForm } from "./auction-card/EditForm";
import { AuctionDetails } from "./auction-card/AuctionDetails";
import { SellerInfo } from "./auction-card/SellerInfo";
import { VehicleImages } from "./auction-card/VehicleImages";
import { AuctionStatus } from "@/types/auction";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";
import { AuctionDetails as AuctionDetailsView } from "@/components/admin/AuctionDetails";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateCarTitle, isGenericTitle } from "@/utils/carTitleGenerator";
import { AdminCarEditDialog } from "./car-edit";

interface AdminAuctionCardProps {
  auction: any;
  allowEdit?: boolean;
  onPause?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onStart?: (id: string) => Promise<void>;
  onExtendTime?: (id: string) => Promise<void>;
  onScheduleClick?: (auction: any) => void;
  onSuccess?: () => void;
  autoLoadImages?: boolean; // Whether to auto-load images
}

export function AdminAuctionCard({ 
  auction,
  allowEdit = true,
  onPause, 
  onCancel, 
  onStart, 
  onExtendTime,
  onScheduleClick,
  onSuccess,
  autoLoadImages = true
}: AdminAuctionCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPrice, setEditedPrice] = useState(auction.price?.toString() || "");
  const [editedNotes, setEditedNotes] = useState(auction.sellerNotes || "");
  
  // Use the hook directly for any operations not passed as props
  const { pauseAuction, cancelAuction, startAuction, extendAuctionTime } = useAuctionOperations();

  const handleSaveChanges = async () => {
    try {
      // Generate proper title if current title is generic
      let updatedTitle = auction.title;
      if (isGenericTitle(auction.title) && auction.make && auction.model && auction.year) {
        updatedTitle = generateCarTitle(auction.make, auction.model, auction.year);
      }

      const { error } = await supabase
        .from('cars')
        .update({
          reserve_price: parseFloat(editedPrice),
          seller_notes: editedNotes,
          title: updatedTitle
        })
        .eq('id', auction.id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "The listing has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  // Determine which function to use for each action
  const handlePause = async () => onPause ? await onPause(auction.id) : await pauseAuction(auction.id);
  const handleCancel = async () => onCancel ? await onCancel(auction.id) : await cancelAuction(auction.id);
  const handleStart = async () => onStart ? await onStart(auction.id) : await startAuction(auction.id);
  const handleExtendTime = async () => onExtendTime ? await onExtendTime(auction.id) : await extendAuctionTime(auction.id);
  const handleScheduleClick = () => onScheduleClick ? onScheduleClick(auction) : undefined;

  // Get proper pricing from valuation data if available
  const reservePrice = auction.valuationData?.reservePrice || auction.reservePrice;

  // Generate display title if current title is generic
  const displayTitle = isGenericTitle(auction.title) && auction.make && auction.model && auction.year
    ? generateCarTitle(auction.make, auction.model, auction.year)
    : auction.title;

  return (
    <Card className={`hover:shadow-md transition-shadow ${auction.isDamaged ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-2">
        <AuctionHeader
          title={displayTitle}
          vin={auction.vin}
          isDamaged={auction.isDamaged}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onOpenEditDialog={allowEdit ? () => setIsEditDialogOpen(true) : undefined}
          onCancel={handleCancel}
          onStart={auction.auctionStatus === 'ready' || auction.auctionStatus === 'paused' ? handleStart : undefined}
          onPause={auction.auctionStatus === 'active' ? handlePause : undefined}
          onExtendTime={auction.auctionStatus === 'active' ? handleExtendTime : undefined}
          onScheduleClick={onScheduleClick ? handleScheduleClick : undefined}
          status={auction.auctionStatus as AuctionStatus}
          startTime={auction.auctionStartTime}
          endTime={auction.auctionEndTime}
          isManuallyControlled={auction.isManuallyControlled}
          listedDate={auction.createdAt}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <EditForm
              price={editedPrice}
              notes={editedNotes}
              onPriceChange={setEditedPrice}
              onNotesChange={setEditedNotes}
              onSave={handleSaveChanges}
            />
          ) : (
            <AuctionDetails
              price={auction.reservePrice || auction.price}
              endTime={auction.auctionEndTime}
              notes={auction.sellerNotes}
              reservePrice={reservePrice}
              valuation_data={auction.valuationData}
              createdAt={auction.createdAt}
            />
          )}

          <SellerInfo
            seller={auction.seller}
            mobileNumber={auction.mobileNumber}
            address={auction.address}
            seller_name={auction.sellerName}
            sellerEmail={auction.sellerEmail}
          />

          <VehicleImages car={auction} autoLoad={autoLoadImages} />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-semibold">View Full Vehicle Details</AccordionTrigger>
              <AccordionContent>
                <Separator className="my-2" />
                <AuctionDetailsView car={auction} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>

      <AdminCarEditDialog
        auction={auction}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          onSuccess?.();
        }}
      />
    </Card>
  );
}
