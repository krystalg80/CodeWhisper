import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { captureScreen, extractTextFromScreenshot } from "@/lib/tauri";

/**
 * Periodically captures the screen and runs OCR when isCapturing is true.
 * Extracted text is set as the problem text if the problem field is empty.
 */
export function useScreenCapture() {
  const { isCapturing, settings, setLastScreenshot } = useAppStore();
  const { problemText, setProblemText } = useSessionStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isCapturing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const run = async () => {
      try {
        const screenshot = await captureScreen();
        setLastScreenshot(screenshot.base64_png);

        // Only auto-populate problem text if blank
        if (!problemText.trim()) {
          const ocr = await extractTextFromScreenshot(screenshot.base64_png);
          if (ocr.text.trim()) {
            setProblemText(ocr.text);
          }
        }
      } catch {
        // Silently skip failed captures (e.g., permission not yet granted)
      }
    };

    run(); // immediate first capture
    intervalRef.current = setInterval(run, settings.captureIntervalSeconds * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCapturing, settings.captureIntervalSeconds]);
}
