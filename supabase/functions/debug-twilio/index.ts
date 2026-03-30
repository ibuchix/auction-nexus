import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const diagnostics: Record<string, unknown> = { timestamp: new Date().toISOString() };

  try {
    // 1. Check env vars
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");

    diagnostics.lovable_key_present = !!LOVABLE_API_KEY;
    diagnostics.lovable_key_prefix = LOVABLE_API_KEY ? LOVABLE_API_KEY.substring(0, 8) + "..." : "MISSING";
    diagnostics.twilio_key_present = !!TWILIO_API_KEY;
    diagnostics.twilio_key_prefix = TWILIO_API_KEY ? TWILIO_API_KEY.substring(0, 8) + "..." : "MISSING";

    if (!LOVABLE_API_KEY) {
      diagnostics.error = "LOVABLE_API_KEY is not configured";
      return new Response(JSON.stringify(diagnostics), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!TWILIO_API_KEY) {
      diagnostics.error = "TWILIO_API_KEY is not configured";
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

    // 3. Call a read-only Twilio endpoint through the gateway
    const testUrl = `${GATEWAY_URL}/IncomingPhoneNumbers.json?PageSize=1`;
    diagnostics.gateway_url = testUrl;

    console.log("[debug-twilio] Calling gateway:", testUrl);
    console.log("[debug-twilio] LOVABLE_API_KEY prefix:", LOVABLE_API_KEY.substring(0, 8));
    console.log("[debug-twilio] TWILIO_API_KEY prefix:", TWILIO_API_KEY.substring(0, 8));

    const gatewayResponse = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
      },
    });

    const responseBody = await gatewayResponse.text();
    diagnostics.gateway_status = gatewayResponse.status;
    diagnostics.gateway_status_text = gatewayResponse.statusText;

    try {
      diagnostics.gateway_response = JSON.parse(responseBody);
    } catch {
      diagnostics.gateway_response = responseBody.substring(0, 500);
    }

    console.log("[debug-twilio] Gateway response status:", gatewayResponse.status);
    console.log("[debug-twilio] Gateway response body:", responseBody.substring(0, 300));

    diagnostics.success = gatewayResponse.ok;

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
