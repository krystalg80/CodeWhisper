import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseUid = session.metadata?.supabase_uid;
    const planId = session.metadata?.plan_id ?? "pro";

    if (!supabaseUid) {
      return new Response("Missing supabase_uid in metadata", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate a license key
    const licenseKey = `CW-${crypto.randomUUID().toUpperCase().replace(/-/g, "").slice(0, 16)}`;

    // Determine expiry (lifetime = null, monthly = 1 year rolling)
    const expiresAt = planId === "pro_lifetime"
      ? null
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", supabaseUid)
      .single();

    // Insert license
    await supabase.from("licenses").insert({
      license_key: licenseKey,
      user_id: supabaseUid,
      email: profile?.email,
      plan: planId === "pro_lifetime" ? "lifetime" : "pro",
      is_active: true,
      expires_at: expiresAt,
    });

    // Send license key via Supabase auth email (optional — log for now)
    console.log(`License created for ${supabaseUid}: ${licenseKey}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
