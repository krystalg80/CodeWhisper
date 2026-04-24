import { useAppStore } from "@/stores/appStore";
import { TitleBar } from "./TitleBar";
import { TabBar } from "./TabBar";
import { ProblemPanel } from "@/components/ProblemPanel/ProblemPanel";
import { ChatPanel } from "@/components/ChatPanel/ChatPanel";
import { HintPanel } from "@/components/HintPanel/HintPanel";
import { PatternLibrary } from "@/components/PatternLibrary/PatternLibrary";
import { SessionHistory } from "@/components/Session/SessionHistory";
import { UpgradePrompt } from "@/components/Subscription/UpgradePrompt";
import type { PanelTab } from "@/types";

const PANELS: Record<PanelTab, React.ComponentType> = {
  problem: ProblemPanel,
  chat: ChatPanel,
  hints: HintPanel,
  patterns: PatternLibrary,
  history: SessionHistory,
};

export function ExpandedPanel() {
  const { activeTab, isPro, trialDaysRemaining, settings } = useAppStore();

  const ActivePanel = PANELS[activeTab];
  const showUpgrade = !isPro && trialDaysRemaining <= 0;

  return (
    <div
      className="flex flex-col w-full h-full glass glass-border rounded-2xl
                 shadow-overlay animate-fade-in overflow-hidden"
      style={{ opacity: settings.overlayOpacity / 100 }}
    >
      <div data-tauri-drag-region className="flex-shrink-0">
        <TitleBar />
      </div>
      <div className="flex-shrink-0">
        <TabBar />
      </div>
      <div className="flex-1 overflow-hidden">
        {showUpgrade && activeTab === "chat" ? (
          <UpgradePrompt />
        ) : (
          <ActivePanel />
        )}
      </div>
    </div>
  );
}
