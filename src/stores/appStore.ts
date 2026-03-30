import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelTab } from "@/types";

interface AppSettings {
  apiKey: string;
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

  // Audio
  isListening: boolean;
  setListening: (v: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isExpanded: true,
      activeTab: "chat",
      setExpanded: (v) => set({ isExpanded: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

      settings: {
        apiKey: "",
        captureIntervalSeconds: 5,
        hintAutoAdvance: false,
        overlayOpacity: 90,
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

      isListening: false,
      setListening: (v) => set({ isListening: v }),
    }),
    {
      name: "codewhisper-app",
      partialize: (s) => ({
        settings: s.settings,
        isPro: s.isPro,
      }),
    }
  )
);
