import { useSessionStore } from "@/stores/sessionStore";
import { useEffect } from "react";
import { Clock, Trash2, ChevronRight, Loader2 } from "lucide-react";
import type { Session } from "@/types";

export function SessionHistory() {
  const { sessions, loadSessions, loadSession, deleteSession, isLoadingSessions } =
    useSessionStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getPatterns = (session: Session): string[] => {
    try {
      return session.patterns_identified ? JSON.parse(session.patterns_identified) : [];
    } catch {
      return [];
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={18} className="animate-spin text-tx-tertiary" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-2">
        <Clock size={24} className="text-tx-tertiary" />
        <p className="text-sm text-tx-secondary">No sessions yet</p>
        <p className="text-xs text-tx-tertiary">
          Start a session in the Coach tab to begin your practice history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-surface-border/60">
        <p className="text-xs text-tx-tertiary">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {sessions.map((session) => {
          const patterns = getPatterns(session);
          return (
            <div
              key={session.id}
              className="group px-3 py-2.5 rounded-xl bg-surface-raised
                         border border-surface-border/30 hover:border-surface-border/60
                         transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => loadSession(session.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-xs font-medium text-tx-primary truncate">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-tx-tertiary">
                      {formatDate(session.started_at)}
                    </span>
                    <span className="text-[10px] text-tx-tertiary">
                      {formatDuration(session.duration_seconds ?? undefined)}
                    </span>
                    <span className="text-[10px] text-tx-tertiary">
                      Hint L{session.hint_level_reached}
                    </span>
                  </div>

                  {patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {patterns.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-ca-blue/10 text-ca-blue/70"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded
                               text-tx-tertiary hover:text-red-400 hover:bg-red-500/10
                               transition-all"
                    title="Delete session"
                  >
                    <Trash2 size={11} />
                  </button>
                  <button
                    onClick={() => loadSession(session.id)}
                    className="p-1 text-tx-tertiary hover:text-tx-secondary transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
