import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const TRIAL_DAYS = 14;

const SYSTEM_PROMPT = `You are CodeWhisper, a solo coding practice coach. The user is working through a LeetCode/HackerRank-style problem on their own — there is no interviewer or grader watching this session. Default to the Socratic method: respond with questions, nudges, and progressive hints rather than immediately writing the solution. Identify the algorithm pattern the problem belongs to and help the user recognize it themselves. Keep responses concise — 2 to 4 sentences max. If the user is stuck and explicitly asks for the answer or the full solution, it's fine to give it — this is their own practice time and hiding it from them serves no one.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Check license
    const { data: license } = await supabase
      .from("licenses")
      .select("plan, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    const isPro = Boolean(license);

    // Parse request body
    const { action, messages, user_message, problem_text, current_code, screen_text, hint_level, prior_feedback, attempt_count } = await req.json();

    // ── Extract action — clean raw OCR text into just the problem statement ──
    if (action === "extract") {
      if (!screen_text?.trim()) throw new Error("screen_text is required for extract");

      const extractPrompt = `The following is raw OCR text captured from a developer's screen. It contains a mix of browser UI, menus, notifications, and a coding problem statement.

Extract ONLY the coding problem statement — the title, description, examples, and constraints. Remove all browser chrome, menu items, notifications, and unrelated text. Return only the clean problem text, nothing else.

RAW OCR TEXT:
${screen_text}`;

      const claudeResp = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: "You extract coding problem statements from noisy OCR text. Return only the clean problem text with no commentary.",
          messages: [{ role: "user", content: extractPrompt }],
        }),
      });

      if (!claudeResp.ok) throw new Error(`Claude API error: ${await claudeResp.text()}`);
      const claudeData = await claudeResp.json();
      const text = claudeData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Analyze action (no usage counted) ────────────────────────────────────
    if (action === "analyze") {
      if (!problem_text?.trim()) throw new Error("problem_text is required for analyze");

      const analyzePrompt = `Analyze this coding problem and respond with ONLY valid JSON (no markdown, no extra text):

${problem_text}

