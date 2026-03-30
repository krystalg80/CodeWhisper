// Stripe integration — payments are handled server-side via Supabase Edge Functions.
// The frontend only needs to redirect to the Stripe Checkout URL, which is
// created by the Edge Function and returned to the client.

import { supabase } from "./supabase";

export interface CheckoutSession {
  url: string;
}

export const STRIPE_PLANS = {
  pro_monthly: {
    name: "CodeWhisper Pro",
    price: "$9/month",
    features: [
      "Unlimited sessions",
      "Full hint ladder",
      "Session history",
      "Pattern library",
      "Priority support",
    ],
  },
  pro_lifetime: {
    name: "CodeWhisper Lifetime",
    price: "$79 once",
    features: [
      "Everything in Pro",
      "Lifetime updates",
      "No recurring fee",
    ],
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

/**
 * Call the Supabase Edge Function that creates a Stripe Checkout session
 * and returns a redirect URL. Opens in the system browser via Tauri shell.
 */
export async function createCheckoutSession(planId: PlanId): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Must be signed in to subscribe");

  const { data, error } = await supabase.functions.invoke<CheckoutSession>(
    "create-checkout",
    {
      body: { plan_id: planId },
    }
  );

  if (error) throw new Error(`Checkout error: ${error.message}`);
  if (!data?.url) throw new Error("No checkout URL returned");

  return data.url;
}

/**
 * Call the Supabase Edge Function that creates a customer portal session.
 */
export async function createPortalSession(): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } =
    await supabase.functions.invoke<CheckoutSession>("create-portal");

  if (error) throw new Error(`Portal error: ${error.message}`);
  if (!data?.url) throw new Error("No portal URL returned");

  return data.url;
}
