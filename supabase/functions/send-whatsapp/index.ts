import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TWILIO_FROM_NUMBER = "+48459569800";
const WHATSAPP_CONTENT_SID = "HX59c13261dc7029887afdc2be35bd6a3a";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    if (!TWILIO_ACCOUNT_SID) throw new Error("TWILIO_ACCOUNT_SID is not configured");

    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    if (!TWILIO_AUTH_TOKEN) throw new Error("TWILIO_AUTH_TOKEN is not configured");

    console.log("[send-whatsapp] Using direct Twilio API. Account SID prefix:", TWILIO_ACCOUNT_SID.substring(0, 6));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    const body = await req.json();
    const { dealerId, phoneNumber, messageBody, carId, useTemplate, contentVariables } = body;

    if (!dealerId || typeof dealerId !== "string") {
      return new Response(JSON.stringify({ error: "dealerId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!phoneNumber || typeof phoneNumber !== "string" || !/^\+\d{7,15}$/.test(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: "phoneNumber must be E.164 format (e.g. +48123456789)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For free-form mode, messageBody is required
    if (!useTemplate) {
      if (!messageBody || typeof messageBody !== "string" || messageBody.length > 1600) {
        return new Response(
          JSON.stringify({ error: "messageBody is required and max 1600 chars" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build Twilio request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const params: Record<string, string> = {
      To: `whatsapp:${phoneNumber}`,
      From: `whatsapp:${TWILIO_FROM_NUMBER}`,
    };

    if (useTemplate) {
      params.ContentSid = WHATSAPP_CONTENT_SID;
      // Only add ContentVariables if provided and non-empty
      if (contentVariables && Object.keys(contentVariables).length > 0) {
        params.ContentVariables = typeof contentVariables === "string"
          ? contentVariables
          : JSON.stringify(contentVariables);
        console.log("[send-whatsapp] ContentVariables:", params.ContentVariables);
      }
      console.log("[send-whatsapp] Using template. ContentSid:", WHATSAPP_CONTENT_SID);
    } else {
      params.Body = messageBody;
      console.log("[send-whatsapp] Using free-form body. Length:", messageBody.length);
    }

    const requestBody = new URLSearchParams(params);

    console.log("[send-whatsapp] Twilio URL:", twilioUrl);
    console.log("[send-whatsapp] Request To:", params.To);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    });

    const twilioResponseText = await twilioResponse.text();
    console.log("[send-whatsapp] Twilio response status:", twilioResponse.status);
    console.log("[send-whatsapp] Twilio response body:", twilioResponseText.substring(0, 500));

    let twilioData: Record<string, unknown>;
    try {
      twilioData = JSON.parse(twilioResponseText);
    } catch {
      twilioData = { raw: twilioResponseText.substring(0, 500) };
    }

    const status = twilioResponse.ok ? "queued" : "failed";
    const errorMessage = twilioResponse.ok ? null : JSON.stringify(twilioData);

    // Determine the message body to log
    const logMessageBody = useTemplate
      ? `[Template: ${WHATSAPP_CONTENT_SID}] ${params.ContentVariables}`
      : messageBody;

    // Log to database using service role for insert
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("whatsapp_message_log").insert({
      dealer_id: dealerId,
      car_id: carId || null,
      phone_number: phoneNumber,
      message_body: logMessageBody,
      twilio_message_sid: (twilioData as Record<string, string>).sid || null,
      status,
      error_message: errorMessage,
      sent_by: userId,
    });

    if (!twilioResponse.ok) {
      throw new Error(`Twilio API error [${twilioResponse.status}]: ${JSON.stringify(twilioData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageSid: (twilioData as Record<string, string>).sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[send-whatsapp] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
