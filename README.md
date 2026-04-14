# CodeWhisper

> An AI-powered coding interview coach that guides your thinking — never gives you the answer.

![Tauri](https://img.shields.io/badge/Tauri_2.0-24C8D8?style=flat&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_API-D97757?style=flat&logo=anthropic&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

---

## Description

CodeWhisper is a native desktop overlay application for developers who want to get genuinely better at coding interviews — not just memorize solutions. It sits on top of your screen while you tackle LeetCode, HackerRank, or any interview problem, reads the problem via OCR, and coaches you using the **Socratic method**: asking targeted questions that push you toward the solution yourself rather than handing it to you.

Instead of copy-pasting hints from a blog post or watching someone walk through the solution, CodeWhisper acts as a mentor sitting next to you — probing your thinking, surfacing what you already know, and escalating guidance only when you're truly stuck. The result is real understanding, not pattern-matching.

Built with Tauri 2.0, CodeWhisper runs locally and privately. Your code sessions and conversation history stay on your machine. Only your API calls to Claude leave the device.

---

## Features

- **Always-on-top overlay** — floats over your browser or IDE; collapses to a small bubble when not in use
- **Screen capture + OCR** — reads the problem text directly from your screen via Tesseract; no copy-paste needed
- **Socratic AI coaching** — powered by Claude API; guides you with questions rather than answers
- **4-level hint ladder** — escalating hints from a subtle nudge all the way to pseudocode structure
- **Algorithm pattern library** — 10 built-in patterns (sliding window, two pointers, BFS/DFS, dynamic programming, etc.) with explanations and examples
- **Session history** — every coaching session and message stored locally via SQLite
- **Freemium model** — 3 free sessions to try it out, then unlock unlimited access via Stripe

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop framework | Tauri 2.0 |
| Backend | Rust |
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State management | Zustand 5 |
| AI coaching | Claude API (Anthropic) |
| OCR | Tesseract via rusty-tesseract |
| Local database | SQLite via SQLx |
| Auth | Supabase |
| Payments | Stripe (via Supabase Edge Functions) |

---

## Getting Started

### Prerequisites

- **Rust** (stable): https://rustup.rs
- **Node.js** 18+: https://nodejs.org
- **Tauri CLI**: included in `devDependencies`, installed via `npm install`
- **Tesseract** (macOS):

```bash
brew install tesseract
```

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/codewhisper.git
cd CodeWhisper

# Install JS dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run in development mode (opens the desktop overlay)
npm run tauri:dev

# Build for production
npm run tauri:build
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Your Anthropic API key is entered directly in the app's **Settings** panel and stored locally — it is never sent to any backend other than the Claude API itself.

---

## First Use

1. Launch the app — it appears as a floating overlay on your screen
2. Click the hexagon icon to expand the panel
3. Open **Settings** and paste your [Anthropic API key](https://console.anthropic.com)
4. Open a LeetCode problem in your browser
5. In the **Problem** tab, click **Capture Screen** to auto-read the problem via OCR
6. Switch to the **Coach** tab and start the conversation — or step through the **Hints** tab for structured guidance

---

## Hint Ladder

The hint system is designed to give you the minimum help you actually need.

| Level | Name | What it gives you |
|---|---|---|
| 1 | Nudge | A Socratic question about constraints or edge cases |
| 2 | Pattern Hint | Hints at the algorithm category without naming it |
| 3 | Approach Hint | Names the pattern and asks how you'd apply it |
| 4 | Pseudocode | Gives structural scaffolding — never actual code |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Screen                              │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  LeetCode / Browser  │    │   CodeWhisper Overlay    │  │
│  │                      │    │  ┌────────────────────┐  │  │
│  │  Two Sum             │───▶│  │  Problem (OCR'd)   │  │  │
│  │  Given an array...   │    │  │  Coach / Hints     │  │  │
│  │                      │    │  │  Pattern Library   │  │  │
│  └──────────────────────┘    │  └────────────────────┘  │  │
│                              └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         Screenshot ──▶ Tesseract OCR ──▶ Claude API
```

1. You open a coding problem in your browser
2. CodeWhisper takes a screenshot and extracts the text via Tesseract OCR (local, no cloud)
3. The problem text is sent to Claude with a Socratic coaching system prompt
4. Claude responds with questions, not answers — and escalates only when you ask for a hint
5. Your conversation and session are saved locally to SQLite

---

## Architecture

```
CodeWhisper/
├── src/                         # React + TypeScript frontend
│   ├── components/
│   │   ├── Overlay/             # Window shell (TitleBar, TabBar, CollapsedBubble)
│   │   ├── ChatPanel/           # AI coach conversation UI
│   │   ├── ProblemPanel/        # Problem input + OCR trigger + AI analysis
│   │   ├── HintPanel/           # 4-level hint ladder
│   │   ├── PatternLibrary/      # 10 built-in algorithm patterns
│   │   ├── Session/             # Session history viewer
│   │   ├── Auth/                # Settings modal (API key, license key)
│   │   └── Subscription/        # Upgrade prompt / paywall UI
│   └── stores/                  # Zustand state (appStore, sessionStore)
├── src-tauri/                   # Rust backend (Tauri 2.0)
│   └── src/commands/
│       ├── screen.rs            # Screenshot capture + OCR via Tesseract
│       ├── claude.rs            # Claude API streaming integration
│       └── database.rs          # SQLite session/message CRUD via SQLx
└── supabase/
    └── functions/               # Supabase Edge Functions
        ├── create-checkout/     # Stripe checkout session creation
        ├── stripe-webhook/      # Stripe webhook handler + license activation
        └── get-license/         # License key validation
```

---

## Pricing

| Plan | Price | Sessions |
|---|---|---|
| Free | $0 | 3 sessions |
| Pro | $9 / month | Unlimited |
| Lifetime | $79 one-time | Unlimited, forever |

After purchase, enter your license key in **Settings → License** to unlock unlimited sessions.

---

## Roadmap

- [ ] Audio capture — listen to verbal problem descriptions (system audio loopback via `cpal`)
- [ ] Whisper transcription — convert audio to text locally via `whisper-rs`
- [ ] Auto-update — in-app updates via Tauri's updater plugin
- [ ] Windows support — currently macOS only
- [ ] Mock interview mode — timed sessions with performance feedback

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
# Run frontend only (no Rust build needed)
npm run dev

# Run full app with Rust backend
npm run tauri:dev

# Type-check frontend
npx tsc --noEmit
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
