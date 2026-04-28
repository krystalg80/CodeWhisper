import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_IDS: Record<string, string> = {
  pro_monthly: Deno.env.get("STRIPE_PRICE_ID_PRO_MONTHLY") ?? "",
  pro_lifetime: Deno.env.get("STRIPE_PRICE_ID_PRO_LIFETIME") ?? "",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authenticated user from the user token header
    const userToken = req.headers.get("x-user-token") ?? req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!userToken) throw new Error("No user token");

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) throw new Error(`Unauthorized: ${authError?.message}`);

    const { plan_id } = await req.json();
    const priceId = PRICE_IDS[plan_id];
    if (!priceId) throw new Error(`Unknown plan: ${plan_id}`);

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .upsert({ id: user.id, stripe_customer_id: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: plan_id === "pro_lifetime" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `https://codewhisper-ai.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://codewhisper-ai.com/?checkout=cancelled`,
      metadata: { supabase_uid: user.id, plan_id },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
