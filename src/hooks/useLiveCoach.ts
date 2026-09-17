import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { captureScreen, extractTextFromScreenshot } from "@/lib/tauri";

const POLL_INTERVAL_MS = 12_000;
const CHANGE_THRESHOLD_CHARS = 15;

export function useLiveCoach() {
  const { isLiveCoach } = useAppStore();
  const { applyLiveTick } = useSessionStore();

  const lastTextRef = useRef("");
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!isLiveCoach) {
      lastTextRef.current = "";
      return;
    }

    const tick = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      try {
        const screenshot = await captureScreen();
        const ocr = await extractTextFromScreenshot(screenshot.base64_png);
        const newText = ocr.text.trim();

        const charDelta = Math.abs(newText.length - lastTextRef.current.length);
        if (charDelta >= CHANGE_THRESHOLD_CHARS) {
          lastTextRef.current = newText;
          await applyLiveTick(newText);
        } else if (!lastTextRef.current) {
          // First tick — record baseline without sending (nothing to compare yet)
          lastTextRef.current = newText;
        }
      } catch (err) {
        console.error("Live Coach tick failed:", err);
      } finally {
        isRunningRef.current = false;
      }
    };

    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isLiveCoach, applyLiveTick]);
}
