import { useAppStore } from "@/stores/appStore";
import { CollapsedBubble } from "./CollapsedBubble";
import { ExpandedPanel } from "./ExpandedPanel";

export function OverlayWindow() {
  const { isExpanded } = useAppStore();

  return (
    <div className="h-full w-full flex items-start justify-start">
      {isExpanded ? <ExpandedPanel /> : <CollapsedBubble />}
    </div>
  );
}
