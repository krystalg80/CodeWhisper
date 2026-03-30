use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use tauri::command;

const CLAUDE_API_URL: &str = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL: &str = "claude-sonnet-4-20250514";
const ANTHROPIC_VERSION: &str = "2023-06-01";

const SYSTEM_PROMPT: &str = r#"You are an expert coding interview coach named CodeWhisper. Your job is NOT to solve problems for the user — it is to guide them to solve it themselves using the Socratic method. Always respond with questions, nudges, and progressive hints. Never write complete solutions. Identify the algorithm pattern the problem belongs to and help the user recognize it themselves. Keep responses concise — 2 to 4 sentences max. If the user is stuck, increase the hint level but never give the full answer."#;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<Message>,
}

#[derive(Debug, Deserialize)]
struct ClaudeResponse {
    content: Vec<ContentBlock>,
    usage: Option<UsageBlock>,
}

#[derive(Debug, Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    block_type: String,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UsageBlock {
    input_tokens: u32,
    output_tokens: u32,
}

#[derive(Debug, Serialize)]
pub struct CoachResponse {
    pub message: String,
    pub pattern_hint: Option<String>,
    pub hint_level: u8,
    pub input_tokens: u32,
    pub output_tokens: u32,
}

#[derive(Debug, Serialize)]
pub struct ProblemAnalysis {
    pub problem_title: String,
    pub difficulty: String,
    pub patterns: Vec<String>,
    pub key_constraints: Vec<String>,
    pub suggested_data_structures: Vec<String>,
}

/// Build the context-aware user message for the coaching engine.
fn build_coaching_message(
    user_message: &str,
    problem_text: &str,
    current_code: &str,
    hint_level: u8,
) -> String {
    let hint_guidance = match hint_level {
        1 => "Give a very subtle nudge — a single Socratic question about the problem constraints.",
        2 => "The user has asked for more help. Hint at the algorithm pattern category without naming it directly.",
        3 => "The user is stuck. Name the pattern and ask them how it might apply here.",
        4 => "The user needs significant guidance. Provide pseudocode structure only, no actual code.",
        _ => "Engage conversationally based on what the user said.",
    };

    format!(
        "PROBLEM:\n{problem}\n\nUSER'S CURRENT CODE:\n{code}\n\nUSER MESSAGE:\n{msg}\n\nCOACH INSTRUCTION: {guidance}",
        problem = if problem_text.is_empty() { "(not yet captured)" } else { problem_text },
        code = if current_code.is_empty() { "(no code yet)" } else { current_code },
        msg = user_message,
        guidance = hint_guidance,
    )
}

/// Send a message to the Claude coaching engine.
#[command]
pub async fn send_coach_message(
    api_key: String,
    user_message: String,
    problem_text: String,
    current_code: String,
    hint_level: u8,
    conversation_history: Vec<Message>,
) -> Result<CoachResponse, String> {
    if api_key.is_empty() {
        return Err("Claude API key not configured. Please add your key in Settings.".into());
    }

    let full_user_message =
        build_coaching_message(&user_message, &problem_text, &current_code, hint_level);

    let mut messages: Vec<Message> = conversation_history;
    messages.push(Message {
        role: "user".into(),
        content: full_user_message,
    });

    let payload = ClaudeRequest {
        model: CLAUDE_MODEL.into(),
        max_tokens: 512,
        system: SYSTEM_PROMPT.into(),
        messages,
    };

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(
        "x-api-key",
        HeaderValue::from_str(&api_key).map_err(|e| e.to_string())?,
    );
    headers.insert(
        "anthropic-version",
        HeaderValue::from_static(ANTHROPIC_VERSION),
    );

    let client = reqwest::Client::new();
    let resp = client
        .post(CLAUDE_API_URL)
        .headers(headers)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(format!("Claude API error {status}: {body}"));
    }

    let data: ClaudeResponse = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let message = data
        .content
        .iter()
        .find(|b| b.block_type == "text")
        .and_then(|b| b.text.clone())
        .unwrap_or_default();

    let usage = data.usage.unwrap_or(UsageBlock {
        input_tokens: 0,
        output_tokens: 0,
    });

    // Detect if the response references a specific pattern
    let pattern_hint = detect_pattern_mention(&message);

    Ok(CoachResponse {
        message,
        pattern_hint,
        hint_level,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
    })
}

/// Ask Claude to analyze the raw problem text and extract structured metadata.
#[command]
pub async fn analyze_problem(
    api_key: String,
    problem_text: String,
) -> Result<ProblemAnalysis, String> {
    if api_key.is_empty() {
        return Err("Claude API key not configured".into());
    }

    let prompt = format!(
        r#"Analyze this coding problem and respond with ONLY valid JSON (no markdown, no extra text):

{problem}

Required JSON shape:
{{
  "problem_title": "short title",
  "difficulty": "Easy|Medium|Hard",
  "patterns": ["pattern1", "pattern2"],
  "key_constraints": ["constraint1"],
  "suggested_data_structures": ["ds1"]
}}"#,
        problem = problem_text
    );

    let messages = vec![Message {
        role: "user".into(),
        content: prompt,
    }];

    let payload = ClaudeRequest {
        model: CLAUDE_MODEL.into(),
        max_tokens: 512,
        system: "You are a concise coding problem analyzer. Respond only with valid JSON.".into(),
        messages,
    };

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(
        "x-api-key",
        HeaderValue::from_str(&api_key).map_err(|e| e.to_string())?,
    );
    headers.insert(
        "anthropic-version",
        HeaderValue::from_static(ANTHROPIC_VERSION),
    );

    let client = reqwest::Client::new();
    let resp = client
        .post(CLAUDE_API_URL)
        .headers(headers)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(format!("Claude API error {status}: {body}"));
    }

    let data: ClaudeResponse = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;
    let raw = data
        .content
        .iter()
        .find(|b| b.block_type == "text")
        .and_then(|b| b.text.clone())
        .unwrap_or_default();

    let analysis: ProblemAnalysis =
        serde_json::from_str(&raw).map_err(|e| format!("JSON parse failed: {e}\nRaw: {raw}"))?;

    Ok(analysis)
}

fn detect_pattern_mention(text: &str) -> Option<String> {
    let patterns = [
        "sliding window",
        "two pointers",
        "binary search",
        "dynamic programming",
        "BFS",
        "DFS",
        "depth-first",
        "breadth-first",
        "hashmap",
        "hash table",
        "backtracking",
        "greedy",
        "divide and conquer",
        "recursion",
        "stack",
        "queue",
        "heap",
        "trie",
        "union find",
        "topological sort",
    ];

    let lower = text.to_lowercase();
    patterns
        .iter()
        .find(|&&p| lower.contains(p))
        .map(|&p| p.to_string())
}
