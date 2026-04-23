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

  const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
  if (sessionError || !session) throw new Error("Session expired — please sign out and sign in again");

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const res = await fetch(`/functions/v1/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
      "x-user-token": session.access_token,
    },
    body: JSON.stringify({ plan_id: planId }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? JSON.stringify(json));
  if (!json.url) throw new Error("No checkout URL returned");

  return json.url;
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
