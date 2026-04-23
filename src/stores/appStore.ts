import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { PanelTab } from "@/types";

export type Theme = "dark" | "light";

interface AppSettings {
  captureIntervalSeconds: number;
  hintAutoAdvance: boolean;
  overlayOpacity: number;
}

interface AppStore {
  // UI state
  isExpanded: boolean;
  activeTab: PanelTab;
  setExpanded: (v: boolean) => void;
  setActiveTab: (tab: PanelTab) => void;
  toggleExpanded: () => void;

  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // First launch / onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (v: boolean) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;

  // Freemium
  isPro: boolean;
  freeSessionsRemaining: number;
  setIsPro: (v: boolean) => void;
  setFreeSessionsRemaining: (n: number) => void;

  // Screen capture
  isCapturing: boolean;
  lastScreenshot: string | null;
  setCapturing: (v: boolean) => void;
  setLastScreenshot: (s: string | null) => void;

  // Interview mode
  isInterviewMode: boolean;
  toggleInterviewMode: () => void;

  // Audio
  isListening: boolean;
  setListening: (v: boolean) => void;

  // Auth
  user: User | null;
  setUser: (u: User | null) => void;
}

// Detect system preference
const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isExpanded: true,
      activeTab: "chat",
      setExpanded: (v) => set({ isExpanded: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

      theme: getSystemTheme(),
      setTheme: (theme) => {
        document.documentElement.classList.toggle("light", theme === "light");
        set({ theme });
      },
      toggleTheme: () =>
        set((s) => {
          const next: Theme = s.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("light", next === "light");
          return { theme: next };
        }),

      hasSeenOnboarding: false,
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),

      settings: {
        captureIntervalSeconds: 5,
        hintAutoAdvance: false,
        overlayOpacity: 85,
      },
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      isPro: false,
      freeSessionsRemaining: 3,
      setIsPro: (v) => set({ isPro: v }),
      setFreeSessionsRemaining: (n) => set({ freeSessionsRemaining: n }),

      isCapturing: false,
      lastScreenshot: null,
      setCapturing: (v) => set({ isCapturing: v }),
      setLastScreenshot: (s) => set({ lastScreenshot: s }),

      isInterviewMode: false,
      toggleInterviewMode: () => set((s) => ({ isInterviewMode: !s.isInterviewMode })),

      isListening: false,
      setListening: (v) => set({ isListening: v }),

      user: null,
      setUser: (u) => set({ user: u }),
    }),
    {
      name: "codewhisper-app",
      partialize: (s) => ({
        theme: s.theme,
        hasSeenOnboarding: s.hasSeenOnboarding,
        settings: s.settings,
        isPro: s.isPro,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply saved theme on load
        if (state) {
          document.documentElement.classList.toggle("light", state.theme === "light");
        }
      },
    }
  )
);
