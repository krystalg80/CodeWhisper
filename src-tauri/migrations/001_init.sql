-- CodeWhisper SQLite Schema

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Session',
    problem_text TEXT NOT NULL DEFAULT '',
    problem_source TEXT,          -- 'screen_capture' | 'manual' | 'paste'
    patterns_identified TEXT,     -- JSON array of pattern names
    hint_level_reached INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_seconds INTEGER,
    notes TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    hint_level INTEGER,           -- for assistant messages that are hints (1-4)
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS license (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    license_key TEXT,
    email TEXT,
    is_active INTEGER NOT NULL DEFAULT 0,
    plan TEXT,                    -- 'free' | 'pro' | 'lifetime'
    expires_at TEXT,
    validated_at TEXT
);

-- Seed default settings
INSERT OR IGNORE INTO user_settings (key, value) VALUES
    ('api_key', ''),
    ('overlay_position_x', '20'),
    ('overlay_position_y', '80'),
    ('overlay_width', '420'),
    ('hint_auto_advance', 'false'),
    ('capture_interval_seconds', '5'),
    ('theme', 'dark'),
    ('supabase_session', '');

-- Default free license row
INSERT OR IGNORE INTO license (id, is_active, plan) VALUES (1, 1, 'free');

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);
