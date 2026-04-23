import { useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { HINT_LEVEL_LABELS, HINT_LEVEL_DESCRIPTIONS, type HintLevel } from "@/types";
import { Loader2, ChevronRight, Lock } from "lucide-react";

const HINT_STYLES: Record<HintLevel, { border: string; bg: string; text: string; dot: string }> = {
  1: { border: "border-hint-1/25", bg: "bg-hint-1/5",  text: "text-hint-1",  dot: "bg-hint-1" },
  2: { border: "border-hint-2/25", bg: "bg-hint-2/5",  text: "text-hint-2",  dot: "bg-hint-2" },
  3: { border: "border-hint-3/25", bg: "bg-hint-3/5",  text: "text-hint-3",  dot: "bg-hint-3" },
  4: { border: "border-hint-4/25", bg: "bg-hint-4/5",  text: "text-hint-4",  dot: "bg-hint-4" },
};

export function HintPanel() {
  const { hintLevel, requestHint, isSendingMessage, upgradeHintLevel } = useSessionStore();
  const [usedLevels, setUsedLevels] = useState<Set<HintLevel>>(new Set());
  const hasApiKey = true; // Proxy handles auth

  const handleRequest = async (level: HintLevel) => {
    if (level > hintLevel + 1 || !hasApiKey) return;
    setUsedLevels((s) => new Set([...s, level]));
    if (level > hintLevel) upgradeHintLevel();
    await requestHint();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3 space-y-3">
      {/* Current level */}
      <div className="text-center py-2">
        <p className="text-xs text-tx-tertiary mb-1">Current hint level</p>
        <p className={`text-xl font-bold ${HINT_STYLES[hintLevel as HintLevel].text}`}>
          Level {hintLevel} — {HINT_LEVEL_LABELS[hintLevel as HintLevel]}
        </p>
        <p className="text-xs text-tx-secondary mt-1">
          {HINT_LEVEL_DESCRIPTIONS[hintLevel as HintLevel]}
        </p>
      </div>

      <div className="divider" />

      {/* Ladder */}
      {([1, 2, 3, 4] as HintLevel[]).map((level) => {
        const style = HINT_STYLES[level];
        const isUnlocked = level <= hintLevel;
        const isNext = level === hintLevel + 1;
        const isLocked = level > hintLevel + 1;
        const wasUsed = usedLevels.has(level);

        return (
          <div
            key={level}
            className={`rounded-xl border p-3 transition-all duration-200
              ${isLocked
                ? "border-surface-border/40 bg-surface-raised/40 opacity-40"
                : `${style.border} ${style.bg}`
              }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {!isLocked && (
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                )}
                <span className={`text-xs font-semibold
                  ${isLocked ? "text-tx-tertiary" : style.text}`}>
                  Level {level}
                </span>
                <span className="text-xs text-tx-secondary">
                  {HINT_LEVEL_LABELS[level]}
                </span>
              </div>
              {isLocked && <Lock size={11} className="text-tx-tertiary" />}
            </div>

            <p className="text-xs text-tx-secondary mb-2.5 leading-relaxed">
              {HINT_LEVEL_DESCRIPTIONS[level]}
            </p>

            {(isUnlocked || isNext) && hasApiKey && (
              <button
                onClick={() => handleRequest(level)}
                disabled={isSendingMessage}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg
                            transition-colors disabled:opacity-40 hover:bg-surface-overlay
                            ${style.text}`}
              >
                {isSendingMessage
                  ? <Loader2 size={11} className="animate-spin" />
                  : <ChevronRight size={11} />
                }
                {wasUsed ? "Ask again" : isNext ? "Unlock & ask" : "Ask at this level"}
              </button>
            )}
          </div>
        );
      })}

      {!hasApiKey && (
        <p className="text-xs text-ca-amber/60 text-center py-2">
          Add API key in Settings to use hints
        </p>
      )}
    </div>
  );
}
