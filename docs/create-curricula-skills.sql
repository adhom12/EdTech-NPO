-- Run this in the Supabase SQL Editor before running the import script.
-- Safe to re-run (IF NOT EXISTS guards throughout).

CREATE TABLE IF NOT EXISTS curricula (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  board         text        NOT NULL,
  qualification text        NOT NULL,
  subject       text        NOT NULL,
  syllabus_code text        NOT NULL,
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT curricula_syllabus_code_key UNIQUE (syllabus_code)
);

CREATE TABLE IF NOT EXISTS skills (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id  uuid        NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  skill_id       text        NOT NULL,
  topic          text        NOT NULL,
  subtopic       text        NOT NULL,
  skill_name     text        NOT NULL,
  tier           text,
  spec_reference text,
  source         text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS skills_curriculum_id_idx ON skills (curriculum_id);
CREATE INDEX IF NOT EXISTS skills_topic_idx          ON skills (curriculum_id, topic);
