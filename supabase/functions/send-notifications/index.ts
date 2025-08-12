import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://sdvakfhmoaoucmhbhwvy.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || "");
const resend = new Resend(RESEND_API_KEY || "");

interface NotifyRequest {
  type: "seller_auction_ended" | "dealer_bid_accepted" | "dealer_bid_declined";
  carId: string;
  dealerId?: string;
}

async function getSellerUserId(carId: string) {
  const { data, error } = await supabase
    .from("cars")
    .select("seller_id, title, make, model, year")
    .eq("id", carId)
    .maybeSingle();
  if (error) throw error;
  return data?.seller_id as string | undefined;
}

async function getDealerUserId(dealerId: string) {
  const { data, error } = await supabase
    .from("dealers")
    .select("user_id, dealership_name")
    .eq("id", dealerId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id as string | undefined;
}

async function getUserEmail(userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw error;
  return data?.user?.email as string | undefined;
}

async function getCarSummary(carId: string) {
  const { data, error } = await supabase
    .from("cars")
    .select("title, make, model, year, auction_end_time")
    .eq("id", carId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await resend.emails.send({
    from: "Admin <no-reply@resend.dev>",
    to: [to],
    subject,
    html,
  });
  return res;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY secret" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, carId, dealerId }: NotifyRequest = await req.json();

    const car = await getCarSummary(carId);
    const carLabel = car ? `${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim() : `Car ${carId}`;

    if (type === "seller_auction_ended") {
      const sellerUserId = await getSellerUserId(carId);
      if (!sellerUserId) throw new Error("Seller not found for car");
      const email = await getUserEmail(sellerUserId);
      if (!email) throw new Error("Seller email not found");

      await sendEmail(
        email,
        `Your auction has ended: ${carLabel}`,
        `<h2>Your auction has ended</h2>
         <p>Your listing ${carLabel} has ended. Please log in to your dashboard to accept or decline the highest bid.</p>
         <p><a href="/seller/auctions">Go to your dashboard</a></p>`
      );

      // Mark that we sent notification
      await supabase.from("cars").update({ email_notification_sent: true }).eq("id", carId);
    } else if (type === "dealer_bid_accepted") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      if (!dealerUserId) throw new Error("Dealer user not found");
      const email = await getUserEmail(dealerUserId);
      if (!email) throw new Error("Dealer email not found");

      await sendEmail(
        email,
        `Bid accepted for ${carLabel}`,
        `<h2>Congratulations!</h2>
         <p>Your bid for ${carLabel} has been accepted by the seller. Please log in to complete the next steps.</p>
         <p><a href="/dealer/wins">View your wins</a></p>`
      );
    } else if (type === "dealer_bid_declined") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      if (!dealerUserId) throw new Error("Dealer user not found");
      const email = await getUserEmail(dealerUserId);
      if (!email) throw new Error("Dealer email not found");

      await sendEmail(
        email,
        `Bid declined for ${carLabel}`,
        `<h2>Update on your bid</h2>
         <p>Your bid for ${carLabel} was declined by the seller. You can continue browsing and bidding on other vehicles.</p>
         <p><a href="/auctions">Browse auctions</a></p>`
      );
    } else {
      return new Response(JSON.stringify({ error: "Unsupported type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-notifications error", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
