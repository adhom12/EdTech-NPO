import { NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

const SEEDED_WORKSHEETS: { courseLabel: string; title: string; daysAgo: number }[] = [
  { courseLabel: '10A Mathematics', title: 'Indices & Surds — Homework 1',        daysAgo: 5 },
  { courseLabel: '11A Mathematics', title: 'Quadratic Equations — Practice Paper', daysAgo: 7 },
  { courseLabel: '11A Mathematics', title: 'Circle Theorems — Mock Exam',          daysAgo: 3 },
]

function daysAgoTs(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

export async function POST() {
  try {
    const sql = await getDb()

    // Get seeded course IDs — hardcoded labels, no array operator needed
    const courses = await sql`
      SELECT id, label FROM courses
      WHERE teacher_id = ${DEV_TEACHER_ID}
        AND (label = '10A Mathematics' OR label = '11A Mathematics')
    `
    const courseIdByLabel = Object.fromEntries(
      courses.map((c) => [c.label as string, c.id as string])
    )

    const seededTitles = SEEDED_WORKSHEETS.map((w) => w.title)
    const seededCourseIds = Object.values(courseIdByLabel)

    // Delete non-seeded worksheets for seeded courses
    // Guard: skip if no courses found (nothing to clean up)
    if (seededCourseIds.length > 0) {
      await sql`
        DELETE FROM worksheets
        WHERE course_id IN ${sql(seededCourseIds)}
          AND title NOT IN ${sql(seededTitles)}
      `
    }

    // Delete orphaned worksheets (no course attached)
    await sql`DELETE FROM worksheets WHERE course_id IS NULL`

    // Reset seeded worksheet timestamps so activity stream looks fresh
    for (const ws of SEEDED_WORKSHEETS) {
      const courseId = courseIdByLabel[ws.courseLabel]
      if (!courseId) continue
      const ts = daysAgoTs(ws.daysAgo)
      await sql`
        UPDATE worksheets SET created_at = ${ts}::timestamptz
        WHERE course_id = ${courseId} AND title = ${ws.title}
      `
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[demo-reset]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
