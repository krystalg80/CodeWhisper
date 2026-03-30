// ── Session ───────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  title: string;
  problem_text: string;
  problem_source?: "screen_capture" | "manual" | "paste";
  patterns_identified?: string; // JSON-encoded string[]
  hint_level_reached: number;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  notes?: string;
  is_completed: number; // SQLite 0/1
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  hint_level?: number;
  timestamp: string;
}

// ── Claude ────────────────────────────────────────────────────────────────────

export interface CoachResponse {
  message: string;
  pattern_hint?: string;
  hint_level: number;
  input_tokens: number;
  output_tokens: number;
}

export interface ProblemAnalysis {
  problem_title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];
  key_constraints: string[];
  suggested_data_structures: string[];
}

// ── Screen / OCR ──────────────────────────────────────────────────────────────

export interface ScreenshotResult {
  base64_png: string;
  width: number;
  height: number;
  screen_index: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

// ── Auth / Licensing ──────────────────────────────────────────────────────────

export interface SessionCountResult {
  total: number;
  free_remaining: number;
  is_pro: boolean;
}

export interface LicenseValidationResult {
  valid: boolean;
  plan: string;
  message: string;
}

// ── Algorithm Patterns ────────────────────────────────────────────────────────

export interface AlgorithmPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  when_to_use: string[];
  time_complexity: string;
  space_complexity: string;
  example_problems: string[];
  key_signals: string[]; // clues in the problem that suggest this pattern
  template_hint: string; // pseudocode skeleton
}

// ── UI State ──────────────────────────────────────────────────────────────────

export type PanelTab = "problem" | "chat" | "hints" | "patterns" | "history";

export type HintLevel = 1 | 2 | 3 | 4;

export const HINT_LEVEL_LABELS: Record<HintLevel, string> = {
  1: "Nudge",
  2: "Pattern Hint",
  3: "Approach Hint",
  4: "Pseudocode",
};

export const HINT_LEVEL_DESCRIPTIONS: Record<HintLevel, string> = {
  1: "A subtle nudge — a Socratic question about constraints",
  2: "Hints at the pattern category without naming it",
  3: "Names the pattern and asks how it applies",
  4: "Pseudocode structure only — no code written for you",
};
