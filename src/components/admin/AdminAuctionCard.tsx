
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuctionHeader } from "./auction-card/AuctionHeader";
import { EditForm } from "./auction-card/EditForm";
import { AuctionDetails } from "./auction-card/AuctionDetails";
import { SellerInfo } from "./auction-card/SellerInfo";
import { VehicleImages } from "./auction-card/VehicleImages";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  seller: Database['public']['Tables']['profiles']['Row'];
};

interface AdminAuctionCardProps {
  auction: Auction;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onStart?: (id: string) => Promise<void>;
}

export function AdminAuctionCard({ auction, onPause, onCancel, onStart }: AdminAuctionCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(auction.price?.toString() || "");
  const [editedNotes, setEditedNotes] = useState(auction.seller_notes || "");

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

  return (
    <Card className={`hover:shadow-md transition-shadow ${auction.is_damaged ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-2">
        <AuctionHeader
          title={auction.title}
          vin={auction.vin}
          isDamaged={auction.is_damaged}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onCancel={() => onCancel(auction.id)}
          onStart={auction.auction_status === 'ready' ? () => onStart?.(auction.id) : undefined}
          onPause={auction.auction_status === 'active' ? () => onPause(auction.id) : undefined}
          status={auction.auction_status}
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
