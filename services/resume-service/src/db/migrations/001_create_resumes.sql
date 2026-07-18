CREATE TABLE IF NOT EXISTS migrations (
  id         SERIAL PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS resumes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_url       VARCHAR(500),
  file_size      INTEGER,
  mime_type      VARCHAR(100),
  parsed_text    TEXT,
  parsed_sections JSONB DEFAULT '{}',
  ats_score      INTEGER,
  ats_details    JSONB DEFAULT '{}',
  status         VARCHAR(50) DEFAULT 'uploaded',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;
CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO migrations (filename) VALUES ('001_create_resumes.sql')
  ON CONFLICT DO NOTHING;
