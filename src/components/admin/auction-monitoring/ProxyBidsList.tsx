
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

interface ProxyBid {
  id: string;
  car_id: string;
  dealer_id: string;
  max_bid_amount: number;
  dealer_name?: string;
  created_at: string;
  updated_at: string;
}

interface ProxyBidsListProps {
  auctionId: string;
}

export function ProxyBidsList({ auctionId }: ProxyBidsListProps) {
  const [proxyBids, setProxyBids] = useState<ProxyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProxyBids() {
      try {
        setLoading(true);
        
        // Fetch proxy bids for this auction with dealer information
        const { data, error } = await adminSupabase
          .from('proxy_bids')
          .select(`
            *,
            dealers:dealers(dealership_name, supervisor_name)
          `)
          .eq('car_id', auctionId);
          
        if (error) throw error;
        
        // Format the data
        const formattedData = data.map(bid => ({
          ...bid,
          dealer_name: bid.dealers?.dealership_name || bid.dealers?.supervisor_name || 'Unknown Dealer'
        }));
        
        setProxyBids(formattedData);
      } catch (err) {
        console.error('Error fetching proxy bids:', err);
        setError('Failed to load proxy bids');
      } finally {
        setLoading(false);
      }
    }
    
    if (auctionId) {
      fetchProxyBids();
    }
  }, [auctionId]);

  if (loading) {
    return <div className="text-center py-4">Loading proxy bids...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (proxyBids.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
        <Clock className="h-4 w-4" />
        No proxy bids for this auction
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dealer</TableHead>
            <TableHead className="text-right">Max Bid Amount</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proxyBids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell className="font-medium">{bid.dealer_name}</TableCell>
              <TableCell className="text-right font-mono">
                {bid.max_bid_amount.toLocaleString()} 
                <Badge variant="outline" className="ml-2">Proxy</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(bid.updated_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
