import { useAppStore } from "@/stores/appStore";
import type { PanelTab } from "@/types";
import {
  FileText,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Clock,
  type LucideIcon,
} from "lucide-react";

interface Tab {
  id: PanelTab;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: "chat", label: "Coach", icon: MessageSquare },
  { id: "problem", label: "Problem", icon: FileText },
  { id: "hints", label: "Hints", icon: Lightbulb },
  { id: "patterns", label: "Patterns", icon: BookOpen },
  { id: "history", label: "History", icon: Clock },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="flex items-center px-2 py-1.5 gap-0.5 border-b border-white/5">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`no-drag flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                        transition-colors duration-150
                        ${
                          active
                            ? "bg-accent-purple/20 text-accent-purple"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
          >
            <Icon size={12} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
