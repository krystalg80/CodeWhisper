import { useState, useRef, useEffect } from "react";
import { Send, Plus, StopCircle, Loader2, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { useAppStore } from "@/stores/appStore";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { ChatMessage } from "./ChatMessage";
import { EmptyChat } from "./EmptyChat";

export function ChatPanel() {
  const {
    messages,
    sendMessage,
    isSendingMessage,
    currentSession,
    startNewSession,
    endCurrentSession,
    currentCode,
    setCurrentCode,
  } = useSessionStore();
  const { settings } = useAppStore();
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

  const hasApiKey = Boolean(settings.apiKey);

  return (
    <div className="flex flex-col h-full">
      {/* Session controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
        {currentSession ? (
          <>
            <span className="text-xs text-white/30 flex-1 truncate">
              {currentSession.title}
            </span>
            <span className="text-xs text-white/20 font-mono">{elapsed}</span>
            <button
              onClick={endCurrentSession}
              className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400
                         transition-colors"
            >
              <StopCircle size={11} />
              End
            </button>
          </>
        ) : (
          <button
            onClick={() => startNewSession()}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70
                       transition-colors"
          >
            <Plus size={12} />
            New Session
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <EmptyChat hasApiKey={hasApiKey} />
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isSendingMessage && (
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <Loader2 size={12} className="animate-spin" />
            <span>CodeWhisper is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Code snippet (collapsible) */}
      {hasApiKey && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setShowCode((v) => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs
                       text-white/30 hover:text-white/50 transition-colors"
          >
            <Code2 size={11} />
            <span className="flex-1 text-left">
              {currentCode.trim() ? "Code attached" : "Attach your code (optional)"}
            </span>
            {showCode ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showCode && (
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="Paste your current solution here so the coach can see it..."
              className="w-full bg-dark-700 text-xs text-white/60 font-mono
                         px-3 py-2 outline-none resize-none placeholder:text-white/20
                         border-t border-white/5 max-h-28 overflow-y-auto"
              rows={4}
            />
          )}
        </div>
      )}

      {/* Message input */}
      <div className="flex-shrink-0 border-t border-white/5 px-3 py-2">
        {!hasApiKey ? (
          <p className="text-xs text-amber-400/70 text-center py-2">
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
              className="flex-1 bg-dark-600 rounded-lg px-3 py-2 text-xs text-white/80
                         placeholder:text-white/25 outline-none resize-none
                         border border-white/5 focus:border-accent-purple/40
                         transition-colors overflow-y-auto"
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
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-purple
                         flex items-center justify-center text-white
                         hover:bg-accent-purple/80 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={13} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
