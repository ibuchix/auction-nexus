
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ProxyBidActivity {
  id: string;
  car_id: string;
  dealer_id: string;
  max_bid_amount: number;
  updated_at: string;
  car_title: string;
  dealer_name: string;
}

export function RecentProxyBidActivity() {
  const [activities, setActivities] = useState<ProxyBidActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true);
        
        const { data, error } = await adminSupabase
          .from('proxy_bids')
          .select(`
            *,
            cars:car_id(title),
            dealers:dealer_id(dealership_name, supervisor_name)
          `)
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Format the data
        const formattedData: ProxyBidActivity[] = (data || []).map(item => ({
          id: item.id,
          car_id: item.car_id,
          dealer_id: item.dealer_id,
          max_bid_amount: item.max_bid_amount,
          updated_at: item.updated_at,
          car_title: item.cars?.title || 'Unknown Auction',
          dealer_name: item.dealers?.dealership_name || item.dealers?.supervisor_name || 'Unknown Dealer'
        }));
        
        setActivities(formattedData);
      } catch (err) {
        console.error('Error fetching recent proxy bid activity:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecentActivity();
    
    // Set up realtime subscription
    const channel = adminSupabase
      .channel('proxy-bid-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proxy_bids'
        },
        () => {
          fetchRecentActivity();
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
          <CardTitle>Recent Proxy Bid Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
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
          <CardTitle>Recent Proxy Bid Activity</CardTitle>
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
          <Zap className="h-5 w-5" />
          Recent Proxy Bid Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent proxy bid activity
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="p-3 border border-blue-100 bg-blue-50 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{activity.dealer_name}</div>
                    <Link 
                      to={`/admin/auctions/monitor?id=${activity.car_id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {activity.car_title}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {activity.max_bid_amount.toLocaleString()}
                      <Badge variant="outline" className="ml-2 bg-blue-100">Proxy</Badge>
                    </div>
                    <div className="flex items-center justify-end text-xs text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2 text-center">
              <Link 
                to="/admin/proxy-bids"
                className="text-sm text-primary hover:underline"
              >
                View all proxy bids
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
