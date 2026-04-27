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
  const { setIsPro, setTrialDaysRemaining, user, setUser } = useAppStore();
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

    // Compute trial days remaining from signup date
    if (user.created_at) {
      const trialEnd = new Date(new Date(user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
      const msLeft = trialEnd.getTime() - Date.now();
      setTrialDaysRemaining(Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000))));
    }

    getSessionCount()
      .then(({ is_pro }) => { if (is_pro) setIsPro(true); })
      .catch(() => {});
    loadSessions();

    return () => {};
  }, [user]);

  if (!user) {
    return (
      <div className="h-full w-full flex items-start justify-start">
        <div className="flex flex-col w-full h-full glass rounded-2xl shadow-overlay overflow-hidden animate-fade-in">
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
