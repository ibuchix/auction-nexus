
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
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

interface ProxyBid {
  id: string;
  car_id: string;
  dealer_id: string;
  max_bid_amount: number;
  created_at: string;
  updated_at: string;
  dealer_name?: string;
  auction_title?: string;
  auction_end_time?: string;
}

interface ProxyBidTableProps {
  searchTerm: string;
  sortBy: string;
}

export function ProxyBidTable({ searchTerm, sortBy }: ProxyBidTableProps) {
  const [proxyBids, setProxyBids] = useState<ProxyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProxyBids() {
      try {
        setLoading(true);
        
        // Fetch all proxy bids with dealer and auction information
        const { data, error } = await adminSupabase
          .from('proxy_bids')
          .select(`
            *,
            dealers:dealers(id, dealership_name, supervisor_name),
            auctions:cars(id, title, auction_end_time)
          `);
          
        if (error) throw error;
        
        // Format the data
        const formattedData = data.map(bid => ({
          ...bid,
          dealer_name: bid.dealers?.dealership_name || bid.dealers?.supervisor_name || 'Unknown Dealer',
          auction_title: bid.auctions?.title || 'Unknown Auction',
          auction_end_time: bid.auctions?.auction_end_time
        }));
        
        setProxyBids(formattedData);
      } catch (err) {
        console.error('Error fetching proxy bids:', err);
        setError('Failed to load proxy bids');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProxyBids();
  }, []);

  // Filter and sort the proxy bids
  const filteredAndSortedBids = proxyBids
    .filter(bid => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        bid.dealer_name?.toLowerCase().includes(searchLower) ||
        bid.auction_title?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'max_bid_amount':
          return b.max_bid_amount - a.max_bid_amount;
        case 'dealer_name':
          return (a.dealer_name || '').localeCompare(b.dealer_name || '');
        default:
          return 0;
      }
    });

  const handleDeleteProxyBid = async (id: string) => {
    try {
      const { error } = await adminSupabase
        .from('proxy_bids')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProxyBids(proxyBids.filter(bid => bid.id !== id));
      toast({
        title: "Proxy Bid Deleted",
        description: "The proxy bid has been successfully removed.",
      });
    } catch (err) {
      console.error('Error deleting proxy bid:', err);
      toast({
        title: "Error",
        description: "Failed to delete the proxy bid.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (filteredAndSortedBids.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>No proxy bids found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dealer</TableHead>
            <TableHead>Auction</TableHead>
            <TableHead className="text-right">Max Bid Amount</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedBids.map((bid) => {
            const isAuctionEnded = bid.auction_end_time && new Date(bid.auction_end_time) < new Date();
            
            return (
              <TableRow key={bid.id}>
                <TableCell className="font-medium">{bid.dealer_name}</TableCell>
                <TableCell>
                  <Link to={`/admin/auctions/monitor?id=${bid.car_id}`} className="hover:underline">
                    {bid.auction_title}
                  </Link>
                  {isAuctionEnded && <Badge variant="secondary" className="ml-2">Ended</Badge>}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {bid.max_bid_amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(bid.updated_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/admin/auctions/monitor?id=${bid.car_id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Proxy Bid</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this proxy bid? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProxyBid(bid.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
