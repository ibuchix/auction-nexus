import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Existing envs
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://sdvakfhmoaoucmhbhwvy.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// New configurable envs (with safe defaults)
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@auto-strada.pl";
const FROM_NAME = Deno.env.get("RESEND_FROM_NAME") ?? "Auto‑Strada";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://auto-strada.pl";
const FROM_HEADER = `${FROM_NAME} <${FROM_EMAIL}>`;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || "", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    headers: {
      apikey: SERVICE_ROLE_KEY || "",
      Authorization: `Bearer ${SERVICE_ROLE_KEY || ""}`,
    },
  },
});
const resend = new Resend(RESEND_API_KEY || "");

interface NotifyRequest {
  type: "seller_auction_ended" | "dealer_bid_accepted" | "dealer_bid_declined";
  carId: string;
  dealerId?: string;
}

async function getSellerUserId(carId: string) {
  const summary = await getCarSummary(carId);
  return (summary as any)?.seller_id as string | undefined;
}

async function getDealerUserId(dealerId: string) {
  const { data, error } = await supabase.rpc('get_dealer_user_id', { p_dealer_id: dealerId });
  if (error) throw error;
  return data as string | undefined;
}

async function getUserEmail(userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw error;
  return data?.user?.email as string | undefined;
}

async function getCarSummary(carId: string) {
  const { data, error } = await supabase.rpc('get_car_summary_for_notifications', { p_car_id: carId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as { seller_id?: string; title?: string; make?: string; model?: string; year?: number; auction_end_time?: string } | null;
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log("[send-notifications] email_sending", { to, from: FROM_HEADER, subject });

  // Use Resend's standard response shape
  const { data, error } = await resend.emails.send({
    from: FROM_HEADER,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("[send-notifications] email_failed", {
      to,
      from: FROM_HEADER,
      subject,
      error: { name: error.name, message: error.message },
    });
    throw new Error(error.message || "Resend send failed");
  }

  console.log("[send-notifications] email_sent", {
    to,
    from: FROM_HEADER,
    subject,
    messageId: data?.id,
  });

  return { messageId: data?.id };
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

    // Parse and log the request
    const { type, carId, dealerId }: NotifyRequest = await req.json();
    console.log("[send-notifications] request_received", { type, carId, dealerId, from: FROM_HEADER });

    const car = await getCarSummary(carId);
    const carLabel = car ? `${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim() : `Car ${carId}`;
    console.log("[send-notifications] car_summary", { carId, carLabel, title: car?.title });

    if (type === "seller_auction_ended") {
      const sellerUserId = await getSellerUserId(carId);
      console.log("[send-notifications] seller_lookup", { carId, sellerUserId });
      if (!sellerUserId) throw new Error("Seller not found for car");

      const email = await getUserEmail(sellerUserId);
      console.log("[send-notifications] seller_email_resolved", { sellerUserId, email });
      if (!email) throw new Error("Seller email not found");

      const subject = `Your auction has ended: ${carLabel}`;
      const html = `
        <h2>Your auction has ended</h2>
        <p>Your listing ${carLabel} has ended. Please log in to your dashboard to accept or decline the highest bid.</p>
        <p><a href="${SITE_URL}/seller/auctions">Go to your dashboard</a></p>
      `;

      const { messageId } = await sendEmail(email, subject, html);

      // Mark that we sent notification (via SECURITY DEFINER RPC)
      const { data: markData, error: markError } = await supabase.rpc('mark_car_email_notification_sent', { p_car_id: carId });
      console.log("[send-notifications] notification_marked", { carId, result: markData, error: markError?.message });

      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === "dealer_bid_accepted") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      console.log("[send-notifications] dealer_lookup", { dealerId, dealerUserId });
      if (!dealerUserId) throw new Error("Dealer user not found");

      const email = await getUserEmail(dealerUserId);
      console.log("[send-notifications] dealer_email_resolved", { dealerUserId, email });
      if (!email) throw new Error("Dealer email not found");

      const subject = `Bid accepted for ${carLabel}`;
      const html = `
        <h2>Congratulations!</h2>
        <p>Your bid for ${carLabel} has been accepted by the seller. Please log in to complete the next steps.</p>
        <p><a href="${SITE_URL}/dealer/wins">View your wins</a></p>
      `;

      const { messageId } = await sendEmail(email, subject, html);

      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
        dealerId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === "dealer_bid_declined") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      console.log("[send-notifications] dealer_lookup", { dealerId, dealerUserId });
      if (!dealerUserId) throw new Error("Dealer user not found");

      const email = await getUserEmail(dealerUserId);
      console.log("[send-notifications] dealer_email_resolved", { dealerUserId, email });
      if (!email) throw new Error("Dealer email not found");

      const subject = `Bid declined for ${carLabel}`;
      const html = `
        <h2>Update on your bid</h2>
        <p>Your bid for ${carLabel} was declined by the seller. You can continue browsing and bidding on other vehicles.</p>
        <p><a href="${SITE_URL}/auctions">Browse auctions</a></p>
      `;

      const { messageId } = await sendEmail(email, subject, html);

      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
        dealerId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      return new Response(JSON.stringify({ error: "Unsupported type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (err: any) {
    console.error("[send-notifications] error", { message: err?.message, stack: err?.stack });
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
