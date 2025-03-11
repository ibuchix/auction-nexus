
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DisputeList } from "@/components/admin/disputes/DisputeList";
import { DisputeStats } from "@/components/admin/disputes/DisputeStats";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { DisputeFilters } from "@/components/admin/disputes/DisputeFilters";
import { DisputeDetailDialog } from "@/components/admin/disputes/DisputeDetailDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dispute } from "@/types/disputes";
import { useToast } from "@/hooks/use-toast";

const DisputeResolution = () => {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ status?: string; type?: string }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  const { data: disputes, isLoading, refetch } = useQuery({
    queryKey: ['disputes', activeFilters],
    queryFn: async () => {
      let query = supabase.from('disputes').select(`
        *,
        submitted_by:profiles!disputes_submitted_by_fkey(id, full_name, avatar_url),
        assigned_to:profiles!disputes_assigned_to_fkey(id, full_name, avatar_url),
        car_id(id, title, make, model, year, images)
      `);

      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status as Dispute['status']);
      }

      if (activeFilters.type) {
        query = query.eq('type', activeFilters.type as Dispute['type']);
      }

      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Error fetching disputes",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      return data as Dispute[];
    }
  });

  const handleOpenDetail = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDetailOpen(true);
  };

  const handleDisputeUpdated = () => {
    refetch();
    setIsDetailOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterOpen(true)}
              className="flex gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </div>
        </div>

        <DisputeStats disputes={disputes || []} />

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Disputes</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="investigating">Investigating</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <DisputeList 
              disputes={disputes || []} 
              isLoading={isLoading} 
              onViewDetail={handleOpenDetail}
            />
          </TabsContent>
          
          <TabsContent value="open">
            <DisputeList 
              disputes={(disputes || []).filter(d => d.status === 'open')} 
              isLoading={isLoading} 
              onViewDetail={handleOpenDetail}
            />
          </TabsContent>
          
          <TabsContent value="investigating">
            <DisputeList 
              disputes={(disputes || []).filter(d => d.status === 'investigating')} 
              isLoading={isLoading} 
              onViewDetail={handleOpenDetail}
            />
          </TabsContent>
          
          <TabsContent value="resolved">
            <DisputeList 
              disputes={(disputes || []).filter(d => d.status === 'resolved' || d.status === 'closed')} 
              isLoading={isLoading} 
              onViewDetail={handleOpenDetail}
            />
          </TabsContent>
        </Tabs>
        
        {isFilterOpen && (
          <DisputeFilters
            currentFilters={activeFilters}
            onApplyFilters={(filters) => {
              setActiveFilters(filters);
              setIsFilterOpen(false);
            }}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {isDetailOpen && selectedDispute && (
          <DisputeDetailDialog
            dispute={selectedDispute}
            open={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onDisputeUpdated={handleDisputeUpdated}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DisputeResolution;
