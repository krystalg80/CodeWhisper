import { MessageSquare, KeyRound } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";

const SUGGESTIONS = [
  "What should I start with?",
  "I don't understand the problem",
  "Give me a hint",
  "What pattern does this use?",
];

export function EmptyChat({ hasApiKey }: { hasApiKey: boolean }) {
  const { sendMessage } = useSessionStore();

  return (
    <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-3 px-4">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center
        ${hasApiKey ? "bg-ca-purple/10 border border-ca-purple/20" : "bg-surface-muted border border-surface-border"}`}
      >
        {hasApiKey
          ? <MessageSquare size={16} className="text-ca-purple/70" />
          : <KeyRound size={16} className="text-ca-amber/70" />
        }
      </div>

      {hasApiKey ? (
        <>
          <div>
            <p className="text-sm font-medium text-tx-primary">Ready to coach</p>
            <p className="text-xs text-tx-secondary mt-1 leading-relaxed">
              Paste your problem in the Problem tab, then ask anything below.
            </p>
          </div>
          <div className="w-full space-y-1.5 mt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="w-full text-left text-xs px-3 py-2 rounded-xl
                           bg-surface-raised border border-surface-border/60
                           text-tx-secondary hover:text-tx-primary
                           hover:border-ca-blue/30 hover:bg-surface-overlay
                           transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-tx-primary">API key required</p>
          <p className="text-xs text-tx-secondary leading-relaxed max-w-[200px]">
            Open Settings (gear icon) and add your Anthropic API key.
          </p>
        </>
      )}
    </div>
  );
}
