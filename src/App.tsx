import { useEffect } from "react";
import { OverlayWindow } from "@/components/Overlay/OverlayWindow";
import { OnboardingModal } from "@/components/Onboarding/OnboardingModal";
import { AuthModal } from "@/components/Auth/AuthModal";
import { TitleBar } from "@/components/Overlay/TitleBar";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { getSessionCount } from "@/lib/tauri";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { supabase, checkUserLicense } from "@/lib/supabase";

function AppInner() {
  useScreenCapture();
  const { hasSeenOnboarding, setHasSeenOnboarding } = useAppStore();

  return (
    <>
      <OverlayWindow />
      {!hasSeenOnboarding && (
        <OnboardingModal onClose={() => setHasSeenOnboarding(true)} />
      )}
    </>
  );
}

export default function App() {
  const { setIsPro, setFreeSessionsRemaining, user, setUser } = useAppStore();
  const { loadSessions } = useSessionStore();

  useEffect(() => {
    // Handle checkout=success redirect from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      window.history.replaceState({}, "", "/");
      // License check will fire automatically via the user effect below
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const refreshLicense = () =>
      checkUserLicense(user.id).then((isPro) => { if (isPro) setIsPro(true); });

    refreshLicense();

    getSessionCount()
      .then(({ is_pro, free_remaining }) => {
        if (is_pro) setIsPro(true);
        setFreeSessionsRemaining(free_remaining);
      })
      .catch(() => {});
    loadSessions();

    // Poll for checkout success from the system browser redirect.
    // When detected, retry license check several times to allow the webhook to land.
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/checkout/poll");
        const { success } = await res.json();
        if (!success) return;
        clearInterval(poll);
        // Retry up to 10 times (20s) waiting for the Stripe webhook to create the license
        let attempts = 0;
        const retry = setInterval(async () => {
          attempts++;
          const isPro = await checkUserLicense(user.id);
          if (isPro) { setIsPro(true); clearInterval(retry); }
          else if (attempts >= 10) clearInterval(retry);
        }, 2000);
      } catch {}
    }, 2000);

    return () => clearInterval(poll);
  }, [user]);

  if (!user) {
    return (
      <div className="h-full w-full flex items-start justify-start">
        <div className="flex flex-col w-full h-full glass glass-border rounded-2xl shadow-overlay overflow-hidden animate-fade-in">
          <div data-tauri-drag-region className="flex-shrink-0">
            <TitleBar />
          </div>
          <AuthModal onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <AppInner />
    </div>
  );
}
