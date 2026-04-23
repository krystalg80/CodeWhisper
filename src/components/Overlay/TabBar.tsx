import { useAppStore } from "@/stores/appStore";
import type { PanelTab } from "@/types";
import {
  FileText, MessageSquare, Lightbulb, BookOpen, Clock,
  type LucideIcon,
} from "lucide-react";

interface Tab { id: PanelTab; label: string; icon: LucideIcon }

const TABS: Tab[] = [
  { id: "chat",     label: "Coach",    icon: MessageSquare },
  { id: "problem",  label: "Problem",  icon: FileText },
  { id: "hints",    label: "Hints",    icon: Lightbulb },
  { id: "patterns", label: "Patterns", icon: BookOpen },
  { id: "history",  label: "History",  icon: Clock },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="flex items-center px-2 py-1.5 gap-0.5 border-b border-surface-border/60">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`no-drag flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                        font-medium transition-all duration-150
                        ${active
                          ? "bg-ca-blue/10 text-ca-blue"
                          : "text-tx-secondary hover:text-tx-primary hover:bg-surface-overlay"
                        }`}
          >
            <Icon size={11} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
