import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Validates a license key for the unauthenticated in-app "enter license key"
// flow. Runs with the service role so it can look up the licenses table
// without relying on a permissive RLS policy — it only ever returns the
// minimal fields the app needs, never the raw row or other users' data.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key } = await req.json();
    if (!license_key || typeof license_key !== "string") {
      throw new Error("Missing license_key");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("licenses")
      .select("is_active, plan, email, expires_at")
      .eq("license_key", license_key)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return new Response(JSON.stringify({ valid: false }), { headers: corsHeaders });
    }

    // Treat an expired subscription as inactive even if is_active hasn't
    // been flipped by the webhook yet.
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false }), { headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({
        valid: true,
        plan: data.plan,
        email: data.email,
        expires_at: data.expires_at,
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});
