import { create } from "zustand";
import type { Session, ChatMessage, HintLevel, ProblemAnalysis } from "@/types";
import * as tauriApi from "@/lib/tauri";
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

    set({ currentSession: null, messages: [], hintLevel: 1, analysis: null });
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
    const apiKey = useAppStore.getState().settings.apiKey;

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

      const response = await tauriApi.sendCoachMessage({
        apiKey,
        userMessage: message,
        problemText,
        currentCode,
        hintLevel,
        conversationHistory: history.slice(0, -1), // exclude the message we just added
      });

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

  analyzeProblem: async () => {
    const { problemText } = get();
    const apiKey = useAppStore.getState().settings.apiKey;
    if (!problemText.trim() || !apiKey) return;

    set({ isAnalyzing: true });
    try {
      const analysis = await tauriApi.analyzeProblem(apiKey, problemText);
      set({ analysis });

      // Persist patterns to current session
      const { currentSession } = get();
      if (currentSession) {
        await tauriApi.updateSession({
          id: currentSession.id,
          patternsIdentified: analysis.patterns,
        });
      }
    } catch {
      // silently fail
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
