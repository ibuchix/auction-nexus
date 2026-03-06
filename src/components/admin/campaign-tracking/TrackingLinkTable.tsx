import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TrackingLink, FunnelStats } from "@/hooks/useTrackingData";

interface TrackingLinkTableProps {
  links: TrackingLink[];
  funnel: FunnelStats[];
  baseUrl: string;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  tiktok: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  google: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  affiliate: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  influencer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  other: "bg-muted text-muted-foreground",
};

export function TrackingLinkTable({ links, funnel, baseUrl, onToggleActive, onDelete }: TrackingLinkTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const funnelMap = new Map(funnel.map((f) => [f.link_id, f]));

  const copyUrl = async (link: TrackingLink) => {
    const url = `${baseUrl}${link.destination_path}?ref=${link.code}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No tracking links created yet. Click "Create Link" to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Valuations</TableHead>
            <TableHead className="text-right">Registrations</TableHead>
            <TableHead className="text-right">Listings</TableHead>
            <TableHead className="text-right">Conv. Rate</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => {
            const stats = funnelMap.get(link.id);
            const clicks = stats?.clicks ?? link.click_count;
            const convRate = clicks > 0 && stats ? ((stats.listings / clicks) * 100).toFixed(1) : "0.0";

            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  {link.name}
                  {link.affiliate_name && (
                    <span className="block text-xs text-muted-foreground">{link.affiliate_name}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={platformColors[link.platform] ?? platformColors.other}>
                    {link.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{link.code}</code>
                </TableCell>
                <TableCell className="text-right tabular-nums">{clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{stats?.valuations?.toLocaleString() ?? "0"}</TableCell>
                <TableCell className="text-right tabular-nums">{stats?.registrations?.toLocaleString() ?? "0"}</TableCell>
                <TableCell className="text-right tabular-nums">{stats?.listings?.toLocaleString() ?? "0"}</TableCell>
                <TableCell className="text-right tabular-nums">{convRate}%</TableCell>
                <TableCell>
                  <Switch checked={link.is_active} onCheckedChange={(v) => onToggleActive(link.id, v)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(link)}>
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(link.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
