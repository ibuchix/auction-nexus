import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const diagnostics: Record<string, unknown> = { timestamp: new Date().toISOString() };

  try {
    // 1. Check env vars
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");

    diagnostics.account_sid_present = !!TWILIO_ACCOUNT_SID;
    diagnostics.account_sid_prefix = TWILIO_ACCOUNT_SID ? TWILIO_ACCOUNT_SID.substring(0, 6) + "..." : "MISSING";
    diagnostics.auth_token_present = !!TWILIO_AUTH_TOKEN;
    diagnostics.auth_token_prefix = TWILIO_AUTH_TOKEN ? TWILIO_AUTH_TOKEN.substring(0, 4) + "..." : "MISSING";

    if (!TWILIO_ACCOUNT_SID) {
      diagnostics.error = "TWILIO_ACCOUNT_SID is not configured";
      return new Response(JSON.stringify(diagnostics), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!TWILIO_AUTH_TOKEN) {
      diagnostics.error = "TWILIO_AUTH_TOKEN is not configured";
      return new Response(JSON.stringify(diagnostics), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Auth check (admin only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      diagnostics.error = "No auth header";
      return new Response(JSON.stringify(diagnostics), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      diagnostics.error = "Invalid JWT";
      return new Response(JSON.stringify(diagnostics), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) {
      diagnostics.error = "Not admin";
      return new Response(JSON.stringify(diagnostics), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Call Twilio API directly
    const testUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json?PageSize=1`;
    const basicAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    diagnostics.twilio_url = testUrl;
    diagnostics.method = "direct_api";

    console.log("[debug-twilio] Calling Twilio directly:", testUrl);

    const twilioResponse = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    const responseBody = await twilioResponse.text();
    diagnostics.twilio_status = twilioResponse.status;
    diagnostics.twilio_status_text = twilioResponse.statusText;

    try {
      diagnostics.twilio_response = JSON.parse(responseBody);
    } catch {
      diagnostics.twilio_response = responseBody.substring(0, 500);
    }

    console.log("[debug-twilio] Twilio response status:", twilioResponse.status);
    console.log("[debug-twilio] Twilio response body:", responseBody.substring(0, 300));

    diagnostics.success = twilioResponse.ok;

    return new Response(JSON.stringify(diagnostics, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[debug-twilio] Error:", error);
    diagnostics.error = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify(diagnostics, null, 2), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
