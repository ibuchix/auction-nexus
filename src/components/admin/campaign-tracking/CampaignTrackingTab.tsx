import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart3, CalendarIcon } from "lucide-react";
import { useTrackingData } from "@/hooks/useTrackingData";
import { TrackingStatsCards } from "./TrackingStatsCards";
import { TrackingLinkTable } from "./TrackingLinkTable";
import { TrackingFunnelChart } from "./TrackingFunnelChart";
import { CreateLinkDialog } from "./CreateLinkDialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";

const SELLER_APP_BASE_URL = "https://www.autaro.pl";

type PresetKey = "7d" | "30d" | "90d" | "all";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

function getPresetRange(key: PresetKey): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (key) {
    case "7d": return { from: subDays(now, 7), to: now };
    case "30d": return { from: subDays(now, 30), to: now };
    case "90d": return { from: subDays(now, 90), to: now };
    case "all": return { from: null, to: null };
  }
}

export function CampaignTrackingTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const dateRange = useMemo(() => {
    if (customRange?.from) {
      return { from: customRange.from, to: customRange.to ?? customRange.from };
    }
    return getPresetRange(activePreset);
  }, [activePreset, customRange]);

  const { links, funnel, aggregateStats, isLoading, createLink, toggleActive, deleteLink } = useTrackingData(dateRange);

  const baseUrl = SELLER_APP_BASE_URL;

  const handlePresetClick = (key: PresetKey) => {
    setActivePreset(key);
    setCustomRange(undefined);
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from) {
      setActivePreset(undefined as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            variant={activePreset === p.key && !customRange?.from ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(p.key)}
          >
            {p.label}
          </Button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={customRange?.from ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
            >
              <CalendarIcon className="h-4 w-4" />
              {customRange?.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, "MMM d")} – {format(customRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(customRange.from, "MMM d, yyyy")
                )
              ) : (
                "Custom range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange?.from ?? subDays(new Date(), 30)}
              selected={customRange}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

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
