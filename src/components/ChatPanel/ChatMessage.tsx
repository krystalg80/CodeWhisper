import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "@/types";
import { HINT_LEVEL_LABELS } from "@/types";
import { Bot, User } from "lucide-react";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
          ${
            isAssistant
              ? "bg-accent-purple/20 text-accent-purple"
              : "bg-dark-500 text-white/50"
          }`}
      >
        {isAssistant ? <Bot size={12} /> : <User size={12} />}
      </div>

      {/* Bubble */}
      <div
        className={`flex-1 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-0.5`}
      >
        {/* Hint level badge */}
        {isAssistant && message.hint_level && message.hint_level > 0 && (
          <span className="text-[10px] text-accent-purple/60 ml-0.5">
            {HINT_LEVEL_LABELS[message.hint_level as keyof typeof HINT_LEVEL_LABELS]}
          </span>
        )}

        <div
          className={`px-3 py-2 rounded-xl text-xs leading-relaxed
            ${
              isUser
                ? "bg-accent-purple/20 text-white/80 rounded-tr-sm"
                : isAssistant
                ? "bg-dark-600 text-white/80 rounded-tl-sm"
                : "bg-dark-700 text-white/50 italic"
            }`}
        >
          {isAssistant ? (
            <ReactMarkdown
              className="prose prose-invert prose-xs max-w-none
                         prose-p:my-1 prose-ul:my-1 prose-li:my-0
                         prose-code:bg-dark-500 prose-code:px-1 prose-code:rounded
                         prose-pre:bg-dark-500 prose-pre:p-2 prose-pre:rounded-lg"
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        <span className="text-[10px] text-white/20 mx-0.5">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
