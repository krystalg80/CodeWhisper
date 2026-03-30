import { invoke } from "@tauri-apps/api/core";
import type {
  ChatMessage,
  CoachResponse,
  LicenseValidationResult,
  OcrResult,
  ProblemAnalysis,
  Session,
  SessionCountResult,
  ScreenshotResult,
} from "@/types";

// ── Screen ────────────────────────────────────────────────────────────────────

export const captureScreen = (screenIndex?: number) =>
  invoke<ScreenshotResult>("capture_screen", { screenIndex });

export const getActiveWindowTitle = () =>
  invoke<string>("get_active_window_title");

// ── OCR ───────────────────────────────────────────────────────────────────────

export const extractTextFromScreenshot = (base64Png: string) =>
  invoke<OcrResult>("extract_text_from_screenshot", { base64Png });

// ── Audio ─────────────────────────────────────────────────────────────────────

export const startAudioCapture = () => invoke("start_audio_capture");
export const stopAudioCapture = () => invoke("stop_audio_capture");

export const transcribeAudio = (audioBase64: string, modelPath?: string) =>
  invoke<{ text: string; language: string; duration_ms: number }>(
    "transcribe_audio",
    { audioBase64, modelPath }
  );

// ── Claude ────────────────────────────────────────────────────────────────────

export const sendCoachMessage = (params: {
  apiKey: string;
  userMessage: string;
  problemText: string;
  currentCode: string;
  hintLevel: number;
  conversationHistory: Array<{ role: string; content: string }>;
}) =>
  invoke<CoachResponse>("send_coach_message", {
    apiKey: params.apiKey,
    userMessage: params.userMessage,
    problemText: params.problemText,
    currentCode: params.currentCode,
    hintLevel: params.hintLevel,
    conversationHistory: params.conversationHistory,
  });

export const analyzeProblem = (apiKey: string, problemText: string) =>
  invoke<ProblemAnalysis>("analyze_problem", { apiKey, problemText });

// ── Database ──────────────────────────────────────────────────────────────────

export const createSession = (input: {
  title?: string;
  problemText?: string;
  problemSource?: string;
}) =>
  invoke<Session>("create_session", {
    input: {
      title: input.title,
      problem_text: input.problemText,
      problem_source: input.problemSource,
    },
  });

export const getSession = (id: string) =>
  invoke<Session>("get_session", { id });

export const listSessions = () => invoke<Session[]>("list_sessions");

export const updateSession = (input: {
  id: string;
  title?: string;
  problemText?: string;
  patternsIdentified?: string[];
  hintLevelReached?: number;
  endedAt?: string;
  durationSeconds?: number;
  notes?: string;
  isCompleted?: boolean;
}) =>
  invoke<Session>("update_session", {
    input: {
      id: input.id,
      title: input.title,
      problem_text: input.problemText,
      patterns_identified: input.patternsIdentified,
      hint_level_reached: input.hintLevelReached,
      ended_at: input.endedAt,
      duration_seconds: input.durationSeconds,
      notes: input.notes,
      is_completed: input.isCompleted,
    },
  });

export const deleteSession = (id: string) =>
  invoke<void>("delete_session", { id });

export const saveMessage = (input: {
  sessionId: string;
  role: string;
  content: string;
  hintLevel?: number;
}) =>
  invoke<ChatMessage>("save_message", {
    input: {
      session_id: input.sessionId,
      role: input.role,
      content: input.content,
      hint_level: input.hintLevel,
    },
  });

export const getSessionMessages = (sessionId: string) =>
  invoke<ChatMessage[]>("get_session_messages", { sessionId });

// ── Freemium ──────────────────────────────────────────────────────────────────

export const getSessionCount = () =>
  invoke<SessionCountResult>("get_session_count");

export const validateLicenseKey = (
  licenseKey: string,
  supabaseUrl: string,
  supabaseAnonKey: string
) =>
  invoke<LicenseValidationResult>("validate_license_key", {
    licenseKey,
    supabaseUrl,
    supabaseAnonKey,
  });
