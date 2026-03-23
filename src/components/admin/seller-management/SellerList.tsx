
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Seller {
  id: string;
  role: string;
  created_at: string;
  name: string | null;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  verification_status: string | null;
  is_verified: boolean;
  total_listings: number;
  active_listings: number;
}

interface SellerListProps {
  sellers: Seller[];
  onDeleteClick: (seller: Seller) => void;
  isLoading: boolean;
  reminderCounts?: Map<string, Record<string, number>>;
  onReminderSent?: () => void;
}

export const SellerList = ({ sellers, onDeleteClick, isLoading, reminderCounts, onReminderSent }: SellerListProps) => {
  const handleSendReminder = async (seller: Seller) => {
    if (!seller.email) {
      toast.error("Seller has no email address");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("send-notifications", {
        body: {
          type: "seller_listing_reminder",
          sellerId: seller.id,
          sellerEmail: seller.email,
        },
      });
      if (error) throw error;
      toast.success(`Reminder sent to ${seller.email}`);
      onReminderSent?.();
    } catch (err: any) {
      console.error("Error sending reminder:", err);
      toast.error(err?.message || "Failed to send reminder");
    }
  };

  const getVerificationBadge = (isVerified: boolean, status: string | null) => {
    if (isVerified) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{status || 'Pending'}</Badge>;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Seller Details</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(sellers) && sellers.length > 0 ? (
            sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{seller.name || 'Unknown Seller'}</span>
                    <span className="text-sm text-gray-500">ID: {seller.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {seller.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {seller.email}
                      </div>
                    )}
                    {seller.mobile_number && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{seller.mobile_number}</span>
                        <button
                          onClick={() => window.open(`https://wa.me/${seller.mobile_number!.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer')}
                          title="Chat on WhatsApp"
                          className="inline-flex items-center justify-center rounded-full w-5 h-5 bg-green-500 hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )}
                    {seller.address && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {seller.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getVerificationBadge(seller.is_verified, seller.verification_status)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">Active: {seller.active_listings || 0}</span>
                    <span className="text-sm text-gray-500">Total: {seller.total_listings || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(seller.created_at), "MMM d, yyyy 'at' h:mm a")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(seller)}
                      disabled={!seller.email}
                      title="Send listing reminder"
                      className="relative"
                    >
                      <Mail className="w-4 h-4" />
                      {(reminderCounts?.get(seller.id)?.seller_listing_reminder ?? 0) > 0 && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                          {reminderCounts?.get(seller.id)?.seller_listing_reminder}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteClick(seller)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                {isLoading ? "Loading..." : "No active sellers found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
