import { X, Minus, Settings } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { SettingsModal } from "@/components/Auth/SettingsModal";
import { useState } from "react";

export function TitleBar() {
  const { toggleExpanded, currentSession } = { ...useAppStore(), ...useSessionStore() };
  const [showSettings, setShowSettings] = useState(false);

  const handleMinimize = async () => {
    toggleExpanded();
  };

  const handleClose = async () => {
    await getCurrentWindow().hide();
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        {/* Left: logo + title */}
        <div className="flex items-center gap-2 no-drag">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <span className="text-sm font-semibold text-gradient">
            CodeWhisper
          </span>
          {currentSession && (
            <span className="text-xs text-white/30 font-normal truncate max-w-[120px]">
              · {currentSession.title}
            </span>
          )}
        </div>

        {/* Right: window controls */}
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={() => setShowSettings(true)}
            className="w-6 h-6 rounded flex items-center justify-center
                       text-white/40 hover:text-white/80 hover:bg-white/10
                       transition-colors"
            title="Settings"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={handleMinimize}
            className="w-6 h-6 rounded flex items-center justify-center
                       text-white/40 hover:text-white/80 hover:bg-white/10
                       transition-colors"
            title="Collapse"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded flex items-center justify-center
                       text-white/40 hover:text-red-400 hover:bg-red-500/10
                       transition-colors"
            title="Hide to tray"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
