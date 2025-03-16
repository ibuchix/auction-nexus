
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "../auction-management/StatusBadge";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, CircleCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogTable } from "../audit-logs/LogTable";

export function AuctionOperationsLogView() {
  const [view, setView] = useState<'operations' | 'errors'>('operations');
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auctionOperationsLogs', view],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (view === 'operations') {
        query = query.in('action', ['process_auctions', 'auction_closed', 'auto_proxy_bid', 'start_auction']);
      } else {
        query = query.in('action', ['auction_close_failed', 'auction_close_system_error', 'system_reset_failed', 'recovery_failed']);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true;
    
    const detailsString = JSON.stringify(log.details || {}).toLowerCase();
    const entityIdMatch = log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const actionMatch = log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    const detailsMatch = detailsString.includes(searchTerm.toLowerCase());
    
    return entityIdMatch || actionMatch || detailsMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Auction Operations Audit Logs</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="w-64 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            disabled={!searchTerm}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="operations" value={view} onValueChange={(v) => setView(v as 'operations' | 'errors')}>
        <TabsList>
          <TabsTrigger value="operations" className="flex items-center gap-1">
            <CircleCheck className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-1">
            <CircleAlert className="h-4 w-4" />
            Errors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Auction System Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <LogTable logs={filteredLogs || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Auction System Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <LogTable logs={filteredLogs || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
