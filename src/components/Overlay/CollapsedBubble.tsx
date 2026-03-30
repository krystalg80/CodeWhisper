import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";

export function CollapsedBubble() {
  const { toggleExpanded } = useAppStore();
  const { isSendingMessage } = useSessionStore();

  return (
    <button
      onClick={toggleExpanded}
      className="no-drag w-14 h-14 rounded-full glass glass-border
                 flex items-center justify-center shadow-2xl
                 hover:scale-110 transition-transform duration-200
                 relative overflow-hidden group"
      title="Open CodeWhisper"
    >
      {/* Animated ring when AI is thinking */}
      {isSendingMessage && (
        <span className="absolute inset-0 rounded-full border-2 border-accent-purple animate-ping opacity-60" />
      )}

      {/* Logo / icon */}
      <span className="text-2xl select-none z-10">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 11L10.5 13.5L16 8"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
