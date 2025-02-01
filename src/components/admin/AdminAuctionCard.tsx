import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/integrations/supabase/types";
import { AlertTriangle, Ban, Clock, DollarSign, Edit2, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Auction = Database['public']['Tables']['cars']['Row'] & {
  bids: Database['public']['Tables']['bids']['Row'][];
  seller: Database['public']['Tables']['profiles']['Row'];
};

interface AdminAuctionCardProps {
  auction: Auction;
  onPause: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function AdminAuctionCard({ auction, onPause, onCancel }: AdminAuctionCardProps) {
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
        <CardTitle className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{auction.title}</h3>
              {auction.is_damaged && (
                <AlertTriangle className="h-4 w-4 text-red-500" title="Vehicle has reported damage" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              VIN: {auction.vin}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Cancel Auction
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Auction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this auction? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(auction.id)}>
                    Yes, cancel auction
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price and Notes Editing Section */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{auction.price?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Ends: {new Date(auction.auction_end_time || '').toLocaleString()}
                  </span>
                </div>
              </div>
              {auction.seller_notes && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">{auction.seller_notes}</p>
                </div>
              )}
            </>
          )}

          {/* Seller Contact Information */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Seller Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{auction.seller?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{auction.mobile_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Images */}
          {auction.images && auction.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Vehicle Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {auction.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}