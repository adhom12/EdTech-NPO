// TEMPORARY — delete after running once to seed Aurora with Supabase data.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/aurora/client'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-migrate-secret')
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const sql = await getDb()
    const counts: Record<string, number> = {}

    // --- curricula ---
    const { data: curricula } = await supabase
      .from('curricula')
      .select('id, board, qualification, subject, syllabus_code, created_at')
    if (curricula?.length) {
      await sql`
        INSERT INTO curricula (id, board, qualification, subject, syllabus_code, created_at)
        ${sql(curricula, 'id', 'board', 'qualification', 'subject', 'syllabus_code', 'created_at')}
        ON CONFLICT (syllabus_code) DO NOTHING
      `
      counts.curricula = curricula.length
    }

    // --- skills (batch 500) ---
    const { data: skills } = await supabase
      .from('skills')
      .select('id, curriculum_id, skill_id, topic, subtopic, skill_name, tier, spec_reference, source, created_at')
    if (skills?.length) {
      for (let i = 0; i < skills.length; i += 500) {
        const batch = skills.slice(i, i + 500)
        await sql`
          INSERT INTO skills (id, curriculum_id, skill_id, topic, subtopic, skill_name, tier, spec_reference, source, created_at)
          ${sql(batch, 'id', 'curriculum_id', 'skill_id', 'topic', 'subtopic', 'skill_name', 'tier', 'spec_reference', 'source', 'created_at')}
          ON CONFLICT DO NOTHING
        `
      }
      counts.skills = skills.length
    }

    // --- topics ---
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name, syllabus, subject, created_at')
    if (topics?.length) {
      await sql`
        INSERT INTO topics (id, name, syllabus, subject, created_at)
        ${sql(topics, 'id', 'name', 'syllabus', 'subject', 'created_at')}
        ON CONFLICT DO NOTHING
      `
      counts.topics = topics.length
    }

    // --- questions (batch 200) ---
    const { data: questions } = await supabase
      .from('questions')
      .select('id, topic_id, syllabus, subject, grade, criterion, difficulty, question_type, question_text, mark_scheme, source, verified, verified_by, verified_at, created_at')
    if (questions?.length) {
      for (let i = 0; i < questions.length; i += 200) {
        const batch = questions.slice(i, i + 200)
        await sql`
          INSERT INTO questions (id, topic_id, syllabus, subject, grade, criterion, difficulty, question_type, question_text, mark_scheme, source, verified, verified_by, verified_at, created_at)
          ${sql(batch, 'id', 'topic_id', 'syllabus', 'subject', 'grade', 'criterion', 'difficulty', 'question_type', 'question_text', 'mark_scheme', 'source', 'verified', 'verified_by', 'verified_at', 'created_at')}
          ON CONFLICT DO NOTHING
        `
      }
      counts.questions = questions.length
    }

    return NextResponse.json({ ok: true, counts })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
