import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import type { CreateLinkInput } from "@/hooks/useTrackingData";

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateLinkInput) => void;
  isSubmitting: boolean;
  baseUrl: string;
}

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google" },
  { value: "affiliate", label: "Affiliate" },
  { value: "influencer", label: "Influencer" },
  { value: "other", label: "Other" },
];

function generateCode(name: string, platform: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
  const prefix = platform.slice(0, 2);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${slug}-${rand}`;
}

export function CreateLinkDialog({ open, onOpenChange, onSubmit, isSubmitting, baseUrl }: CreateLinkDialogProps) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [affiliateName, setAffiliateName] = useState("");
  const [destinationPath, setDestinationPath] = useState("/sell");
  const [copied, setCopied] = useState(false);

  const code = name ? generateCode(name, platform) : "";
  const fullUrl = code ? `${baseUrl}${destinationPath}?ref=${code}` : "";

  const handleSubmit = () => {
    onSubmit({
      code,
      name,
      platform,
      utm_source: utmSource || platform,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_content: utmContent || undefined,
      destination_path: destinationPath,
      affiliate_name: affiliateName || undefined,
    });
    // Reset form
    setName("");
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setUtmContent("");
    setAffiliateName("");
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Tracking Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spring 2025 Campaign" />
            </div>
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(platform === "affiliate" || platform === "influencer") && (
            <div className="space-y-2">
              <Label>Affiliate / Influencer Name</Label>
              <Input value={affiliateName} onChange={(e) => setAffiliateName(e.target.value)} placeholder="John Doe" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Destination Path</Label>
            <Input value={destinationPath} onChange={(e) => setDestinationPath(e.target.value)} placeholder="/sell" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>UTM Source</Label>
              <Input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder={platform} />
            </div>
            <div className="space-y-2">
              <Label>UTM Medium</Label>
              <Input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="cpc, social, email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>UTM Campaign</Label>
              <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="spring-2025" />
            </div>
            <div className="space-y-2">
              <Label>UTM Content</Label>
              <Input value={utmContent} onChange={(e) => setUtmContent(e.target.value)} placeholder="banner-v1" />
            </div>
          </div>

          {fullUrl && (
            <div className="rounded-md border bg-muted/50 p-3">
              <Label className="text-xs text-muted-foreground">Generated URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs flex-1 break-all">{fullUrl}</code>
                <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={copyUrl}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name || isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
