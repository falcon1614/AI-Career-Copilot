CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  problem_id      VARCHAR(50) NOT NULL,
  problem_title   VARCHAR(255),
  language        VARCHAR(50) NOT NULL,
  code            TEXT NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending',
  passed_tests    INTEGER DEFAULT 0,
  total_tests     INTEGER DEFAULT 0,
  execution_time  INTEGER,
  error_message   TEXT,
  test_results    JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);

INSERT INTO migrations (filename) VALUES ('001_create_coding.sql')
  ON CONFLICT DO NOTHING;
