CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS migrations (
  id         SERIAL PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL,
  job_role      VARCHAR(255) NOT NULL,
  question_type VARCHAR(50)  DEFAULT 'mixed',
  difficulty    VARCHAR(50)  DEFAULT 'medium',
  resume_text   TEXT,
  status        VARCHAR(50)  DEFAULT 'active',
  score         INTEGER,
  total_questions INTEGER    DEFAULT 0,
  answered_questions INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50),
  difficulty    VARCHAR(50),
  topic         VARCHAR(255),
  hint          TEXT,
  follow_up     TEXT,
  order_index   INTEGER DEFAULT 0,
  user_answer   TEXT,
  ai_feedback   TEXT,
  score         INTEGER,
  answered_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON interview_questions(session_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sessions_updated_at ON interview_sessions;
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO migrations (filename) VALUES ('001_create_interviews.sql')
  ON CONFLICT DO NOTHING;
