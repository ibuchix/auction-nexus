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

// Branding assets
const BRAND_LOGO_URL = Deno.env.get("BRAND_LOGO_URL") ?? `${SITE_URL}/lovable-uploads/4e69fd8b-b4ed-44b6-a32d-5a7193af37f3.png`;

function buildEmailHtml(opts: { title: string; body: string; ctaText: string; ctaHref: string }) {
  const { title, body, ctaText, ctaHref } = opts;
  return `
  <div style="background:#f6f7f9;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.06)">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #eef2f7;background:linear-gradient(90deg,#111827, #1f2937);">
          <img src="${BRAND_LOGO_URL}" alt="Auto‑Strada logo" style="height:28px;display:block;filter:brightness(200%)" />
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px 8px 24px;">
          <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#111827;">${title}</h1>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#374151;">${body}</p>
          <a href="${ctaHref}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;font-size:14px">${ctaText}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;color:#6b7280;font-size:12px;border-top:1px solid #eef2f7">
          © ${new Date().getFullYear()} Auto‑Strada. All rights reserved.
        </td>
      </tr>
    </table>
  </div>`;
}

async function logEmailEvent(event: { type: string; carId: string; dealerId?: string; to: string; subject: string; messageId?: string }) {
  try {
    await supabase.from('email_notification_events').insert([
      {
        type: event.type,
        car_id: event.carId,
        dealer_id: event.dealerId ?? null,
        recipient_email: event.to,
        subject: event.subject,
        message_id: event.messageId ?? null,
        metadata: {}
      }
    ]);
  } catch (e) {
    console.error('[send-notifications] log_event_failed', { error: (e as Error)?.message });
  }
}

interface NotifyRequest {
  type: "seller_auction_ended" | "dealer_bid_accepted" | "dealer_bid_declined" | "seller_ready_for_pickup";
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
      const html = buildEmailHtml({
        title: 'Your auction has ended',
        body: `Your listing <strong>${carLabel}</strong> has ended. Please log in to your dashboard to accept or decline the highest bid.`,
        ctaText: 'Go to your dashboard',
        ctaHref: `${SITE_URL}/seller/auctions`
      });
      const { messageId } = await sendEmail(email, subject, html);

      // Mark that we sent notification (via SECURITY DEFINER RPC)
      const { data: markData, error: markError } = await supabase.rpc('mark_car_email_notification_sent', { p_car_id: carId });
      console.log("[send-notifications] notification_marked", { carId, result: markData, error: markError?.message });

      // Log event
      await logEmailEvent({ type, carId, to: email, subject, messageId });
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
      const html = buildEmailHtml({
        title: 'Congratulations! Bid accepted',
        body: `Your bid for <strong>${carLabel}</strong> has been accepted by the seller. Please log in to complete the next steps.`,
        ctaText: 'View your wins',
        ctaHref: `${SITE_URL}/dealer/wins`
      });
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, dealerId, to: email, subject, messageId });
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
      const html = buildEmailHtml({
        title: 'Update on your bid',
        body: `Your bid for <strong>${carLabel}</strong> was declined by the seller. You can continue browsing and bidding on other vehicles.`,
        ctaText: 'Browse auctions',
        ctaHref: `${SITE_URL}/auctions`
      });
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, dealerId, to: email, subject, messageId });
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

    } else if (type === "seller_ready_for_pickup") {
      const sellerUserId = await getSellerUserId(carId);
      console.log("[send-notifications] seller_lookup_pickup", { carId, sellerUserId });
      if (!sellerUserId) throw new Error("Seller not found for car");

      const email = await getUserEmail(sellerUserId);
      console.log("[send-notifications] seller_email_resolved_pickup", { sellerUserId, email });
      if (!email) throw new Error("Seller email not found");

      const subject = `Vehicle ready for pickup: ${carLabel}`;
      const html = buildEmailHtml({
        title: 'Vehicle ready for pickup',
        body: `The dealer has completed payment for <strong>${carLabel}</strong> and is ready to arrange pickup. Please coordinate with the dealer for vehicle handover.`,
        ctaText: 'View details',
        ctaHref: `${SITE_URL}/seller/auctions`
      });
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, to: email, subject, messageId });
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
