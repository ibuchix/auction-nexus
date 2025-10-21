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
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "powiadomienia@autaro.pl";
const FROM_NAME = Deno.env.get("RESEND_FROM_NAME") ?? "Autaro";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.autaro.pl";
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

// Custom email template for seller auction ended
function buildSellerAuctionEndedEmail(carSummary: { make?: string; model?: string; year?: number }, winningBid: number): string {
  const carTitle = `${carSummary.year ?? ""} ${carSummary.make ?? ""} ${carSummary.model ?? ""}`.trim();
  const formattedBid = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(winningBid);
  
  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <link href="https://fonts.googleapis.com/css?family=Heebo:ital,wght@0,400;0,500;0,600" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,700" rel="stylesheet" />
  <title>Oferta za Twój samochód jest już dostępna</title>
  <style>
    html,body{margin:0!important;padding:0!important;min-height:100%!important;width:100%!important;-webkit-font-smoothing:antialiased}*{-ms-text-size-adjust:100%}table,td,th{mso-table-lspace:0!important;mso-table-rspace:0!important;border-collapse:collapse}body,td,th,p,div,li,a,span{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;mso-line-height-rule:exactly}img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}@media(max-width:620px){.pc-project-body{min-width:0!important}.pc-project-container,.pc-component{width:100%!important}.pc-w620-padding-60-20-10-20{padding:60px 20px 10px 20px!important}.pc-w620-padding-35-35-35-35{padding:35px!important}.pc-w620-font-size-58px{font-size:48px!important}}
  </style>
</head>
<body style="width:100%!important;min-height:100%!important;margin:0!important;padding:0!important;font-weight:normal;color:#2D3A41;-webkit-font-smoothing:antialiased;background-color:#ffffff">
  <table class="pc-project-body" style="table-layout:fixed;width:100%;min-width:600px;background-color:#ffffff" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" valign="top">
        <table class="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:20px 0" align="left" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-60-20-10-20" style="padding:20px 40px 0;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:0 0 60px 0">
                                <a href="https://www.autaro.pl" target="_blank" style="text-decoration:none;display:inline-block">
                                  <img src="https://s1.designmodo.com/postcards/Color_logo_-_no_background_3-62d212ce.png" width="250" height="60" alt="Autaro" style="display:block;outline:0;line-height:100%;width:250px;height:auto;max-width:100%;border:0" />
                                </a>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="left" valign="top" style="padding:0 0 40px 0">
                                <div style="font-size:55px;line-height:107%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <span style="font-weight:400">Oferta za Twój samochód jest już dostępna</span><span style="font-weight:500">!</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:0 0 16px 0">Dzisiejsza aukcja Twojego samochodu <strong>${carTitle}</strong> właśnie się zakończyła, a my otrzymaliśmy najwyższą ofertę w wysokości <strong>${formattedBid}</strong>.</p>
                                  <p style="margin:0 0 16px 0">Wejdź teraz na panel główny swojego konta sprzedawcy na Autaro.pl, aby zobaczyć pełne szczegóły oferty i móc ją zaakceptować.</p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0">
                            <tr>
                              <td align="left">
                                <a style="display:inline-block;padding:14px 19px;border-radius:8px;background-color:#d81b24;font-family:'Heebo',Arial,Helvetica,sans-serif;font-weight:600;font-size:15px;line-height:24px;color:#ffffff;text-decoration:none" href="${SITE_URL}/dashboard/seller" target="_blank">Sprawdź swoją ofertę tutaj!</a>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:16px 0">Po zaakceptowaniu poinformujemy zwycięski komis i będziemy Cię na bieżąco informować o odbiorze Twojego auta.</p>
                                  <p style="margin:16px 0">W razie pytań po prostu odpowiedz na tego maila lub zadzwoń do naszego zespołu obsługi klienta pod numer +48 459 569 800 – chętnie pomożemy.</p>
                                  <p style="margin:16px 0">Dziękujemy za wybór Autaro do sprzedaży swojego samochodu.</p>
                                  <p style="margin:16px 0">Pozdrawiamy,</p>
                                  <p style="margin:16px 0;font-weight:500">Zespół Autaro.pl<br>☎️ +48 459 569 800<br>💻 <a href="https://www.autaro.pl" style="color:#2828da;text-decoration:underline">https://www.autaro.pl</a></p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:40px 0">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td style="line-height:1px;font-size:1px;border-bottom:1px solid #454545">&nbsp;</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-35-35-35-35" style="padding:10px 40px;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 10px 0">
                                <div style="font-size:32px;line-height:42px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;font-weight:700;text-align:center">Nasi Partnerzy</div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/CV_LOGO_BLUE-100de287.png" width="200" height="28" alt="CV Logo" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/autobaza_logo-2f75d44e.png" width="200" height="57" alt="Autobaza" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" class="pc-component" style="width:600px;max-width:600px">
                      <tr>
                        <td style="padding:64px 0 0;border-top:1px solid #515151;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding:0 32px 40px 32px">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.instagram.com/autaro.pl?igsh=cWJsdmw3MjQzM2h6" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/5824fa1145af8c65daf7d1711c7c1a11.png" width="20" height="20" alt="Instagram" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.facebook.com/share/1FtEdJoydU/?mibextid=wwXIfr" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/6b9792335937bf7bdc7f02a4cc5cfaf0.png" width="20" height="20" alt="Facebook" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.tiktok.com/@autaro.pl_?_t=ZN-901Ze5hU79i&_r=1" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/2af904415ed6d2a464ea4a319c5271f5.png" width="20" height="20" alt="TikTok" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 30px 39px 30px">
                                <div style="font-size:14px;line-height:20px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;text-align:center">
                                  <a href="${SITE_URL}/unsubscribe" style="text-decoration:underline;color:#454545">Tutaj</a> możesz zrezygnować z otrzymywania tych e-maili.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Generic email template for other notification types
function buildGenericEmailHtml(opts: { title: string; body: string; ctaText: string; ctaHref: string }) {
  const { title, body, ctaText, ctaHref } = opts;
  return `
  <div style="background:#f6f7f9;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.06)">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #eef2f7;background:linear-gradient(90deg,#111827, #1f2937);">
          <img src="${BRAND_LOGO_URL}" alt="Autaro logo" style="height:28px;display:block;filter:brightness(200%)" />
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
          © ${new Date().getFullYear()} Autaro. All rights reserved.
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

async function getWinningBid(carId: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('amount')
    .eq('car_id', carId)
    .order('amount', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error("[send-notifications] get_winning_bid_error", { carId, error: error.message });
    return 0;
  }
  return data?.amount ?? 0;
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

      // Get winning bid amount
      const winningBid = await getWinningBid(carId);
      console.log("[send-notifications] winning_bid_fetched", { carId, winningBid });

      const subject = `Oferta za Twój samochód jest już dostępna - ${carLabel}`;
      const html = buildSellerAuctionEndedEmail(car || {}, winningBid);
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
      const html = buildGenericEmailHtml({
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
      const html = buildGenericEmailHtml({
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
      const html = buildGenericEmailHtml({
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
