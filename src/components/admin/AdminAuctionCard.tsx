
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuctionHeader } from "./auction-card/AuctionHeader";
import { EditForm } from "./auction-card/EditForm";
import { AuctionDetails } from "./auction-card/AuctionDetails";
import { SellerInfo } from "./auction-card/SellerInfo";
import { VehicleImages } from "./auction-card/VehicleImages";
import { Auction, AuctionStatus } from "@/types/auction";
import { useAuctionOperations } from "@/hooks/useAuctionOperations";

interface AdminAuctionCardProps {
  auction: Auction;
  onPause?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onStart?: (id: string) => Promise<void>;
  onExtendTime?: (id: string) => Promise<void>;
}

export function AdminAuctionCard({ auction, onPause, onCancel, onStart, onExtendTime }: AdminAuctionCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(auction.price?.toString() || "");
  const [editedNotes, setEditedNotes] = useState(auction.seller_notes || "");
  
  // Use the hook directly for any operations not passed as props
  const { pauseAuction, cancelAuction, startAuction, extendAuctionTime } = useAuctionOperations();

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({
          price: parseFloat(editedPrice),
          seller_notes: editedNotes
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
  const handlePause = onPause || (async () => await pauseAuction(auction.id));
  const handleCancel = onCancel || (async () => await cancelAuction(auction.id));
  const handleStart = onStart || (async () => await startAuction(auction.id));
  const handleExtendTime = onExtendTime || (async () => await extendAuctionTime(auction.id));

  return (
    <Card className={`hover:shadow-md transition-shadow ${auction.is_damaged ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-2">
        <AuctionHeader
          title={auction.title}
          vin={auction.vin}
          isDamaged={auction.is_damaged}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onCancel={handleCancel}
          onStart={auction.auction_status === 'ready' || auction.auction_status === 'paused' ? handleStart : undefined}
          onPause={auction.auction_status === 'active' ? handlePause : undefined}
          onExtendTime={auction.auction_status === 'active' ? handleExtendTime : undefined}
          status={auction.auction_status as AuctionStatus}
          startTime={auction.auction_start_time}
          endTime={auction.auction_end_time}
          isManuallyControlled={auction.is_manually_controlled}
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
              price={auction.price}
              endTime={auction.auction_end_time}
              notes={auction.seller_notes}
            />
          )}

          <SellerInfo
            seller={auction.seller}
            mobileNumber={auction.mobile_number}
          />

          <VehicleImages images={auction.images} />
        </div>
      </CardContent>
    </Card>
  );
}
