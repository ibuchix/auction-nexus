import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrackingLink {
  id: string;
  code: string;
  name: string;
  platform: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  destination_path: string;
  affiliate_name: string | null;
  is_active: boolean;
  click_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FunnelStats {
  link_id: string;
  link_code: string;
  link_name: string;
  platform: string;
  clicks: number;
  valuations: number;
  registrations: number;
  listings: number;
}

export interface CreateLinkInput {
  code: string;
  name: string;
  platform: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  destination_path?: string;
  affiliate_name?: string;
}

export function useTrackingData(dateRange?: { from: Date | null; to: Date | null }) {
  const queryClient = useQueryClient();

  const linksQuery = useQuery({
    queryKey: ["tracking-links"],
    queryFn: async (): Promise<TrackingLink[]> => {
      const { data, error } = await supabase
        .from("tracking_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TrackingLink[];
    },
    staleTime: 30_000,
  });

  const funnelQuery = useQuery({
    queryKey: ["tracking-funnel", dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async (): Promise<FunnelStats[]> => {
      const { data, error } = await supabase.rpc("get_tracking_funnel_stats", {
        _from: dateRange?.from?.toISOString() ?? null,
        _to: dateRange?.to?.toISOString() ?? null,
      });
      if (error) throw error;
      return (data ?? []) as FunnelStats[];
    },
    staleTime: 30_000,
  });

  const createLink = useMutation({
    mutationFn: async (input: CreateLinkInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("tracking_links").insert({
        ...input,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-links"] });
      queryClient.invalidateQueries({ queryKey: ["tracking-funnel"] });
      toast.success("Tracking link created");
    },
    onError: (err: Error) => {
      toast.error(err.message.includes("duplicate") ? "Code already exists" : err.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("tracking_links")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-links"] });
      toast.success("Link updated");
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracking_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-links"] });
      queryClient.invalidateQueries({ queryKey: ["tracking-funnel"] });
      toast.success("Link deleted");
    },
  });

  // Aggregate stats
  const aggregateStats = funnelQuery.data?.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      valuations: acc.valuations + row.valuations,
      registrations: acc.registrations + row.registrations,
      listings: acc.listings + row.listings,
    }),
    { clicks: 0, valuations: 0, registrations: 0, listings: 0 }
  ) ?? { clicks: 0, valuations: 0, registrations: 0, listings: 0 };

  return {
    links: linksQuery.data ?? [],
    funnel: funnelQuery.data ?? [],
    aggregateStats,
    isLoading: linksQuery.isLoading || funnelQuery.isLoading,
    createLink,
    toggleActive,
    deleteLink,
  };
}
