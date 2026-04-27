import { useState, useRef, useEffect } from "react";
import { Send, Plus, StopCircle, Loader2, Code2, ChevronDown, ChevronUp, Lightbulb, ChevronRight, CheckCircle2 } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { useAppStore } from "@/stores/appStore";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { HINT_LEVEL_LABELS, type HintLevel } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { EmptyChat } from "./EmptyChat";

export function ChatPanel() {
  const {
    messages, sendMessage, isSendingMessage,
    currentSession, startNewSession, endCurrentSession, markSolved,
    currentCode, setCurrentCode,
    hintLevel, requestHint, upgradeHintLevel,
  } = useSessionStore();
  const { setActiveTab } = useAppStore();
  const { formatted: elapsed } = useSessionTimer();
  const [input, setInput] = useState("");
  const [showCode, setShowCode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isSendingMessage) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasApiKey = true; // Proxy handles auth — no user API key needed

  return (
    <div className="flex flex-col h-full">
      {/* Session bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-surface-border/60">
        {currentSession ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-ca-teal animate-pulse-slow" />
            <span className="text-xs text-tx-secondary flex-1 truncate">
              {currentSession.title}
            </span>
            <span className="text-xs text-tx-tertiary font-mono">{elapsed}</span>
            {currentSession.is_solved ? (
              <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                <CheckCircle2 size={11} />
                Solved
              </span>
            ) : (
              <button
                onClick={markSolved}
                title="Mark this problem as solved"
                className="flex items-center gap-1 text-xs text-green-500/60
                           hover:text-green-500 transition-colors"
              >
                <CheckCircle2 size={11} />
                Solved
              </button>
            )}
            <button
              onClick={endCurrentSession}
              className="flex items-center gap-1 text-xs text-ca-red/60
                         hover:text-ca-red transition-colors"
            >
              <StopCircle size={11} />
              End
            </button>
          </>
        ) : (
          <button
            onClick={() => startNewSession()}
            className="flex items-center gap-1.5 text-xs text-tx-secondary
                       hover:text-tx-primary transition-colors"
          >
            <Plus size={12} />
            New Session
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0
          ? <EmptyChat hasApiKey={hasApiKey} />
          : messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        }
        {isSendingMessage && (
          <div className="flex items-center gap-2 text-tx-tertiary text-xs pl-8">
            <Loader2 size={11} className="animate-spin" />
            <span>CodeWhisper is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Code attachment */}
      {hasApiKey && (
        <div className="border-t border-surface-border/60">
          <button
            onClick={() => setShowCode((v) => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs
                       text-tx-tertiary hover:text-tx-secondary transition-colors"
          >
            <Code2 size={11} />
            <span className="flex-1 text-left">
              {currentCode.trim() ? "Code attached" : "Attach your code (optional)"}
            </span>
            {currentCode.trim() && (
              <span className="text-ca-teal text-[10px]">●</span>
            )}
            {showCode ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showCode && (
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="Paste your current solution here..."
              className="w-full bg-surface-muted text-xs text-tx-secondary font-mono
                         px-3 py-2 outline-none resize-none placeholder:text-tx-tertiary
                         border-t border-surface-border/60 max-h-28 overflow-y-auto selectable"
              rows={4}
            />
          )}
        </div>
      )}

      {/* Hint level strip */}
      {hasApiKey && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 border-t border-surface-border/60">
          <Lightbulb size={11} className={`flex-shrink-0 ${
            hintLevel === 1 ? "text-hint-1" :
            hintLevel === 2 ? "text-hint-2" :
            hintLevel === 3 ? "text-hint-3" : "text-hint-4"
          }`} />
          <span className="text-xs text-tx-tertiary whitespace-nowrap">
            Level {hintLevel} · {HINT_LEVEL_LABELS[hintLevel as HintLevel]}
          </span>
          <button
            onClick={async () => {
              if (hintLevel < 4) upgradeHintLevel();
              await requestHint();
            }}
            disabled={isSendingMessage}
            className="text-xs text-ca-blue/80 hover:text-ca-blue font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {hintLevel < 4 ? `Get hint →` : "Ask again"}
          </button>
          <button
            onClick={() => setActiveTab("hints")}
            className="ml-auto flex items-center gap-0.5 text-[10px] text-tx-tertiary hover:text-tx-secondary transition-colors whitespace-nowrap"
          >
            All levels <ChevronRight size={9} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-surface-border/60 px-3 py-2">
        {!hasApiKey ? (
          <p className="text-xs text-ca-amber/70 text-center py-2">
            Add your Claude API key in Settings to start coaching
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the coach... (Enter to send)"
              rows={1}
              className="flex-1 bg-surface-muted rounded-xl px-3 py-2 text-xs
                         text-tx-primary placeholder:text-tx-tertiary outline-none
                         resize-none border border-surface-border/60
                         focus:border-ca-blue/40 focus:glow-blue
                         transition-all overflow-y-auto selectable"
              style={{ minHeight: "36px", maxHeight: "96px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSendingMessage}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-ca-blue/20
                         border border-ca-blue/30 text-ca-blue
                         flex items-center justify-center
                         hover:bg-ca-blue/30 transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={13} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