Required JSON shape:
{
  "problem_title": "short title",
  "difficulty": "Easy|Medium|Hard",
  "patterns": ["pattern1", "pattern2"],
  "key_constraints": ["constraint1"],
  "suggested_data_structures": ["ds1"]
}`;

      const claudeResp = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 512,
          system: "You are a concise coding problem analyzer. Respond only with valid JSON.",
          messages: [{ role: "user", content: analyzePrompt }],
        }),
      });

      if (!claudeResp.ok) {
        const err = await claudeResp.text();
        throw new Error(`Claude API error: ${err}`);
      }

      const claudeData = await claudeResp.json();
      const raw = claudeData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";

      return new Response(raw, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Live Coach tick — extract problem/code from the screen and, if the code
    // changed meaningfully, give one piece of direct, real-time review feedback.
    // This is a passive/automatic feature: the user turned Live Coach on, it's
    // not hidden from them, and it only ever operates on their own screen during
    // their own solo practice — no live-interview/proctored-session use case.
    if (action === "live_tick") {
      if (!screen_text?.trim()) throw new Error("screen_text is required for live_tick");

      if (!isPro) {
        const trialEnd = new Date(new Date(user.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        if (new Date() > trialEnd) {
          return new Response(
            JSON.stringify({ error: "free_limit_reached", message: "Your 14-day trial has ended. Upgrade to Pro for unlimited sessions." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const feedbackHistory = Array.isArray(prior_feedback) && prior_feedback.length > 0
        ? prior_feedback.map((f: string) => `- ${f}`).join("\n")
        : "(none yet)";

      // Escalate gradually the longer the user's been checked in on, like a hint
      // ladder — never jump straight to a full working solution unprompted.
      const tick = Number(attempt_count ?? 1);
      const feedbackTier = tick <= 2
        ? `Ask ONE short conceptual question, or name — in plain English, no code — what's structurally still missing (e.g. "you don't have anything tracking values you've already seen yet"). Do not write any code at all.`
        : tick <= 4
        ? `Point at the specific bug or missing piece more directly (e.g. name the exact line or the specific edge case), still in plain English. At most one short inline snippet (a few words, not a statement) if it's unavoidable — no multi-line code.`
        : `Give a short code skeleton (3-6 lines) with the core logic left as a comment or blank for them to fill in themselves — e.g. "// look up target - nums[i] in your map here". Never write the complete, ready-to-run solution — always leave the key computation for them to write.`;

      const liveTickPrompt = `You are watching a user's screen while they practice a coding problem entirely on their own — no interviewer, no grader, just them and their editor. Raw OCR text from their screen follows; it's noisy and may include browser chrome, notifications, a problem statement (e.g. from LeetCode), and/or their code editor content, all mixed together.

Do three things:
1. If a clean coding problem statement (title, description, examples, constraints) is visible, extract it. If none is visible, or it's unchanged from PRIOR PROBLEM STATEMENT below, return PRIOR PROBLEM STATEMENT unchanged.
2. Extract the user's code exactly as written in their editor — verbatim, don't fix it, don't complete it, don't add anything they haven't typed.
3. Compare the extracted code to PRIOR CODE below. If it changed in a meaningful way, give ONE short piece of feedback — but first decide what KIND of issue it is:

   **Before writing anything about a specific variable, line, or token: this task is highly prone to hallucinating common-looking bugs that aren't actually there** — e.g. assuming a nested loop with variables i and j must be buggy and returning [i, i], because that's a common real mistake in this exact problem, even when the code you just extracted in step 2 actually says [i, j]. Re-read the EXACT code string you extracted (not your assumption of what similar code usually looks like) before naming any variable in your feedback. If you cannot point to the literal substring in the extracted code that supports your claim, don't make the claim — return an empty message instead.

   - **Syntax/language error** (wrong language's syntax, a method/property/builtin that doesn't exist in this language, a typo, a real typo-level mistake): these aren't part of the algorithmic insight worth protecting. State the correct fix directly and plainly, every time, regardless of tick count — e.g. "TypeScript arrays don't have .length() as a function, use the .length property: nums.length". Never turn a basic syntax fact into a guessing game.
   - **Algorithmic/logic issue** (wrong approach, missing data structure, unhandled edge case, wrong return value): pace your specificity using this rule based on how long they've been stuck:

${feedbackTier}

This check-in has happened ${tick} time(s) so far this session — pace ALGORITHMIC feedback accordingly, don't skip ahead of it (syntax errors are always direct, see above regardless of tick count). Check RECENT FEEDBACK ALREADY GIVEN below: if you've already made essentially the same point twice (even worded differently), stop rephrasing it as a question — just state the direct answer this time instead of asking a third variation. If the code hasn't meaningfully changed, has no new issues, or you have nothing new to add, return an empty string for "message".

PRIOR PROBLEM STATEMENT:
${problem_text || "(none captured yet)"}

PRIOR CODE:
${current_code || "(none yet)"}

RECENT FEEDBACK ALREADY GIVEN (do not repeat these points):
${feedbackHistory}

RAW OCR TEXT FROM SCREEN:
${screen_text}

Respond with ONLY valid JSON, no markdown fencing. "evidence" must be the exact literal substring of "code" (copy-pasted, character for character) that your "message" is based on — leave both "evidence" and "message" as empty strings if you have nothing to say:
{"problem_text": "...", "code": "...", "evidence": "...", "message": "..."}`;

      const claudeResp = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: "You extract structured data from noisy screen OCR and give terse, direct code review feedback. Respond only with valid JSON, no markdown fencing, no commentary outside the JSON object.",
          messages: [{ role: "user", content: liveTickPrompt }],
        }),
      });

      if (!claudeResp.ok) throw new Error(`Claude API error: ${await claudeResp.text()}`);
      const claudeData = await claudeResp.json();
      const raw = claudeData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "{}";

      let parsed: { problem_text?: string; code?: string; evidence?: string; message?: string };
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { problem_text, code: current_code, message: "" };
      }

      const finalCode = parsed.code ?? current_code ?? "";
      // Guard against hallucinated feedback: only trust the message if the model's
      // cited evidence is an actual, verifiable substring of the code it extracted.
      const evidenceVerified = !parsed.message?.trim()
        || (parsed.evidence?.trim() && finalCode.includes(parsed.evidence.trim()));

      return new Response(
        JSON.stringify({
          problem_text: parsed.problem_text ?? problem_text ?? "",
          code: finalCode,
          message: evidenceVerified ? (parsed.message ?? "") : "",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Coaching action ───────────────────────────────────────────────────────
    if (!user_message) throw new Error("user_message is required");

    // Only count usage on the first message of a session (messages array is empty)
    const isSessionStart = !messages || messages.length === 0;

    if (!isPro && isSessionStart) {
      const trialEnd = new Date(new Date(user.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      const trialExpired = new Date() > trialEnd;

      if (trialExpired) {
        return new Response(
          JSON.stringify({ error: "free_limit_reached", message: "Your 14-day trial has ended. Upgrade to Pro for unlimited sessions." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build the coaching-context message
    const coachingMessage = buildCoachMessage(user_message, problem_text, current_code, hint_level);

    // Forward to Claude: history first, then the wrapped coaching message
    const claudeResp = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
          ...(messages ?? []),
          { role: "user", content: coachingMessage },
        ],
      }),
    });

    if (!claudeResp.ok) {
      const err = await claudeResp.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const claudeData = await claudeResp.json();

    // Return a normalized response the frontend can consume directly
    const text = claudeData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const usage = claudeData.usage ?? { input_tokens: 0, output_tokens: 0 };

    return new Response(
      JSON.stringify({
        message: text,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildCoachMessage(userMessage: string, problemText: string, currentCode: string, hintLevel: number): string {
  const guidance: Record<number, string> = {
    1: "Give a very subtle nudge — a single Socratic question about the problem constraints.",
    2: "Hint at the algorithm pattern category without naming it directly.",
    3: "Name the pattern and ask them how it might apply here.",
    4: "Provide pseudocode structure only, no actual code.",
  };
  return `PROBLEM:\n${problemText || "(not captured yet)"}\n\nUSER CODE:\n${currentCode || "(none)"}\n\nUSER: ${userMessage}\n\nINSTRUCTION: ${guidance[hintLevel] ?? "Engage conversationally."}`;
}
