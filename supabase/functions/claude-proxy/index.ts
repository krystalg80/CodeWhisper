import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const TRIAL_DAYS = 7;

const SYSTEM_PROMPT = `You are an expert coding interview coach named CodeWhisper. Your job is NOT to solve problems for the user — it is to guide them to solve it themselves using the Socratic method. Always respond with questions, nudges, and progressive hints. Never write complete solutions. Identify the algorithm pattern the problem belongs to and help the user recognize it themselves. Keep responses concise — 2 to 4 sentences max. If the user is stuck, increase the hint level but never give the full answer.`;

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
    const { action, messages, user_message, problem_text, current_code, screen_text, hint_level, attempt_count } = await req.json();

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

    // ── Interview mode action (no usage counted — session already open) ───────
    if (action === "interview") {
      const attemptCount = Number(attempt_count ?? 0);
      const gaveUp = attemptCount >= 15;

      const interviewPrompt = gaveUp
        ? `You are CodeWhisper. The user has been stuck on this problem for a long time and needs the full solution. Provide:
1. The complete, correct working code (in a code block)
2. A concise step-by-step explanation of WHY it works — not just what it does
3. One sentence on the key insight they were missing

Be educational and warm — they tried hard.`
        : `You are CodeWhisper in Interview Mode. The user is in a live coding interview and cannot stop to type. Analyze their screen and give ONE targeted nudge in 1-2 sentences. Rules:
- Be direct but Socratic — point toward the solution without revealing it
- If you see an error or Wrong Answer, identify what category of bug it is and ask a guiding question
- NEVER tell the user to submit. A single passing test case does not mean the solution is correct — edge cases may still fail. Ask "what edge cases haven't you tested?" instead
- If they look completely stuck with no code, suggest the high-level approach as a question`;

      const context = `PROBLEM STATEMENT:\n${problem_text || "(not yet captured)"}\n\nCURRENT SCREEN STATE:\n${screen_text || "(empty)"}`;
      const maxTokens = gaveUp ? 1024 : 256;

      const claudeResp = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: maxTokens,
          system: interviewPrompt,
          messages: [{ role: "user", content: context }],
        }),
      });

      if (!claudeResp.ok) {
        const err = await claudeResp.text();
        throw new Error(`Claude API error: ${err}`);
      }

      const claudeData = await claudeResp.json();
      const text = claudeData.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";

      return new Response(
        JSON.stringify({ message: text, revealed: gaveUp }),
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
          JSON.stringify({ error: "free_limit_reached", message: "Your 7-day trial has ended. Upgrade to Pro for unlimited sessions." }),
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
