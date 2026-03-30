use sqlx::SqlitePool;
use std::sync::Mutex;

pub struct AppState {
    pub db: SqlitePool,
    pub audio_capture_active: Mutex<bool>,
    pub current_session_id: Mutex<Option<String>>,
}

impl AppState {
    pub async fn new(db_path: &str) -> anyhow::Result<Self> {
        let db_url = format!("sqlite:{}?mode=rwc", db_path);
        let pool = SqlitePool::connect(&db_url).await?;

        run_migrations(&pool).await?;

        Ok(Self {
            db: pool,
            audio_capture_active: Mutex::new(false),
            current_session_id: Mutex::new(None),
        })
    }
}

async fn run_migrations(pool: &SqlitePool) -> anyhow::Result<()> {
    let stmts = [
        r#"CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL DEFAULT 'Untitled Session',
            problem_text TEXT NOT NULL DEFAULT '',
            problem_source TEXT,
            patterns_identified TEXT,
            hint_level_reached INTEGER NOT NULL DEFAULT 0,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            duration_seconds INTEGER,
            notes TEXT,
            is_completed INTEGER NOT NULL DEFAULT 0
        )"#,
        r#"CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
            content TEXT NOT NULL,
            hint_level INTEGER,
            timestamp TEXT NOT NULL
        )"#,
        r#"CREATE TABLE IF NOT EXISTS user_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )"#,
        r#"CREATE TABLE IF NOT EXISTS license (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            license_key TEXT,
            email TEXT,
            is_active INTEGER NOT NULL DEFAULT 0,
            plan TEXT,
            expires_at TEXT,
            validated_at TEXT
        )"#,
        r#"INSERT OR IGNORE INTO license (id, is_active, plan) VALUES (1, 1, 'free')"#,
        r#"CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)"#,
        r#"CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC)"#,
    ];

    for stmt in &stmts {
        sqlx::query(stmt).execute(pool).await?;
    }

    Ok(())
}
