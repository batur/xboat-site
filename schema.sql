CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  name TEXT,
  started_at TEXT,
  updated_at TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);
