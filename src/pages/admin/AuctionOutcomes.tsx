
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock, Mail, CheckCircle, XCircle, User, Building2, Search, Phone, MapPin, Gavel } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
           cars:car_id (id, title, make, model, year, mileage, auction_end_time, auction_status, awaiting_seller_decision, seller_id, reserve_price, current_bid, seller_name, mobile_number, vin, street_address, town, postcode, county),
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

      // Fetch seller decisions, seller emails, and dealer emails
      const [decisionsRes, profilesRes, sellersRes, dealerProfilesRes, sellerEmailsRes, dealerEmailsRes] = await Promise.all([
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
        supabase.rpc('get_cars_with_seller_info'),
        supabase.rpc('get_dealer_email_info')
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

      // Map seller_id -> email
      const sellerEmailMap = new Map<string, string>();
      sellerEmailsRes.data?.forEach((s: any) => {
        if (s.seller_id && s.seller_email) {
          sellerEmailMap.set(s.seller_id, s.seller_email);
        }
      });

      // Map dealer_id -> email
      const dealerEmailMap = new Map<string, string>();
      dealerEmailsRes.data?.forEach((d: any) => {
        if (d.dealer_id && d.dealer_email) {
          dealerEmailMap.set(d.dealer_id, d.dealer_email);
        }
      });

      return {
        outcomes: (outcomes || []) as OutcomeItem[],
        decisionsByCar,
        profileById,
        sellerMetaByUser,
        dealerProfileByUser,
        sellerEmailMap,
        dealerEmailMap,
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
  sellerEmail,
  sellerPhone,
  dealerPersonName,
  dealerEmail,
  counts,
  onEmailSent,
}: {
  item: OutcomeItem;
  decision?: string | null;
  sellerName?: string | null;
  sellerEmail?: string;
  sellerPhone?: string;
  dealerPersonName?: string | null;
  dealerEmail?: string;
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
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Dealer Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span>{dealerPersonName || "—"}</span></div>
            {dealerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${dealerEmail}`} className="text-blue-600 hover:underline">
                  {dealerEmail}
                </a>
              </div>
            )}
            <div>Dealership: {dealer?.dealership_name || "—"}</div>
            <div>License: {dealer?.license_number || "—"}</div>
            <div>Address: {dealer?.address || "—"}</div>
            <div>Verified: {dealer?.is_verified ? "✓ Yes" : "✗ No"}</div>
            <div>Status: {dealer?.verification_status || "—"}</div>
          </div>
        </section>
        <section>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Seller Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span>{sellerName || car?.seller_name || "—"}</span></div>
            {sellerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${sellerEmail}`} className="text-blue-600 hover:underline">
                  {sellerEmail}
                </a>
              </div>
            )}
            {sellerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${sellerPhone}`} className="text-blue-600 hover:underline">
                  {sellerPhone}
                </a>
              </div>
            )}
            {car?.street_address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">
                  {car.street_address}
                  {car.town && `, ${car.town}`}
                  {car.postcode && ` ${car.postcode}`}
                </span>
              </div>
            )}
            <div>Reserve: {formatPLN(car?.reserve_price)}</div>
            <div>VIN: {typeof car?.vin === 'string' ? car.vin : "—"}</div>
            <div>Mileage: {car?.mileage ? `${car.mileage.toLocaleString()} km` : "—"}</div>
          </div>
        </section>
        <div className="md:col-span-2 flex flex-wrap gap-2 mt-2">
          {!decision && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Gavel className="w-4 h-4 mr-1" /> Accept Bid for Seller
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Accept bid on behalf of seller?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to ACCEPT the bid of {formatPLN(item.winning_bid_amount)} for {car?.year} {car?.make} {car?.model} on behalf of the seller? This will trigger all downstream processes (notifications, payment readiness, etc.).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke("admin-api", {
                            body: { action: "adminAcceptBidForSeller", params: { carId: item.car_id, decision: "accepted" } },
                          });
                          if (error) throw error;
                          if (data && !data.success) throw new Error(data.error || "Failed");
                          toast.success("Bid accepted on behalf of seller");
                          onEmailSent();
                        } catch (e: any) {
                          toast.error(e.message || "Failed to accept bid");
                        }
                      }}
                    >
                      Accept Bid
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Gavel className="w-4 h-4 mr-1" /> Decline Bid for Seller
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline bid on behalf of seller?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to DECLINE the bid of {formatPLN(item.winning_bid_amount)} for {car?.year} {car?.make} {car?.model} on behalf of the seller? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke("admin-api", {
                            body: { action: "adminAcceptBidForSeller", params: { carId: item.car_id, decision: "declined" } },
                          });
                          if (error) throw error;
                          if (data && !data.success) throw new Error(data.error || "Failed");
                          toast.success("Bid declined on behalf of seller");
                          onEmailSent();
                        } catch (e: any) {
                          toast.error(e.message || "Failed to decline bid");
                        }
                      }}
                    >
                      Decline Bid
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button
            size="sm"
            onClick={async () => {
              try {
                await sendEmail("seller_auction_ended", { 
                  carId: item.car_id,
                  winningBid: item.winning_bid_amount 
                });
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
  const [searchQuery, setSearchQuery] = useState('');

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
    // First, map all items with their data
    const allItems = items.map((item) => {
      const sellerEmail = item.cars?.seller_id ? data?.sellerEmailMap.get(item.cars.seller_id) : undefined;
      const sellerPhone = item.cars?.mobile_number || undefined;
      const dealerEmail = item.dealer_id ? data?.dealerEmailMap.get(item.dealer_id) : undefined;
      const sellerName = item.cars?.seller_id ? data?.profileById.get(item.cars.seller_id)?.full_name : undefined;
      const dealerPersonName = item.dealers?.user_id ? data?.dealerProfileByUser.get(item.dealers.user_id)?.full_name : undefined;
      const decision = decisionMap.get(item.car_id)?.decision;
      const counts = countsMap?.get(item.car_id) || { seller_auction_ended: 0, dealer_bid_accepted: 0, dealer_bid_declined: 0, seller_ready_for_pickup: 0 } as any;
      
      return {
        item,
        sellerName,
        sellerEmail,
        sellerPhone,
        dealerPersonName,
        dealerEmail,
        decision,
        counts
      };
    });

    // Then filter based on search query
    if (!searchQuery.trim()) {
      return allItems;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return allItems.filter(({ sellerEmail, sellerPhone, dealerEmail }) => {
      // Search in dealer email
      if (dealerEmail && dealerEmail.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in seller email
      if (sellerEmail && sellerEmail.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in seller phone (remove spaces and dashes for better matching)
      if (sellerPhone) {
        const normalizedPhone = sellerPhone.replace(/[\s-]/g, '');
        const normalizedQuery = query.replace(/[\s-]/g, '');
        if (normalizedPhone.includes(normalizedQuery)) {
          return true;
        }
      }
      
      return false;
    });
  }, [items, data, decisionMap, countsMap, searchQuery]);

  if (isLoading) return <div>Loading outcomes...</div>;
  if (error) return <div className="text-destructive">Failed to load outcomes</div>;

  return (
    <main className="space-y-6">
      <SectionHeader />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by dealer email, seller email, or seller phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing results matching: <span className="font-medium">{searchQuery}</span>
          </p>
        )}
      </div>
      <section className="grid gap-4">
        {enhanced.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No recent outcomes found.</p>
            )}
          </div>
        ) : (
          enhanced.map(({ item, sellerName, sellerEmail, sellerPhone, dealerPersonName, dealerEmail, decision, counts }) => (
            <AuctionOutcomeCard
              key={item.id}
              item={item}
              sellerName={sellerName}
              sellerEmail={sellerEmail}
              sellerPhone={sellerPhone}
              dealerPersonName={dealerPersonName}
              dealerEmail={dealerEmail}
              decision={decision}
              counts={counts}
              onEmailSent={() => {
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
