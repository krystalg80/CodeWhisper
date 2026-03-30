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
        <Loader2 size={18} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-2">
        <Clock size={24} className="text-white/20" />
        <p className="text-sm text-white/40">No sessions yet</p>
        <p className="text-xs text-white/25">
          Start a session in the Coach tab to begin your practice history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/5">
        <p className="text-xs text-white/40">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {sessions.map((session) => {
          const patterns = getPatterns(session);
          return (
            <div
              key={session.id}
              className="group px-3 py-2.5 rounded-xl bg-dark-700/60
                         border border-white/5 hover:border-white/10
                         transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => loadSession(session.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-xs font-medium text-white/80 truncate">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30">
                      {formatDate(session.started_at)}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {formatDuration(session.duration_seconds ?? undefined)}
                    </span>
                    <span className="text-[10px] text-white/30">
                      Hint L{session.hint_level_reached}
                    </span>
                  </div>

                  {patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {patterns.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue/70"
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
                               text-white/25 hover:text-red-400 hover:bg-red-500/10
                               transition-all"
                    title="Delete session"
                  >
                    <Trash2 size={11} />
                  </button>
                  <button
                    onClick={() => loadSession(session.id)}
                    className="p-1 text-white/25 hover:text-white/60 transition-colors"
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
