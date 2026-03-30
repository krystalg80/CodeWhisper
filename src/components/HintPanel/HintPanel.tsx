import { useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { HINT_LEVEL_LABELS, HINT_LEVEL_DESCRIPTIONS, type HintLevel } from "@/types";
import { Loader2, ChevronRight, Lock } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

const HINT_COLORS: Record<HintLevel, string> = {
  1: "border-green-500/30 bg-green-500/5",
  2: "border-blue-500/30 bg-blue-500/5",
  3: "border-amber-500/30 bg-amber-500/5",
  4: "border-red-500/30 bg-red-500/5",
};

const HINT_TEXT_COLORS: Record<HintLevel, string> = {
  1: "text-green-400",
  2: "text-blue-400",
  3: "text-amber-400",
  4: "text-red-400",
};

export function HintPanel() {
  const { hintLevel, requestHint, isSendingMessage, upgradeHintLevel } = useSessionStore();
  const { settings } = useAppStore();
  const [usedLevels, setUsedLevels] = useState<Set<HintLevel>>(new Set());

  const hasApiKey = Boolean(settings.apiKey);

  const handleRequestHint = async (level: HintLevel) => {
    if (level > hintLevel + 1 || !hasApiKey) return;
    setUsedLevels((s) => new Set([...s, level]));
    if (level > hintLevel) upgradeHintLevel();
    await requestHint();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3 space-y-3">
      {/* Current hint level indicator */}
      <div className="text-center">
        <p className="text-xs text-white/30">Current hint level</p>
        <p className={`text-lg font-semibold mt-0.5 ${HINT_TEXT_COLORS[hintLevel as HintLevel]}`}>
          Level {hintLevel} — {HINT_LEVEL_LABELS[hintLevel as HintLevel]}
        </p>
        <p className="text-xs text-white/30 mt-0.5">
          {HINT_LEVEL_DESCRIPTIONS[hintLevel as HintLevel]}
        </p>
      </div>

      <div className="h-px bg-white/5" />

      {/* Hint ladder */}
      <div className="space-y-2">
        {([1, 2, 3, 4] as HintLevel[]).map((level) => {
          const isUnlocked = level <= hintLevel;
          const isNext = level === hintLevel + 1;
          const isLocked = level > hintLevel + 1;
          const wasUsed = usedLevels.has(level);

          return (
            <div
              key={level}
              className={`rounded-xl border p-3 transition-all duration-200
                ${isUnlocked || isNext
                  ? HINT_COLORS[level]
                  : "border-white/5 bg-dark-700/50 opacity-50"
                }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isUnlocked || isNext ? HINT_TEXT_COLORS[level] : "text-white/30"
                    }`}
                  >
                    Level {level}
                  </span>
                  <span
                    className={`text-xs ${
                      isUnlocked || isNext ? "text-white/60" : "text-white/25"
                    }`}
                  >
                    {HINT_LEVEL_LABELS[level]}
                  </span>
                </div>
                {isLocked && <Lock size={11} className="text-white/25" />}
              </div>

              <p
                className={`text-xs mb-2.5 ${
                  isUnlocked || isNext ? "text-white/50" : "text-white/20"
                }`}
              >
                {HINT_LEVEL_DESCRIPTIONS[level]}
              </p>

              {(isUnlocked || isNext) && hasApiKey && (
                <button
                  onClick={() => handleRequestHint(level)}
                  disabled={isSendingMessage}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg
                              transition-colors disabled:opacity-50
                              ${HINT_TEXT_COLORS[level]}
                              hover:bg-white/5`}
                >
                  {isSendingMessage ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <ChevronRight size={11} />
                  )}
                  {wasUsed ? "Ask again" : isNext ? "Unlock & ask" : "Ask this level"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!hasApiKey && (
        <p className="text-xs text-amber-400/60 text-center">
          Add API key in Settings to use hints
        </p>
      )}
    </div>
  );
}
