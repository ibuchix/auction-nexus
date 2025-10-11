
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Mail, CheckCircle, XCircle, User, Building2 } from "lucide-react";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
// Types from generated Database
import type { Database } from "@/integrations/supabase/types";

type DealerWonVehicle = Database["public"]["Tables"]["dealer_won_vehicles"]["Row"];

type OutcomeItem = DealerWonVehicle & {
  cars: Database["public"]["Tables"]["cars"]["Row"] | null;
  dealers: Database["public"]["Tables"]["dealers"]["Row"] | null;
};

const formatPLN = (value?: number | null) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(Number(value || 0));

const DecisionBadge = ({ decision }: { decision?: string | null }) => {
  if (!decision) return <Badge variant="outline">Awaiting decision</Badge>;
  if (decision === "accepted") return (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
      <CheckCircle className="w-3 h-3 mr-1" /> Accepted
    </Badge>
  );
  if (decision === "declined") return (
    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
      <XCircle className="w-3 h-3 mr-1" /> Declined
    </Badge>
  );
  return <Badge variant="outline">{decision}</Badge>;
};

const useAuctionOutcomesData = () => {
  return useQuery({
    queryKey: ["auction-outcomes"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: outcomes, error } = await supabase
        .from("dealer_won_vehicles")
        .select(
          `id, car_id, dealer_id, winning_bid_amount, original_bid_amount, second_highest_bid, platform_fee, payment_status, auction_end_time,
           cars:car_id (id, title, make, model, year, mileage, auction_end_time, auction_status, awaiting_seller_decision, seller_id, reserve_price, current_bid),
           dealers:dealer_id (id, user_id, dealership_name, license_number, address, is_verified, verification_status)`
        )
        .gte("auction_end_time", since.toISOString())
        .order("auction_end_time", { ascending: false });

      if (error) throw error;

      const carIds = (outcomes || []).map((o) => o.car_id);
      const sellerUserIds = Array.from(
        new Set((outcomes || []).map((o) => o.cars?.seller_id).filter(Boolean) as string[])
      );
      const dealerUserIds = Array.from(
        new Set((outcomes || []).map((o) => o.dealers?.user_id).filter(Boolean) as string[])
      );

      // Fetch seller decisions
      const [decisionsRes, profilesRes, sellersRes, dealerProfilesRes] = await Promise.all([
        supabase
          .from("seller_bid_decisions")
          .select("id, car_id, decision, created_at")
          .in("car_id", carIds.length ? carIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", sellerUserIds.length ? sellerUserIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase
          .from("sellers")
          .select("user_id, is_verified, verification_status")
          .in("user_id", sellerUserIds.length ? sellerUserIds : ["00000000-0000-0000-0000-000000000000"]),
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", dealerUserIds.length ? dealerUserIds : ["00000000-0000-0000-0000-000000000000"]),
      ]);

      const decisionsByCar = new Map<string, { decision?: string | null; created_at?: string }>();
      decisionsRes.data?.forEach((d) => {
        const existing = decisionsByCar.get(d.car_id);
        if (!existing || new Date(d.created_at || 0) > new Date(existing.created_at || 0)) {
          decisionsByCar.set(d.car_id, { decision: (d as any).decision, created_at: d.created_at as string });
        }
      });

      const profileById = new Map<string, { full_name?: string | null; role?: string | null }>();
      profilesRes.data?.forEach((p) => profileById.set(p.id, { full_name: p.full_name, role: p.role as any }));

      const sellerMetaByUser = new Map<string, { is_verified?: boolean; verification_status?: string | null }>();
      sellersRes.data?.forEach((s) => sellerMetaByUser.set(s.user_id, { is_verified: s.is_verified, verification_status: s.verification_status }));

      const dealerProfileByUser = new Map<string, { full_name?: string | null }>();
      dealerProfilesRes.data?.forEach((p) => dealerProfileByUser.set(p.id, { full_name: p.full_name }));

      return {
        outcomes: (outcomes || []) as OutcomeItem[],
        decisionsByCar,
        profileById,
        sellerMetaByUser,
        dealerProfileByUser,
      };
    },
  });
};

const sendEmail = async (type: "seller_auction_ended" | "dealer_bid_accepted" | "dealer_bid_declined" | "seller_ready_for_pickup", payload: any) => {
  const { data, error } = await supabase.functions.invoke("send-notifications", {
    body: {
      type,
      ...payload,
    },
  });
  if (error) throw error;
  return data;
};

const SectionHeader = () => (
  <header className="mb-4">
    <h1 className="text-2xl font-bold tracking-tight">Auction Outcomes</h1>
    <p className="text-sm text-muted-foreground">Review ended auctions, contact sellers and notify dealers.</p>
  </header>
);

