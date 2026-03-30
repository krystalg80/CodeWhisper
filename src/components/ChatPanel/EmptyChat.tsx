import { MessageSquare, KeyRound } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";

interface Props {
  hasApiKey: boolean;
}

const SUGGESTIONS = [
  "What should I start with?",
  "I don't understand the problem",
  "Give me a hint",
  "What pattern does this use?",
];

export function EmptyChat({ hasApiKey }: Props) {
  const { sendMessage } = useSessionStore();

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-accent-purple/10 flex items-center justify-center">
        {hasApiKey ? (
          <MessageSquare size={18} className="text-accent-purple/60" />
        ) : (
          <KeyRound size={18} className="text-amber-400/60" />
        )}
      </div>

      {hasApiKey ? (
        <>
          <p className="text-sm text-white/50 font-medium">Ready to coach</p>
          <p className="text-xs text-white/30 max-w-[220px]">
            Paste your problem in the Problem tab, then ask me anything — or
            request a hint below.
          </p>
          <div className="mt-2 space-y-1.5 text-left w-full max-w-[240px]">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="w-full text-left text-xs px-3 py-1.5 rounded-lg
                           bg-dark-600 text-white/50 hover:text-white/80 hover:bg-dark-500
                           transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-white/50 font-medium">API key required</p>
          <p className="text-xs text-white/30 max-w-[220px]">
            Open Settings and add your Anthropic API key to enable AI coaching.
          </p>
        </>
      )}
    </div>
  );
}
