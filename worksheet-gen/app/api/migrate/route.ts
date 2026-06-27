// TEMPORARY — delete this file after running once to apply the schema.
// Protected by MIGRATE_SECRET env var to prevent accidental re-runs.
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-migrate-secret')
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sql = await getDb()

    await sql.unsafe(`
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
      CREATE INDEX IF NOT EXISTS skills_topic_idx ON skills (curriculum_id, topic);

      CREATE TABLE IF NOT EXISTS topics (
        id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name       text NOT NULL,
        syllabus   text NOT NULL,
        subject    text NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS topics_syllabus_subject_idx ON topics (syllabus, subject);

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
      CREATE INDEX IF NOT EXISTS questions_topic_idx ON questions (topic_id);

      CREATE TABLE IF NOT EXISTS users (
        id         uuid PRIMARY KEY,
        role       text NOT NULL DEFAULT 'teacher',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS courses (
        id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        teacher_id    uuid        NOT NULL,
        label         text        NOT NULL,
        curriculum_id uuid        NOT NULL REFERENCES curricula(id),
        subject       text        NOT NULL,
        created_at    timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS courses_teacher_id_idx ON courses (teacher_id);

      CREATE TABLE IF NOT EXISTS worksheets (
        id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id   uuid        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title       text        NOT NULL,
        share_code  text        NOT NULL UNIQUE DEFAULT left(gen_random_uuid()::text, 8),
        created_at  timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS worksheets_course_id_idx ON worksheets (course_id);

      CREATE TABLE IF NOT EXISTS worksheet_questions (
        id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        worksheet_id  uuid        NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
        question_id   uuid        REFERENCES questions(id) ON DELETE SET NULL,
        position      integer     NOT NULL,
        question_text text,
        mark_scheme   text,
        marks         integer,
        verified      boolean     NOT NULL DEFAULT false,
        source        text,
        created_at    timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS worksheet_questions_worksheet_idx ON worksheet_questions (worksheet_id, position);

      CREATE TABLE IF NOT EXISTS classes (
        id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id          uuid        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        student_name       text        NOT NULL,
        student_identifier text,
        created_at         timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS classes_course_id_idx ON classes (course_id);

      CREATE TABLE IF NOT EXISTS feedback_flags (
        id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        question_id uuid        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        flagged_by  uuid        NOT NULL,
        reason      text        NOT NULL,
        resolved    boolean     NOT NULL DEFAULT false,
        created_at  timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS feedback_flags_question_idx ON feedback_flags (question_id);
      CREATE INDEX IF NOT EXISTS feedback_flags_resolved_idx ON feedback_flags (resolved);

      CREATE TABLE IF NOT EXISTS analytics_events (
        id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id  uuid        REFERENCES courses(id) ON DELETE SET NULL,
        event_type text        NOT NULL,
        payload    jsonb       NOT NULL DEFAULT '{}',
        created_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS analytics_events_course_idx ON analytics_events (course_id);
      CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events (event_type, created_at DESC);
    `)

    return NextResponse.json({ ok: true, message: 'Schema applied successfully.' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