const AuctionOutcomeCard = ({
  item,
  decision,
  sellerName,
  dealerPersonName,
  counts,
  onEmailSent,
}: {
  item: OutcomeItem;
  decision?: string | null;
  sellerName?: string | null;
  dealerPersonName?: string | null;
  counts: { seller_auction_ended: number; dealer_bid_accepted: number; dealer_bid_declined: number; seller_ready_for_pickup: number };
  onEmailSent: () => void;
}) => {
  const car = item.cars;
  const dealer = item.dealers;

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {car?.year} {car?.make} {car?.model}
          </CardTitle>
          <DecisionBadge decision={decision} />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Winning bid: {formatPLN(item.winning_bid_amount)}</span>
          <span>Platform fee: {formatPLN(item.platform_fee)}</span>
          <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" /> Ended {new Date(item.auction_end_time).toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Dealer</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span>{dealerPersonName || "—"}</span></div>
            <div>Dealership: {dealer?.dealership_name || "—"}</div>
            <div>License: {dealer?.license_number || "—"}</div>
            <div>Verified: {dealer?.is_verified ? "Yes" : "No"}</div>
            <div>Status: {dealer?.verification_status || "—"}</div>
          </div>
        </section>
        <section>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Seller</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span>{sellerName || car?.seller_name || "—"}</span></div>
            <div>Verified: {car?.awaiting_seller_decision ? "Awaiting decision" : "—"}</div>
            <div>Reserve: {formatPLN(car?.reserve_price)}</div>
            <div>Current bid: {formatPLN(car?.current_bid)}</div>
          </div>
        </section>
        <div className="md:col-span-2 flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            onClick={async () => {
              try {
                await sendEmail("seller_auction_ended", { carId: item.car_id });
                toast.success("Seller notified about auction end");
                onEmailSent();
              } catch (e: any) {
                toast.error(e.message || "Failed to notify seller");
              }
            }}
          >
            <Mail className="w-4 h-4 mr-1" /> Email seller: auction ended
            <Badge variant="secondary" className="ml-2">{counts.seller_auction_ended}</Badge>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={decision !== "accepted"}
            onClick={async () => {
              try {
                await sendEmail("dealer_bid_accepted", { carId: item.car_id, dealerId: item.dealer_id });
                toast.success("Dealer notified: bid accepted");
                onEmailSent();
              } catch (e: any) {
                toast.error(e.message || "Failed to notify dealer");
              }
            }}
          >
            <Mail className="w-4 h-4 mr-1" /> Email dealer: bid accepted
            <Badge variant="secondary" className="ml-2">{counts.dealer_bid_accepted}</Badge>
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={item.payment_status !== 'completed'}
            onClick={async () => {
              try {
                await sendEmail("seller_ready_for_pickup", { carId: item.car_id });
                toast.success("Seller notified: ready for pickup");
                onEmailSent();
              } catch (e: any) {
                toast.error(e.message || "Failed to notify seller");
              }
            }}
          >
            <Mail className="w-4 h-4 mr-1" /> Email seller: ready for pickup
            <Badge variant="secondary" className="ml-2">{counts.seller_ready_for_pickup}</Badge>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={decision !== "declined"}
            onClick={async () => {
              try {
                await sendEmail("dealer_bid_declined", { carId: item.car_id, dealerId: item.dealer_id });
                toast.success("Dealer notified: bid declined");
                onEmailSent();
              } catch (e: any) {
                toast.error(e.message || "Failed to notify dealer");
              }
            }}
          >
            <Mail className="w-4 h-4 mr-1" /> Email dealer: bid declined
            <Badge variant="secondary" className="ml-2">{counts.dealer_bid_declined}</Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AuctionOutcomes = () => {
  const { data, isLoading, error, refetch } = useAuctionOutcomesData();

  useEffect(() => {
    document.title = "Auction Outcomes | Admin";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Admin view of ended auctions with seller and dealer details.");
  }, []);

  const items = data?.outcomes || [];
  const decisionMap = data?.decisionsByCar || new Map();

  const carIds = useMemo(() => items.map((i) => i.car_id), [items]);
  const { data: countsMap, refetch: refetchCounts } = useNotificationCounts(carIds);

  const enhanced = useMemo(() => {
    return items.map((item) => {
      const sellerName = item.cars?.seller_id ? data?.profileById.get(item.cars.seller_id)?.full_name : undefined;
      const dealerPersonName = item.dealers?.user_id ? data?.dealerProfileByUser.get(item.dealers.user_id)?.full_name : undefined;
      const decision = decisionMap.get(item.car_id)?.decision;
      const counts = countsMap?.get(item.car_id) || { seller_auction_ended: 0, dealer_bid_accepted: 0, dealer_bid_declined: 0, seller_ready_for_pickup: 0 } as any;
      return { item, sellerName, dealerPersonName, decision, counts };
    });
  }, [items, data, decisionMap, countsMap]);

  if (isLoading) return <div>Loading outcomes...</div>;
  if (error) return <div className="text-destructive">Failed to load outcomes</div>;

  return (
    <main className="space-y-6">
      <SectionHeader />
      <section className="grid gap-4">
        {enhanced.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent outcomes found.</div>
        ) : (
          enhanced.map(({ item, sellerName, dealerPersonName, decision, counts }) => (
            <AuctionOutcomeCard
              key={item.id}
              item={item}
              sellerName={sellerName}
              dealerPersonName={dealerPersonName}
              decision={decision}
              counts={counts}
              onEmailSent={() => {
                // refresh counts and data
                refetchCounts();
                refetch();
              }}
            />
          ))
        )}
      </section>
    </main>
  );
};

export default AuctionOutcomes;
