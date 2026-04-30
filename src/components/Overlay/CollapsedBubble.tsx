import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";

export function CollapsedBubble() {
  const { toggleExpanded } = useAppStore();
  const { isSendingMessage } = useSessionStore();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMinimize = async () => {
    setMenu(null);
    await getCurrentWindow().minimize();
  };

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full flex items-center justify-center"
      onClick={() => menu && setMenu(null)}
    >
      <button
        onClick={toggleExpanded}
        onContextMenu={handleContextMenu}
        className="no-drag w-12 h-12 rounded-2xl glass glass-border
                   flex items-center justify-center
                   hover:scale-105 transition-all duration-200
                   relative overflow-hidden"
        style={{ boxShadow: "none" }}
        title="Open CodeWhisper · Right-click for options"
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

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div
            className="fixed z-50 rounded-xl overflow-hidden shadow-xl"
            style={{
              left: menu.x,
              top: menu.y,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              minWidth: 160,
            }}
          >
            <button
              onClick={handleMinimize}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              Minimize to Dock
            </button>
            <button
              onClick={() => { setMenu(null); getCurrentWindow().hide(); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              Hide to Tray
            </button>
          </div>
        </>
      )}
    </div>
  );
}
