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
      "7-day free trial — no credit card required",
      "Upgrade to Pro or Lifetime after your trial",
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
      "Stuck? Click 'Get hint →' and CodeWhisper guides you with progressively deeper hints — from a gentle nudge all the way to a code skeleton.",
    tips: [
      "Level 1 (Nudge) — a Socratic question to get you unstuck",
      "Level 2 (Pattern) — names the algorithm pattern",
      "Level 3 (Structure) — gives you a real code skeleton to fill in",
      "Level 4 (Near-complete) — working code with one piece left for you",
      "Clicking the same level twice goes deeper, not in circles",
    ],
  },
  {
    title: "Step 5 — Interview Mode (LIVE)",
    emoji: "📡",
    description:
      "Going into a real interview? Click LIVE and CodeWhisper coaches you hands-free — it watches your screen and nudges you automatically. No typing needed.",
    tips: [
      "Click the 📡 LIVE button in the title bar — it auto-starts a session",
      "Checks your screen every 12 seconds, nudges when your code changes or you've been quiet 45 seconds",
      "Hints auto-escalate the longer you're stuck: gentle → pattern → code skeleton → near-complete",
      "After 20 coaching cycles it reveals the full solution with an explanation",
      "After the reveal it goes quiet — only speaks up again if you make new changes",
      "When LeetCode shows Accepted, click ✓ Solved — saves to history with a green check",
      "Session auto-ends after 3 minutes of no activity post-solution",
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
      "You have a full 7-day free trial to get started — no credit card required. After that, upgrade to Pro or grab a Lifetime license.",
    tips: [
      "Session history is in the History tab — solved problems show a green ✓",
      "Use Interview Mode (📡) for hands-free coaching during mock interviews",
      "Hints escalate automatically — you never have to manage levels in LIVE mode",
      "The app is invisible during screen share on macOS",
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
