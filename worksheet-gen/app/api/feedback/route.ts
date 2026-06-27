import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export async function POST(request: NextRequest) {
  const { question_id, reason } = await request.json()

  if (!question_id || !reason) {
    return NextResponse.json({ error: 'question_id and reason are required' }, { status: 400 })
  }

  try {
    const sql = await getDb()
    await sql`
      INSERT INTO feedback_flags (question_id, flagged_by, reason)
      VALUES (${question_id}, ${DEV_TEACHER_ID}, ${reason})
    `

    // Also fire an analytics event
    sql`
      INSERT INTO analytics_events (event_type, payload)
      VALUES ('question_flagged', ${JSON.stringify({ question_id, reason })}::jsonb)
    `.catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
