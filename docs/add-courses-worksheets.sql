-- Run this in the Supabase SQL Editor.
-- If you have run a previous version of this file, run the DROP lines first
-- (they are commented out below) to recreate the tables cleanly.
--
-- Path taken: fresh creation, no backfill.
-- The worksheets table did not previously exist; the dashboard used hardcoded
-- mock data. The one existing user (e3987e0e) is a dev account. A sample
-- course and worksheet are seeded so the UI has something to render.

-- Uncomment these two lines if you need to reset and start fresh:
--DROP TABLE IF EXISTS worksheets CASCADE;
--DROP TABLE IF EXISTS courses CASCADE;

-- ----------------------------------------------------------------
-- courses
-- Holds teacher-side config for a class/subject combination.
-- NOT a classroom — no student data or roster. Student access is
-- the existing one-off share_code per worksheet, unchanged.
--
-- References auth.users (not public.users) — Supabase stores auth
-- accounts in the auth schema.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label         text        NOT NULL,
  curriculum_id uuid        NOT NULL REFERENCES curricula(id),
  subject       text        NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS courses_teacher_id_idx ON courses (teacher_id);

-- ----------------------------------------------------------------
-- worksheets
-- course_id is NOT NULL — every worksheet belongs to a course.
-- share_code is the one-off token used for student read access;
-- it is generated at creation time and never changes.
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
-- Seed: one sample course + worksheet for the dev teacher user.
-- Linked to AQA GCSE Maths 8300 (curriculum already imported).
-- The dev user e3987e0e must exist in auth.users.
-- ----------------------------------------------------------------
WITH inserted_course AS (
  INSERT INTO courses (teacher_id, label, curriculum_id, subject)
  SELECT
    'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1',
    'Year 10 Foundation Maths',
    id,
    'Mathematics'
  FROM curricula
  WHERE syllabus_code = '8300'
  RETURNING id
)
INSERT INTO worksheets (course_id, title)
SELECT id, 'Quadratic Equations — Problem Set A'
FROM inserted_course;
