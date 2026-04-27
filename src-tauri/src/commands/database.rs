use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use uuid::Uuid;

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Session {
    pub id: String,
    pub title: String,
    pub problem_text: String,
    pub problem_source: Option<String>,
    pub patterns_identified: Option<String>, // JSON array
    pub hint_level_reached: i64,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_seconds: Option<i64>,
    pub notes: Option<String>,
    pub is_completed: i64,
    pub is_solved: i64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DbMessage {
    pub id: String,
    pub session_id: String,
    pub role: String,
    pub content: String,
    pub hint_level: Option<i64>,
    pub timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSessionInput {
    pub title: Option<String>,
    pub problem_text: Option<String>,
    pub problem_source: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSessionInput {
    pub id: String,
    pub title: Option<String>,
    pub problem_text: Option<String>,
    pub patterns_identified: Option<Vec<String>>,
    pub hint_level_reached: Option<i64>,
    pub ended_at: Option<String>,
    pub duration_seconds: Option<i64>,
    pub notes: Option<String>,
    pub is_completed: Option<bool>,
    pub is_solved: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct SaveMessageInput {
    pub session_id: String,
    pub role: String,
    pub content: String,
    pub hint_level: Option<i64>,
}

// ── Session CRUD ─────────────────────────────────────────────────────────────

#[command]
pub async fn create_session(
    state: State<'_, AppState>,
    input: CreateSessionInput,
) -> Result<Session, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let title = input.title.unwrap_or_else(|| "Untitled Session".into());
    let problem_text = input.problem_text.unwrap_or_default();
    let problem_source = input.problem_source;

    sqlx::query(
        "INSERT INTO sessions (id, title, problem_text, problem_source, started_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&title)
    .bind(&problem_text)
    .bind(&problem_source)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    get_session(state, id).await
}

#[command]
pub async fn get_session(state: State<'_, AppState>, id: String) -> Result<Session, String> {
    sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn list_sessions(state: State<'_, AppState>) -> Result<Vec<Session>, String> {
    sqlx::query_as::<_, Session>("SELECT * FROM sessions ORDER BY started_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn update_session(
    state: State<'_, AppState>,
    input: UpdateSessionInput,
) -> Result<Session, String> {
    let patterns_json = input
        .patterns_identified
        .map(|p| serde_json::to_string(&p).unwrap_or_default());

    sqlx::query(
        "UPDATE sessions SET
            title = COALESCE(?, title),
            problem_text = COALESCE(?, problem_text),
            patterns_identified = COALESCE(?, patterns_identified),
            hint_level_reached = COALESCE(?, hint_level_reached),
            ended_at = COALESCE(?, ended_at),
            duration_seconds = COALESCE(?, duration_seconds),
            notes = COALESCE(?, notes),
            is_completed = COALESCE(?, is_completed),
            is_solved = COALESCE(?, is_solved)
         WHERE id = ?",
    )
    .bind(&input.title)
    .bind(&input.problem_text)
    .bind(&patterns_json)
    .bind(&input.hint_level_reached)
    .bind(&input.ended_at)
    .bind(&input.duration_seconds)
    .bind(&input.notes)
    .bind(input.is_completed.map(|v| v as i64))
    .bind(input.is_solved.map(|v| v as i64))
    .bind(&input.id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    get_session(state, input.id).await
}

#[command]
pub async fn delete_session(state: State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM sessions WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Messages ──────────────────────────────────────────────────────────────────

#[command]
pub async fn save_message(
    state: State<'_, AppState>,
    input: SaveMessageInput,
) -> Result<DbMessage, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO messages (id, session_id, role, content, hint_level, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&input.session_id)
    .bind(&input.role)
    .bind(&input.content)
    .bind(&input.hint_level)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DbMessage>("SELECT * FROM messages WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_session_messages(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<Vec<DbMessage>, String> {
    sqlx::query_as::<_, DbMessage>(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
    )
    .bind(&session_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}
