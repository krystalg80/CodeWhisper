import { X, Minus, Settings, HelpCircle, Sun, Moon, Radio } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { SettingsModal } from "@/components/Auth/SettingsModal";
import { OnboardingModal } from "@/components/Onboarding/OnboardingModal";
import { useState } from "react";

export function TitleBar() {
  const { toggleExpanded, theme, toggleTheme, isInterviewMode, toggleInterviewMode } = useAppStore();
  const { currentSession } = useSessionStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleClose = async () => {
    await getCurrentWindow().hide();
  };

  const handleCollapse = () => {
    toggleExpanded(); // shrink to floating bubble
  };

  return (
    <>
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 no-drag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
              stroke="var(--accent-purple)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 11L10.5 13.5L16 8"
              stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-semibold text-gradient tracking-tight">
            CodeWhisper
          </span>
          {currentSession && (
            <span className="text-xs truncate max-w-[90px]" style={{ color: "var(--text-tertiary)" }}>
              · {currentSession.title}
            </span>
          )}
        </div>

        {/* Drag region spacer */}
        <div data-tauri-drag-region className="flex-1 h-full min-h-[36px]" />

        {/* Controls */}
        <div className="flex items-center gap-0.5 no-drag">
          {/* Interview mode toggle */}
          <button
            onClick={toggleInterviewMode}
            title={isInterviewMode ? "Exit interview mode" : "Interview mode — auto-coaches from your screen"}
            className={`no-drag flex items-center gap-1 px-2 h-6 rounded-md text-[10px] font-medium
                        transition-all duration-200
                        ${isInterviewMode
                          ? "bg-ca-red/15 text-ca-red border border-ca-red/30"
                          : "text-tx-tertiary hover:text-tx-primary hover:bg-surface-overlay"
                        }`}
          >
            <Radio size={11} className={isInterviewMode ? "animate-pulse" : ""} />
            {isInterviewMode && <span>LIVE</span>}
          </button>

          <IconButton onClick={() => setShowOnboarding(true)} title="How to use">
            <HelpCircle size={13} />
          </IconButton>
          <IconButton onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </IconButton>
          <IconButton onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={13} />
          </IconButton>
          <IconButton onClick={handleCollapse} title="Hide to tray">
            <Minus size={13} />
          </IconButton>
          <IconButton onClick={handleClose} title="Hide to tray" danger>
            <X size={13} />
          </IconButton>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </>
  );
}

function IconButton({
  onClick, title, danger, children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-6 h-6 rounded-md flex items-center justify-center transition-colors no-drag"
      style={{
        color: "var(--text-tertiary)",
      }}
      onMouseEnter={(e) => {
        if (danger) {
          e.currentTarget.style.color = "var(--accent-red)";
          e.currentTarget.style.background = "color-mix(in srgb, var(--accent-red) 10%, transparent)";
        } else {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.background = "var(--bg-overlay)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-tertiary)";
        e.currentTarget.style.background = "";
      }}
    >
      {children}
    </button>
  );
}
