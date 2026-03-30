import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";

/** Returns elapsed seconds for the current session. */
export function useSessionTimer() {
  const { currentSession } = useSessionStore();
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentSession) {
      setElapsed(0);
      return;
    }

    const startedAt = new Date(currentSession.started_at).getTime();

    rafRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      if (rafRef.current) clearInterval(rafRef.current);
    };
  }, [currentSession?.id]);

  const format = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return { elapsed, formatted: format(elapsed) };
}
