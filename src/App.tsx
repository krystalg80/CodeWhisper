import { useEffect } from "react";
import { OverlayWindow } from "@/components/Overlay/OverlayWindow";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { getSessionCount } from "@/lib/tauri";
import { useScreenCapture } from "@/hooks/useScreenCapture";

function AppInner() {
  useScreenCapture();
  return <OverlayWindow />;
}

export default function App() {
  const { setIsPro, setFreeSessionsRemaining } = useAppStore();
  const { loadSessions } = useSessionStore();

  useEffect(() => {
    // Load freemium state on startup
    getSessionCount()
      .then(({ is_pro, free_remaining }) => {
        setIsPro(is_pro);
        setFreeSessionsRemaining(free_remaining);
      })
      .catch(() => {
        // DB not ready yet — will retry
      });

    loadSessions();
  }, []);

  return (
    <div className="h-full w-full">
      <AppInner />
    </div>
  );
}
