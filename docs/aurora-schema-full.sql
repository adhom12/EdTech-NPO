-- ================================================================
-- WorksheetGen — Full Aurora PostgreSQL Schema
-- Apply this to a fresh Aurora Postgres instance.
--
-- Key difference from Supabase schema:
--   courses.teacher_id has NO FK to auth.users — Aurora has no
--   auth schema. The app validates teacher_id via supabase.auth.getUser()
--   at the API layer before any query.
--
-- Safe to re-run: all statements use IF NOT EXISTS guards.
-- ================================================================


-- ----------------------------------------------------------------
-- curricula
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curricula (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  board         text        NOT NULL,
  qualification text        NOT NULL,
  subject       text        NOT NULL,
  syllabus_code text        NOT NULL,
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT curricula_syllabus_code_key UNIQUE (syllabus_code)
);

-- ----------------------------------------------------------------
-- skills
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- topics
-- Legacy lookup table used by the question bank.
-- question_type joins here via topic_id.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  syllabus   text NOT NULL,
  subject    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS topics_syllabus_subject_idx ON topics (syllabus, subject);

-- ----------------------------------------------------------------
-- questions
-- Stores both verified (human-authored) and AI-generated questions.
-- verified_by / verified_at populated by admin review flow.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id      uuid        REFERENCES topics(id) ON DELETE SET NULL,
  syllabus      text        NOT NULL,
  subject       text        NOT NULL,
  grade         integer     NOT NULL,
  criterion     text        NOT NULL,
  difficulty    text        NOT NULL,
  question_type text        NOT NULL DEFAULT 'short_answer',
  question_text text        NOT NULL,
  mark_scheme   text        NOT NULL,
  source        text        NOT NULL DEFAULT 'manual',
  verified      boolean     NOT NULL DEFAULT false,
  verified_by   uuid,
  verified_at   timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_lookup_idx ON questions (syllabus, subject, grade, criterion, difficulty, verified);
CREATE INDEX IF NOT EXISTS questions_topic_idx  ON questions (topic_id);

-- ----------------------------------------------------------------
-- users
-- Mirrors Supabase auth UUIDs; stores app-level role only.
-- id = the user's Supabase auth UUID.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         uuid PRIMARY KEY,
  role       text NOT NULL DEFAULT 'teacher',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------
-- courses
-- teacher_id stores the Supabase auth UUID but has NO FK constraint
-- (Aurora has no auth schema). Validated at API layer.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id    uuid        NOT NULL,
  label         text        NOT NULL,
  curriculum_id uuid        NOT NULL REFERENCES curricula(id),
  subject       text        NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS courses_teacher_id_idx ON courses (teacher_id);

-- ----------------------------------------------------------------
-- worksheets
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS worksheets (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   uuid        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  share_code  text        NOT NULL UNIQUE DEFAULT left(gen_random_uuid()::text, 8),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS worksheets_course_id_idx ON worksheets (course_id);

-- ----------------------------------------------------------------
-- worksheet_questions
-- Persists the ordered set of questions on a worksheet so that
-- chat-edits survive a page reload (Phase 4 fix).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS worksheet_questions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id uuid        NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  question_id  uuid        REFERENCES questions(id) ON DELETE SET NULL,
  position     integer     NOT NULL,
  question_text text,
  mark_scheme   text,
  marks         integer,
  verified      boolean     NOT NULL DEFAULT false,
  source        text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS worksheet_questions_worksheet_idx ON worksheet_questions (worksheet_id, position);


-- ================================================================
-- Phase 1 new tables
-- ================================================================

-- ----------------------------------------------------------------
-- classes
-- Roster of students per course. No student auth — name + identifier only.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id          uuid        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_name       text        NOT NULL,
  student_identifier text,
  created_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classes_course_id_idx ON classes (course_id);

-- ----------------------------------------------------------------
-- feedback_flags
-- Teacher flags an AI-generated question as inaccurate.
-- question_id can reference either questions or worksheet_questions;
-- we store it as text to avoid tight coupling.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback_flags (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  flagged_by  uuid        NOT NULL,
  reason      text        NOT NULL,
  resolved    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_flags_question_idx  ON feedback_flags (question_id);
CREATE INDEX IF NOT EXISTS feedback_flags_resolved_idx  ON feedback_flags (resolved);

-- ----------------------------------------------------------------
-- analytics_events
-- Lightweight append-only event log. No aggregation — raw rows only.
-- event_type examples: 'worksheet_generated', 'question_flagged'
-- payload: JSONB — arbitrary metadata per event type.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id  uuid        REFERENCES courses(id) ON DELETE SET NULL,
  event_type text        NOT NULL,
  payload    jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_course_idx ON analytics_events (course_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx   ON analytics_events (event_type, created_at DESC);
