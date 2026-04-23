import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";

export function CollapsedBubble() {
  const { toggleExpanded } = useAppStore();
  const { isSendingMessage } = useSessionStore();

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full flex items-center justify-center"
    >
      <button
        onClick={toggleExpanded}
        className="no-drag w-12 h-12 rounded-2xl glass glass-border
                   flex items-center justify-center
                   hover:scale-105 transition-all duration-200
                   relative overflow-hidden"
        style={{ boxShadow: "none" }}
        title="Open CodeWhisper"
      >
        {isSendingMessage && (
          <span className="absolute inset-0 rounded-2xl border border-ca-purple/40 animate-ping" />
        )}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke="#bc8cff" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 11L10.5 13.5L16 8"
            stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
