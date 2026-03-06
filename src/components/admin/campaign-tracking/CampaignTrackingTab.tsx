import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart3 } from "lucide-react";
import { useTrackingData } from "@/hooks/useTrackingData";
import { TrackingStatsCards } from "./TrackingStatsCards";
import { TrackingLinkTable } from "./TrackingLinkTable";
import { TrackingFunnelChart } from "./TrackingFunnelChart";
import { CreateLinkDialog } from "./CreateLinkDialog";

export function CampaignTrackingTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { links, funnel, aggregateStats, isLoading, createLink, toggleActive, deleteLink } = useTrackingData();

  // Use the current origin as the base URL for generated links
  const baseUrl = window.location.origin;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <TrackingStatsCards
        clicks={aggregateStats.clicks}
        valuations={aggregateStats.valuations}
        registrations={aggregateStats.registrations}
        listings={aggregateStats.listings}
        isLoading={isLoading}
      />

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <TrackingFunnelChart
              clicks={aggregateStats.clicks}
              valuations={aggregateStats.valuations}
              registrations={aggregateStats.registrations}
              listings={aggregateStats.listings}
            />
          )}
        </CardContent>
      </Card>

      {/* Link Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Tracking Links</CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Link
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <TrackingLinkTable
              links={links}
              funnel={funnel}
              baseUrl={baseUrl}
              onToggleActive={(id, active) => toggleActive.mutate({ id, is_active: active })}
              onDelete={(id) => deleteLink.mutate(id)}
            />
          )}
        </CardContent>
      </Card>

      <CreateLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(input) => {
          createLink.mutate(input, { onSuccess: () => setDialogOpen(false) });
        }}
        isSubmitting={createLink.isPending}
        baseUrl={baseUrl}
      />
    </div>
  );
}
