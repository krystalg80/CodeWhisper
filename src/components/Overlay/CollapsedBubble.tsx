import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { useAppStore } from "@/stores/appStore";
import { useSessionStore } from "@/stores/sessionStore";

// The collapsed window is only 64x64px (see OverlayWindow.tsx) — just big enough for the
// bubble. The right-click menu is wider than that, so the window itself has to grow while
// the menu is open or its content gets clipped by the OS window frame (not a CSS overflow
// issue — fixed-position content still can't render outside the actual window bounds).
const MENU_W = 200;
const MENU_H = 150;
const COLLAPSED_W = 64;
const COLLAPSED_H = 64;

export function CollapsedBubble() {
  const { toggleExpanded } = useAppStore();
  const { isSendingMessage } = useSessionStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    if (menuOpen) {
      win.setSize(new LogicalSize(MENU_W, MENU_H));
    } else {
      win.setSize(new LogicalSize(COLLAPSED_W, COLLAPSED_H));
    }
  }, [menuOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const handleMinimize = async () => {
    setMenuOpen(false);
    await getCurrentWindow().minimize();
  };

  return (
    <div data-tauri-drag-region className="relative w-full h-full" onClick={() => menuOpen && setMenuOpen(false)}>
      <button
        onClick={toggleExpanded}
        onContextMenu={handleContextMenu}
        className="no-drag absolute top-2 left-2 w-12 h-12 rounded-2xl glass glass-border
                   flex items-center justify-center
                   hover:scale-105 transition-all duration-200
                   relative overflow-hidden"
        style={{ boxShadow: "none" }}
        title="Open CodeWhisper · Right-click for options"
      >
        {isSendingMessage && (
          <span className="absolute inset-0 rounded-2xl border border-ca-purple/40 animate-ping" />
        )}
        <img src="/c-mark.png" alt="" className="w-8 h-8" draggable={false} />
      </button>

      {menuOpen && (
        <div
          className="no-drag absolute z-50 rounded-xl overflow-hidden shadow-xl"
          style={{
            left: 8,
            top: 56,
            width: MENU_W - 16,
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
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
            onClick={() => { setMenuOpen(false); getCurrentWindow().hide(); }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            Hide to Tray
          </button>
        </div>
      )}
    </div>
  );
}
