import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "@/types";
import { HINT_LEVEL_LABELS } from "@/types";
import { Bot, User, Radio } from "lucide-react";

interface Props { message: ChatMessageType }

export function ChatMessage({ message }: Props) {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
        ${isAssistant
          ? "bg-ca-purple/15 text-ca-purple"
          : "bg-surface-muted text-tx-secondary"
        }`}
      >
        {isAssistant ? <Bot size={11} /> : <User size={11} />}
      </div>

      {/* Bubble */}
      <div className={`min-w-0 flex-1 max-w-[86%] flex flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}>
        {isAssistant && (
          <div className="flex items-center gap-1.5 ml-0.5">
            {message.is_revealed ? (
              <span className="flex items-center gap-0.5 text-[10px] text-ca-teal/80 font-medium">
                Solution revealed
              </span>
            ) : message.is_auto ? (
              <span className="flex items-center gap-0.5 text-[10px] text-ca-red/70 font-medium">
                <Radio size={9} />
                Auto
              </span>
            ) : null}
            {!message.is_revealed && message.hint_level && message.hint_level > 0 && (
              <span className="text-[10px] text-ca-purple/60 font-medium">
                {HINT_LEVEL_LABELS[message.hint_level as keyof typeof HINT_LEVEL_LABELS]}
              </span>
            )}
          </div>
        )}

        <div className={`w-full min-w-0 px-3 py-2 rounded-xl text-xs leading-relaxed selectable overflow-hidden
          ${isUser
            ? "bg-ca-blue/15 text-tx-primary border border-ca-blue/20 rounded-tr-sm"
            : isAssistant
            ? "bg-surface-raised text-tx-primary border border-surface-border/60 rounded-tl-sm"
            : "bg-surface-muted text-tx-secondary italic"
          }`}
        >
          {isAssistant ? (
            <ReactMarkdown
              className="prose prose-invert prose-xs max-w-none break-words
                         [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0
                         [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5
                         [&_code]:rounded [&_code]:text-ca-teal [&_code]:text-[11px]
                         [&_code]:break-all
                         [&_pre]:bg-surface-muted [&_pre]:p-2.5 [&_pre]:rounded-lg
                         [&_pre]:overflow-x-auto [&_pre_code]:break-normal
                         [&_strong]:text-tx-primary
                         [&_table]:w-full [&_table]:text-[11px] [&_table]:border-collapse
                         [&_th]:px-2 [&_th]:py-1 [&_th]:border [&_th]:border-surface-border/60 [&_th]:text-left
                         [&_td]:px-2 [&_td]:py-1 [&_td]:border [&_td]:border-surface-border/60"
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="break-words">{message.content}</p>
          )}
        </div>

        <span className="text-[10px] text-tx-tertiary mx-0.5">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
