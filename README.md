# CodeWhisper

An AI-powered coding interview coach that runs locally as an always-on-top overlay. It captures your screen, extracts the problem via OCR, and coaches you using the Socratic method — never giving you the answer, always guiding you to find it yourself.

## Architecture

```
CodeWhisper/
├── src/                         # React + TypeScript frontend
│   ├── components/
│   │   ├── Overlay/             # Window shell (TitleBar, TabBar, CollapsedBubble)
│   │   ├── ChatPanel/           # AI coach conversation
│   │   ├── ProblemPanel/        # Problem input + OCR + AI analysis
│   │   ├── HintPanel/           # 4-level hint ladder
│   │   ├── PatternLibrary/      # 10 built-in algorithm patterns
│   │   ├── Session/             # Session history
│   │   ├── Auth/                # Settings modal (API key, license)
│   │   └── Subscription/        # Upgrade / paywall
│   ├── stores/                  # Zustand state (appStore, sessionStore)
│   ├── hooks/                   # useScreenCapture, useSessionTimer
│   ├── lib/                     # Tauri IPC wrappers, Supabase client, Stripe helpers
│   ├── data/                    # Algorithm pattern library data
│   └── types/                   # TypeScript types
├── src-tauri/                   # Rust backend (Tauri 2.0)
│   ├── src/
│   │   ├── commands/
│   │   │   ├── screen.rs        # Screenshot capture (screenshots crate)
│   │   │   ├── ocr.rs           # Tesseract OCR (rusty-tesseract)
│   │   │   ├── audio.rs         # System audio capture stub (wire cpal)
│   │   │   ├── whisper.rs       # Whisper.cpp transcription stub (wire whisper-rs)
│   │   │   ├── claude.rs        # Claude API integration
│   │   │   ├── database.rs      # SQLite session/message CRUD
│   │   │   └── session.rs       # Freemium count + license validation
│   │   ├── state.rs             # AppState (SQLite pool, audio flag)
│   │   └── lib.rs               # Tauri setup + command registration
│   └── tauri.conf.json
└── supabase/
    ├── functions/
    │   ├── create-checkout/     # Stripe Checkout session Edge Function
    │   └── create-portal/       # Stripe Customer Portal Edge Function
    └── migrations/              # Supabase remote DB schema
```

## Prerequisites

### Required
- **Rust** (stable): https://rustup.rs
- **Node.js** 18+: https://nodejs.org
- **Tauri CLI**: installed via npm (in devDependencies)

### For OCR (Tesseract)
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt install tesseract-ocr

# Windows
# Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
```

### For Whisper transcription (optional, for audio)
```bash
# Download a model (base.en is smallest/fastest)
mkdir -p ~/.codewhisper/models
curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin \
  -o ~/.codewhisper/models/ggml-base.en.bin
```
Then uncomment the `whisper-rs` dependency in `src-tauri/Cargo.toml` and follow the
[whisper-rs build instructions](https://github.com/tazz4843/whisper-rs).

### For system audio capture (optional)
On macOS, install [BlackHole](https://github.com/ExistentialAudio/BlackHole) (free) or
[Loopback](https://rogueamoeba.com/loopback/) as a virtual audio device, then set it as
your output device. The audio commands use `cpal` (stub in place — wire `start_audio_capture`).

## Setup

```bash
# 1. Clone and install
git clone https://github.com/you/codewhisper
cd CodeWhisper
npm install

# 2. Environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run in development
npm run tauri:dev

# 4. Build for production
npm run tauri:build
```

## Supabase + Stripe Setup

1. Create a Supabase project at https://supabase.com
2. Run `supabase/migrations/20240101000000_init.sql` in the SQL editor
3. Deploy the Edge Functions:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy create-portal
   ```
4. Set Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_PRICE_ID_PRO_MONTHLY=price_...
   supabase secrets set STRIPE_PRICE_ID_PRO_LIFETIME=price_...
   supabase secrets set APP_REDIRECT_URL=codewhisper://
   ```
5. In Stripe, set up a webhook → `https://your-project.supabase.co/functions/v1/stripe-webhook`
   for `checkout.session.completed` events to activate licenses automatically.

## First Use

1. Launch the app — it appears as a small floating overlay (top-left by default)
2. Click the hexagon icon to expand
3. Go to **Settings** (gear icon) → paste your [Anthropic API key](https://console.anthropic.com)
4. Open a LeetCode / HackerRank problem in your browser
5. In the **Problem** tab, click **Screen OCR** to auto-capture it
6. Switch to **Coach** and start talking — or use **Hints** to step through the hint ladder

## Hint Ladder

| Level | Name | What it does |
|-------|------|-------------|
| 1 | Nudge | Subtle Socratic question about constraints |
| 2 | Pattern Hint | Hints at the algorithm category without naming it |
| 3 | Approach Hint | Names the pattern, asks how to apply it |
| 4 | Pseudocode | Gives structure only — never actual code |

## Freemium

- **Free**: 3 sessions
- **Pro ($9/mo)**: Unlimited sessions, full history, priority support
- **Lifetime ($79)**: Everything, one-time payment

After purchase, enter your license key in Settings → License to activate.
