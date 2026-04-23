import { useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface Step {
  title: string;
  emoji: string;
  description: string;
  tips: string[];
}

const STEPS: Step[] = [
  {
    title: "Welcome to CodeWhisper",
    emoji: "👋",
    description:
      "Your AI coding interview coach. It never gives you the answer — it guides you to find it yourself using the Socratic method.",
    tips: [
      "The overlay stays on top of all your windows",
      "Click the hexagon icon to collapse it out of the way",
      "Drag the title bar to reposition it anywhere",
    ],
  },
  {
    title: "Step 1 — Sign up for free",
    emoji: "🔑",
    description:
      "CodeWhisper handles AI for you — no API key needed. Just create a free account to get started.",
    tips: [
      "3 free coaching sessions included",
      "Upgrade to Pro for unlimited sessions",
      "Your sessions and history are saved to your account",
    ],
  },
  {
    title: "Step 2 — Capture the Problem",
    emoji: "📸",
    description:
      "Open a coding problem in your browser (LeetCode, HackerRank, etc.), then let CodeWhisper read it automatically.",
    tips: [
      "Go to the Problem tab",
      "Click 'Screen OCR' to auto-capture the problem text",
      "Or paste the problem manually if OCR misses something",
      "Hit 'AI Analyze' to get difficulty, patterns, and constraints",
    ],
  },
  {
    title: "Step 3 — Start a Session",
    emoji: "💬",
    description:
      "Switch to the Coach tab and start thinking out loud. The AI responds like a real interview coach.",
    tips: [
      "Ask anything: 'I don't know where to start'",
      "Paste your code using the 'Attach your code' toggle",
      "The coach sees your problem text and code automatically",
      "Each conversation is saved as a session",
    ],
  },
  {
    title: "Step 4 — Use the Hint Ladder",
    emoji: "💡",
    description:
      "Stuck? The Hints tab gives you progressively deeper hints — from a gentle nudge all the way to pseudocode. You can also request hints directly from the Coach tab without switching.",
    tips: [
      "Level 1 (Nudge) — a subtle question about the constraints",
      "Level 2 (Pattern Hint) — hints at the algorithm category",
      "Level 3 (Approach Hint) — names the pattern directly",
      "Level 4 (Pseudocode) — structure only, no code written for you",
      "After 15 auto-coaching cycles, the full solution is revealed once — then the coach only responds to new changes in your code",
    ],
  },
  {
    title: "Step 5 — Interview Mode (LIVE)",
    emoji: "📡",
    description:
      "Practicing for a real interview? Turn on Interview Mode and CodeWhisper coaches you hands-free — no typing required.",
    tips: [
      "Click the 📡 button in the title bar to go LIVE",
      "Checks your screen every 12 seconds and coaches you based on what it sees",
      "Only sends a hint when your code changes or you've been stuck for 45 seconds",
      "After 15 coaching cycles with no solution, it reveals the correct code once with a full explanation",
      "After the solution is shown, it goes quiet — only chimes in again if it detects a new change or error in your code",
      "Turn it off anytime — it stops capturing immediately",
    ],
  },
  {
    title: "Step 6 — Learn the Patterns",
    emoji: "📚",
    description:
      "The Patterns tab has 10 built-in algorithm patterns with templates, complexity, and example problems.",
    tips: [
      "Sliding Window, Two Pointers, BFS/DFS",
      "Dynamic Programming, Binary Search, Backtracking",
      "Heap, Union-Find, and more",
      "Each pattern has a pseudocode template you can reference",
    ],
  },
  {
    title: "You're ready!",
    emoji: "🚀",
    description:
      "You have 3 free sessions to get started. After that, upgrade to Pro for unlimited coaching.",
    tips: [
      "Session history is in the History tab",
      "Use Interview Mode (📡) for hands-free practice during mock interviews",
      "The coach stays Socratic — but reveals the full solution after 15 attempts",
      "Click ? anytime to reopen this guide",
      "Good luck — you've got this!",
    ],
  },
];

interface Props {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[360px] glass glass-border rounded-2xl shadow-overlay
                      overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1 rounded-full transition-all duration-200
                  ${i === step
                    ? "w-6 bg-ca-blue"
                    : i < step
                    ? "w-2 bg-ca-blue/40"
                    : "w-2 bg-surface-border"
                  }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-tx-tertiary hover:text-tx-primary transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          <div className="text-3xl">{current.emoji}</div>
          <h2 className="text-base font-semibold text-tx-primary leading-snug">
            {current.title}
          </h2>
          <p className="text-xs text-tx-secondary leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-2 pt-1">
            {current.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-ca-blue text-xs mt-0.5 flex-shrink-0">›</span>
                <span className="text-xs text-tx-secondary leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-surface-border/60">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-1 text-xs text-tx-secondary
                       hover:text-tx-primary transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={13} />
            Back
          </button>

          <span className="text-xs text-tx-tertiary">
            {step + 1} / {STEPS.length}
          </span>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg
                         bg-ca-blue/20 border border-ca-blue/30 text-ca-blue
                         hover:bg-ca-blue/30 transition-colors font-medium"
            >
              Let's go!
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 text-xs text-tx-secondary
                         hover:text-tx-primary transition-colors"
            >
              Next
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
