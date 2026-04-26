import { create } from "zustand";
import type { Session, ChatMessage, HintLevel, ProblemAnalysis } from "@/types";
import * as tauriApi from "@/lib/tauri";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "./appStore";

interface SessionStore {
  // Active session
  currentSession: Session | null;
  messages: ChatMessage[];
  hintLevel: HintLevel;
  problemText: string;
  currentCode: string;
  analysis: ProblemAnalysis | null;
  isAnalyzing: boolean;
  isSendingMessage: boolean;
  autoCoachCount: number;
  solutionRevealed: boolean;

  // History
  sessions: Session[];
  isLoadingSessions: boolean;

  // Actions
  startNewSession: (title?: string) => Promise<void>;
  endCurrentSession: () => Promise<void>;
  setProblemText: (text: string) => void;
  setCurrentCode: (code: string) => void;
  requestHint: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendAutoCoach: (screenText: string) => Promise<void>;
  analyzeProblem: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  upgradeHintLevel: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  messages: [],
  hintLevel: 1,
  problemText: "",
  currentCode: "",
  analysis: null,
  isAnalyzing: false,
  isSendingMessage: false,
  autoCoachCount: 0,
  solutionRevealed: false,
  sessions: [],
  isLoadingSessions: false,

  startNewSession: async (title) => {
    const session = await tauriApi.createSession({
      title: title || `Session ${new Date().toLocaleTimeString()}`,
      problemText: get().problemText,
      problemSource: "manual",
    });
    set({
      currentSession: session,
      messages: [],
      hintLevel: 1,
      analysis: null,
      autoCoachCount: 0,
      solutionRevealed: false,
    });
    useAppStore.getState().setActiveTab("chat");
  },

  endCurrentSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const now = new Date().toISOString();
    const startedAt = new Date(currentSession.started_at).getTime();
    const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);

    await tauriApi.updateSession({
      id: currentSession.id,
      endedAt: now,
      durationSeconds,
      isCompleted: true,
      hintLevelReached: get().hintLevel,
    });

    set({ currentSession: null, messages: [], hintLevel: 1, analysis: null, autoCoachCount: 0, solutionRevealed: false });
    useAppStore.setState({ isInterviewMode: false });
    get().loadSessions();
  },

  setProblemText: (text) => {
    set({ problemText: text });
    // Persist to current session if one is active
    const { currentSession } = get();
    if (currentSession) {
      tauriApi.updateSession({ id: currentSession.id, problemText: text });
    }
  },

  setCurrentCode: (code) => set({ currentCode: code }),

  upgradeHintLevel: () => {
    const { hintLevel } = get();
    if (hintLevel < 4) {
      set({ hintLevel: (hintLevel + 1) as HintLevel });
    }
  },

  requestHint: async () => {
    const { currentSession, hintLevel } = get();
    if (!currentSession) {
      await get().startNewSession();
    }

    const levelLabels: Record<number, string> = {
      1: "I'd like a nudge, please.",
      2: "I'm still stuck — can you hint at the pattern?",
      3: "I need more help — what approach should I use?",
      4: "I need to see the structure — pseudocode please.",
    };

    await get().sendMessage(
      levelLabels[hintLevel] || "Can you give me a hint?"
    );
  },

  sendMessage: async (message: string) => {
    const {
      currentSession,
      messages,
      hintLevel,
      problemText,
      currentCode,
    } = get();

    if (!currentSession) {
      await get().startNewSession();
    }

    const session = get().currentSession!;

    // Persist user message
    const userMsg = await tauriApi.saveMessage({
      sessionId: session.id,
      role: "user",
      content: message,
    });

    const updatedMessages = [...messages, userMsg];
    set({ messages: updatedMessages, isSendingMessage: true });

    try {
      const history = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (!supabase) throw new Error("Supabase not configured");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in — please sign in again.");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const resp = await fetch(`${supabaseUrl}/functions/v1/claude-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": anonKey,
        },
        body: JSON.stringify({
          messages: history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          user_message: message,
          problem_text: problemText,
          current_code: currentCode,
          hint_level: hintLevel,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || data?.msg || `Server error ${resp.status}`);
      if (data?.error === "free_limit_reached") throw new Error(data.message);
      if (!data?.message) throw new Error("Empty response from coach");

      const response = { message: data.message as string };

      const assistantMsg = await tauriApi.saveMessage({
        sessionId: session.id,
        role: "assistant",
        content: response.message,
        hintLevel,
      });

      set({ messages: [...get().messages, assistantMsg] });

      // Auto-upgrade hint level if the user has used the same level twice
    } catch (err) {
      const errMsg = await tauriApi.saveMessage({
        sessionId: session.id,
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
      set({ messages: [...get().messages, errMsg] });
    } finally {
      set({ isSendingMessage: false });
    }
  },

  sendAutoCoach: async (screenText: string) => {
    const { currentSession, hintLevel, problemText, isSendingMessage, autoCoachCount } = get();
    if (isSendingMessage) return;
    if (!currentSession) return;
    const session = currentSession;

    set({ isSendingMessage: true });
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const nextCount = autoCoachCount + 1;
      set({ autoCoachCount: nextCount });

      const resp = await fetch(`${supabaseUrl}/functions/v1/claude-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": anonKey,
        },
        body: JSON.stringify({
          action: "interview",
          problem_text: problemText,
          screen_text: screenText,
          hint_level: hintLevel,
          attempt_count: nextCount,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.message) return;

      const saved = await tauriApi.saveMessage({
        sessionId: session.id,
        role: "assistant",
        content: data.message,
        hintLevel,
      });

      // After revealing the solution, reset counter so future polls go back to Socratic coaching
      if (data.revealed) {
        set({ solutionRevealed: true, autoCoachCount: 0 });
      }

      set({ messages: [...get().messages, { ...saved, is_auto: true, is_revealed: data.revealed ?? false }] });
    } catch (err) {
      console.error("Auto-coach error:", err);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  analyzeProblem: async () => {
    const { problemText } = get();
    if (!problemText.trim()) return;

    set({ isAnalyzing: true });
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      const resp = await fetch(`${supabaseUrl}/functions/v1/claude-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": anonKey,
        },
        body: JSON.stringify({ action: "analyze", problem_text: problemText }),
      });

      if (!resp.ok) throw new Error(`Analysis failed: ${resp.status}`);
      const analysis: ProblemAnalysis = await resp.json();
      set({ analysis });

      const { currentSession } = get();
      if (currentSession) {
        await tauriApi.updateSession({
          id: currentSession.id,
          patternsIdentified: analysis.patterns,
        });
      }
    } catch (err) {
      console.error("analyzeProblem:", err);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  loadSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const sessions = await tauriApi.listSessions();
      set({ sessions });
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  loadSession: async (id: string) => {
    const session = await tauriApi.getSession(id);
    const messages = await tauriApi.getSessionMessages(id);
    set({
      currentSession: session,
      messages,
      hintLevel: (session.hint_level_reached || 1) as HintLevel,
      problemText: session.problem_text,
    });
    useAppStore.getState().setActiveTab("chat");
  },

  deleteSession: async (id: string) => {
    await tauriApi.deleteSession(id);
    set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) }));
    if (get().currentSession?.id === id) {
      set({ currentSession: null, messages: [], hintLevel: 1 });
    }
  },
}));
