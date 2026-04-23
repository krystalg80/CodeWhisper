import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useAppStore } from "@/stores/appStore";
import { useInterviewMode } from "@/hooks/useInterviewMode";
import { CollapsedBubble } from "./CollapsedBubble";
import { ExpandedPanel } from "./ExpandedPanel";

const EXPANDED_W = 420;
const EXPANDED_H = 680;
const COLLAPSED_W = 64;
const COLLAPSED_H = 64;

export function OverlayWindow() {
  const { isExpanded } = useAppStore();
  useInterviewMode();

  useEffect(() => {
    const win = getCurrentWindow();
    if (isExpanded) {
      win.setSize(new LogicalSize(EXPANDED_W, EXPANDED_H));
    } else {
      win.setSize(new LogicalSize(COLLAPSED_W, COLLAPSED_H));
    }
  }, [isExpanded]);

  return (
    <div className="h-full w-full flex items-start justify-start">
      {isExpanded ? <ExpandedPanel /> : <CollapsedBubble />}
    </div>
  );
}
