import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { captureScreen, extractTextFromScreenshot } from "@/lib/tauri";


const POLL_INTERVAL_MS = 12_000;
const CHANGE_THRESHOLD_CHARS = 15;
const MAX_SILENCE_MS = 45_000;       // nudge if no change after this long
const AUTO_END_AFTER_REVEAL_MS = 3 * 60_000; // auto-end 3 min after reveal with no activity

export function useInterviewMode() {
  const { isInterviewMode } = useAppStore();
  const { sendAutoCoach, solutionRevealed, endCurrentSession } = useSessionStore();

  const lastTextRef = useRef("");
  const lastCoachTimeRef = useRef(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!isInterviewMode) {
      lastTextRef.current = "";
      lastCoachTimeRef.current = 0;
      return;
    }

    // When the effect re-runs because solutionRevealed just became true, the first
    // tick must re-baseline (not coach) — otherwise the newly rendered solution text
    // on screen causes a large charDelta and triggers a spurious nudge.
    let needsRebaseline = solutionRevealed;

    const tick = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      try {
        const screenshot = await captureScreen();
        const ocr = await extractTextFromScreenshot(screenshot.base64_png);
        const newText = ocr.text.trim();

        if (needsRebaseline) {
          needsRebaseline = false;
          lastTextRef.current = newText;
          lastCoachTimeRef.current = Date.now();
          return;
        }

        const charDelta = Math.abs(newText.length - lastTextRef.current.length);
        const msSinceCoach = Date.now() - lastCoachTimeRef.current;
        // After solution is revealed, only coach on real code changes — never on silence
        const shouldCoach =
          charDelta >= CHANGE_THRESHOLD_CHARS ||
          (!solutionRevealed && lastCoachTimeRef.current > 0 && msSinceCoach >= MAX_SILENCE_MS);

        // After solution revealed: auto-end if no activity for 3 minutes
        if (solutionRevealed && charDelta < CHANGE_THRESHOLD_CHARS && msSinceCoach >= AUTO_END_AFTER_REVEAL_MS) {
          await endCurrentSession();
          return;
        }

        if (shouldCoach) {
          lastTextRef.current = newText;
          lastCoachTimeRef.current = Date.now();
          await sendAutoCoach(newText);
        } else if (lastCoachTimeRef.current === 0) {
          // First tick — record baseline but don't send yet
          lastTextRef.current = newText;
          lastCoachTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Interview mode tick failed:", err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // Run immediately on activation, then on interval
    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isInterviewMode, sendAutoCoach, solutionRevealed]);
}
