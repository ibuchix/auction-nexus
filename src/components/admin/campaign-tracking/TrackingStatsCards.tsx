import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, ClipboardCheck, UserPlus, Car } from "lucide-react";

interface TrackingStatsCardsProps {
  clicks: number;
  valuations: number;
  registrations: number;
  listings: number;
  isLoading: boolean;
}

const stats = [
  { key: "clicks", label: "Total Clicks", icon: MousePointerClick, color: "text-blue-500" },
  { key: "valuations", label: "Valuations", icon: ClipboardCheck, color: "text-amber-500" },
  { key: "registrations", label: "Registrations", icon: UserPlus, color: "text-emerald-500" },
  { key: "listings", label: "Listings", icon: Car, color: "text-primary" },
] as const;

export function TrackingStatsCards({ clicks, valuations, registrations, listings, isLoading }: TrackingStatsCardsProps) {
  const values = { clicks, valuations, registrations, listings };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-2xl font-bold tabular-nums">
              {isLoading ? "—" : values[key].toLocaleString()}
            </span>
            {key !== "clicks" && clicks > 0 && !isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                {((values[key] / clicks) * 100).toFixed(1)}% of clicks
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
