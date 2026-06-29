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

    // Get seeded course IDs
    const courseLabels = [...new Set(SEEDED_WORKSHEETS.map((w) => w.courseLabel))]
    const courses = await sql`
      SELECT id, label FROM courses
      WHERE teacher_id = ${DEV_TEACHER_ID} AND label = ANY(${courseLabels})
    `
    const courseIdByLabel = Object.fromEntries(
      courses.map((c) => [c.label as string, c.id as string])
    )

    const seededTitles = SEEDED_WORKSHEETS.map((w) => w.title)
    const seededCourseIds = Object.values(courseIdByLabel)

    // Delete any worksheets that aren't part of the seed
    await sql`
      DELETE FROM worksheets
      WHERE course_id = ANY(${seededCourseIds})
        AND title != ALL(${seededTitles})
    `

    // Also delete orphaned worksheets created by this teacher (no course, not seeded)
    await sql`
      DELETE FROM worksheets
      WHERE course_id IS NULL
    `

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
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
