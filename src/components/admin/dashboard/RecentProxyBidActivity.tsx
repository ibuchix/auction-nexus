
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { edgeFunctionAdminOperations } from "@/utils/edgeFunctionAdminOperations";
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
        
        // Use the admin Edge Function API to get proxy bid data
        const data = await edgeFunctionAdminOperations.getActiveAuctions();
        
        if (!data || !Array.isArray(data)) {
          console.log('No auction data returned');
          setActivities([]);
          return;
        }
        
        // For now, we'll show a placeholder since we need to implement
        // proxy bid fetching in the admin API
        console.log('Recent proxy bid activity feature needs admin API implementation');
        setActivities([]);
        
      } catch (err) {
        console.error('Error fetching recent proxy bid activity:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecentActivity();
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
        <div className="text-center py-6 text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5" />
            No recent proxy bid activity
          </div>
          <p className="text-sm">Proxy bid monitoring will be available soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
