import { X, Minus, Settings, HelpCircle, Sun, Moon, Radio } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";
import { SettingsModal } from "@/components/Auth/SettingsModal";
import { OnboardingModal } from "@/components/Onboarding/OnboardingModal";
import { useState } from "react";

export function TitleBar() {
  const { theme, toggleTheme, isInterviewMode, toggleInterviewMode, isPro, trialDaysRemaining } = useAppStore();
  const { currentSession, startNewSession, analyzeProblem, problemText } = useSessionStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleInterviewMode = async () => {
    if (!isInterviewMode) {
      // Auto-start a session so the polling has somewhere to save messages
      if (!currentSession) {
        await startNewSession("Interview Session");
        if (problemText.trim()) analyzeProblem();
      }
      toggleInterviewMode();
    } else {
      toggleInterviewMode();
    }
  };

  const handleClose = async () => {
    await getCurrentWindow().hide();
  };

  const handleMinimize = async () => {
    await getCurrentWindow().minimize();
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
          <span className="text-sm font-semibold text-gradient tracking-tight">
            CodeWhisper
          </span>
          {!isPro && trialDaysRemaining > 0 && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{
                background: trialDaysRemaining <= 2 ? "color-mix(in srgb, var(--accent-red) 15%, transparent)" : "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                color: trialDaysRemaining <= 2 ? "var(--accent-red)" : "var(--accent-purple)",
                border: `1px solid ${trialDaysRemaining <= 2 ? "color-mix(in srgb, var(--accent-red) 30%, transparent)" : "color-mix(in srgb, var(--accent-purple) 30%, transparent)"}`,
              }}
            >
              {trialDaysRemaining}d trial
            </span>
          )}
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
            onClick={handleInterviewMode}
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
          <IconButton onClick={handleMinimize} title="Minimize">
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
