
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Clock, Gavel, Users, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface ActiveAuction {
  id: string;
  title: string;
  current_bid: number;
  auction_end_time: string;
  bid_count: number;
  proxy_bid_count: number;
}

export function ActiveAuctionsMonitor() {
  const [auctions, setAuctions] = useState<ActiveAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveAuctions() {
      try {
        setLoading(true);
        // Fetch active auctions
        const { data: auctionData, error: auctionError } = await adminSupabase
          .from('cars')
          .select(`
            id,
            title,
            current_bid,
            auction_end_time,
            bids(count)
          `)
          .eq('auction_status', 'active')
          .order('auction_end_time', { ascending: true })
          .limit(5);

        if (auctionError) throw auctionError;

        // For each auction, fetch proxy bid counts
        const auctionsWithProxyBids = await Promise.all(
          (auctionData || []).map(async (auction) => {
            const { count: proxyBidCount } = await adminSupabase
              .from('proxy_bids')
              .select('*', { count: 'exact', head: true })
              .eq('car_id', auction.id);

            return {
              id: auction.id,
              title: auction.title || 'Untitled Auction',
              current_bid: auction.current_bid || 0,
              auction_end_time: auction.auction_end_time,
              bid_count: auction.bids?.length || 0,
              proxy_bid_count: proxyBidCount || 0
            };
          })
        );

        setAuctions(auctionsWithProxyBids);
      } catch (err) {
        console.error('Error fetching active auctions:', err);
        setError('Failed to load active auctions');
      } finally {
        setLoading(false);
      }
    }

    fetchActiveAuctions();
    
    // Set up realtime subscription
    const channel = adminSupabase
      .channel('active-auctions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cars',
          filter: 'auction_status=eq.active'
        },
        () => {
          fetchActiveAuctions();
        }
      )
      .subscribe();

    return () => {
      adminSupabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-destructive py-6">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Live Auctions 
          <Badge variant="outline" className="ml-2">
            {auctions.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auctions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No active auctions at the moment
          </div>
        ) : (
          <div className="space-y-3">
            {auctions.map((auction) => {
              const timeLeft = new Date(auction.auction_end_time).getTime() - new Date().getTime();
              const isEndingSoon = timeLeft < 3600000; // Less than 1 hour
              
              return (
                <div 
                  key={auction.id} 
                  className={`p-3 border rounded-md ${isEndingSoon ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        to={`/admin/auctions/monitor?id=${auction.id}`}
                        className="font-medium hover:underline"
                      >
                        {auction.title}
                      </Link>
                      <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {auction.bid_count} bids
                        </div>
                        {auction.proxy_bid_count > 0 && (
                          <div className="flex items-center text-blue-600">
                            <span className="mr-1">•</span>
                            {auction.proxy_bid_count} proxy bids
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {auction.current_bid.toLocaleString()}
                      </div>
                      <div className={`flex items-center text-xs ${isEndingSoon ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {isEndingSoon ? 'Ending soon' : formatTimeLeft(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {auctions.length > 0 && (
              <div className="pt-2 text-center">
                <Link 
                  to="/admin/auctions/monitor"
                  className="text-sm text-primary hover:underline"
                >
                  View all active auctions
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTimeLeft(timeLeft: number): string {
  if (timeLeft <= 0) return 'Ended';
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  
  return `${minutes}m left`;
}
