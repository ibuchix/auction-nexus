import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "tracking-salt-2025");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const {
      code,
      event_type,
      session_id,
      visitor_id,
      user_id,
      referrer,
      page_url,
      metadata,
    } = body;

    if (!event_type || !visitor_id) {
      return new Response(
        JSON.stringify({ error: "event_type and visitor_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: max 10 events per visitor per minute
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentCount } = await supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitor_id)
      .gte("created_at", oneMinuteAgo);

    if (recentCount !== null && recentCount >= 10) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve link code
    let linkId: string | null = null;
    if (code) {
      const { data: link } = await supabase
        .from("tracking_links")
        .select("id, is_active")
        .eq("code", code)
        .single();

      if (link?.is_active) {
        linkId = link.id;
      }
    }

    // For link_click: deduplicate by visitor_id + link_id within 1 hour
    if (event_type === "link_click" && linkId) {
      const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
      const { count: existingClicks } = await supabase
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("visitor_id", visitor_id)
        .eq("link_id", linkId)
        .eq("event_type", "link_click")
        .gte("created_at", oneHourAgo);

      if (existingClicks !== null && existingClicks > 0) {
        return new Response(
          JSON.stringify({ success: true, deduplicated: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Hash IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIP(ip);

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from("tracking_events")
      .insert({
        link_id: linkId,
        event_type,
        session_id: session_id || null,
        visitor_id,
        user_id: user_id || null,
        ip_hash: ipHash,
        user_agent: req.headers.get("user-agent") || null,
        referrer: referrer || null,
        page_url: page_url || null,
        metadata: metadata || {},
      })
      .select("id")
      .single();

    if (eventError) {
      console.error("Event insert error:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to log event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment click_count for link_click events
    if (event_type === "link_click" && linkId) {
      await supabase.rpc("increment_click_count", { _link_id: linkId });
    }

    // Create conversion record for conversion event types
    const conversionTypes = [
      "valuation_started",
      "valuation_completed",
      "registration",
      "listing_submitted",
    ];
    if (conversionTypes.includes(event_type) && linkId && event) {
      await supabase.from("tracking_conversions").insert({
        link_id: linkId,
        event_id: event.id,
        conversion_type: event_type,
        user_id: user_id || null,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Track event error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
