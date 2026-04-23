import { createClient } from "@supabase/supabase-js";

// These are injected from env vars at build time — never hardcode secrets here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function checkUserLicense(userId: string): Promise<boolean> {
  if (!supabase) return false;

  // Check by user_id first, then fall back to email (handles multiple auth providers)
  const { data: byId } = await supabase
    .from("licenses")
    .select("is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (byId) return true;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data: byEmail } = await supabase
    .from("licenses")
    .select("is_active")
    .eq("email", user.email)
    .eq("is_active", true)
    .maybeSingle();
  return !!byEmail;
}
