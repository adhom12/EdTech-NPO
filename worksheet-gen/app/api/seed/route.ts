import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'
const SEED_SECRET = process.env.SEED_SECRET

// GET /api/seed?secret=<SEED_SECRET>
// Idempotent — safe to run multiple times.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!SEED_SECRET || secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = await getDb()

  // ── 1. Curriculum ─────────────────────────────────────────────────────────
  let curriculumId: string
  const existingCurr = await sql`
    SELECT id FROM curricula WHERE board = 'AQA' AND qualification = 'GCSE' LIMIT 1
  `
  if (existingCurr.length > 0) {
    curriculumId = existingCurr[0].id as string
  } else {
    const [row] = await sql`
      INSERT INTO curricula (board, qualification)
      VALUES ('AQA', 'GCSE')
      RETURNING id
    `
    curriculumId = row.id as string
  }

  // ── 2. Courses ────────────────────────────────────────────────────────────
  // Check by label + teacher to stay idempotent
  const DEMO_COURSES = [
    { key: '10A Mathematics', label: '10A Mathematics', subject: 'Mathematics' },
    { key: '10B Biology',     label: '10B Biology',     subject: 'Biology'     },
    { key: '11A Mathematics', label: '11A Mathematics', subject: 'Mathematics' },
  ]

  const courseIds: Record<string, string> = {}
  for (const def of DEMO_COURSES) {
    const existing = await sql`
      SELECT id FROM courses
      WHERE teacher_id = ${DEV_TEACHER_ID} AND label = ${def.label}
      LIMIT 1
    `
    if (existing.length > 0) {
      courseIds[def.key] = existing[0].id as string
    } else {
      const [row] = await sql`
        INSERT INTO courses (teacher_id, label, subject, curriculum_id)
        VALUES (${DEV_TEACHER_ID}, ${def.label}, ${def.subject}, ${curriculumId})
        RETURNING id
      `
      courseIds[def.key] = row.id as string
    }
  }

  // ── 3. Students ──────────────────────────────────────────────────────────
  const STUDENTS: Record<string, string[]> = {
    '10A Mathematics': [
      'Amara Osei', 'Josh Patel', 'Chloe Thompson', 'Ethan Williams',
      'Priya Sharma', 'Finn McCarthy', 'Layla Hussain', 'Oliver Chen',
      'Sophia Nowak', 'James Okonkwo', 'Emma Rodriguez', 'Noah Fitzgerald',
    ],
    '10B Biology': [
      'Aisha Brown', 'Connor Walsh', 'Mei Lin', 'Tobias Müller',
      'Grace Adeyemi', 'Ryan O\'Brien', 'Fatima Al-Rashid', 'Lucas Kowalski',
      'Hannah Davies', 'Mohammed Hassan', 'Isla Morrison',
    ],
    '11A Mathematics': [
      'Daniel Park', 'Zara Ahmed', 'Ben Johnson', 'Sasha Petrova',
      'Tyler Brooks', 'Nadia Okafor', 'Jack Henderson', 'Amelia Tran',
      'Kai Nakamura', 'Sienna Clarke', 'Marcus Wright', 'Yara Ibrahim',
      'Sam Buchanan',
    ],
  }

  const studentCounts: Record<string, number> = {}
  for (const [courseKey, names] of Object.entries(STUDENTS)) {
    const courseId = courseIds[courseKey]
    const existingCount = await sql`
      SELECT COUNT(*)::int AS n FROM classes WHERE course_id = ${courseId}
    `
    if ((existingCount[0].n as number) > 0) {
      studentCounts[courseKey] = existingCount[0].n as number
      continue // already seeded
    }
    for (const name of names) {
      await sql`
        INSERT INTO classes (course_id, student_name)
        VALUES (${courseId}, ${name})
      `
    }
    studentCounts[courseKey] = names.length
  }

  // ── 4. Worksheets ─────────────────────────────────────────────────────────
  const WORKSHEETS: Record<string, string[]> = {
    '10A Mathematics': [
      'Indices & Surds — Homework 1',
    ],
    '11A Mathematics': [
      'Quadratic Equations — Practice Paper',
      'Circle Theorems — Mock Exam',
    ],
  }

  const worksheetCounts: Record<string, number> = {}
  for (const [courseKey, titles] of Object.entries(WORKSHEETS)) {
    const courseId = courseIds[courseKey]
    const existingWs = await sql`
      SELECT COUNT(*)::int AS n FROM worksheets WHERE course_id = ${courseId}
    `
    if ((existingWs[0].n as number) > 0) {
      worksheetCounts[courseKey] = existingWs[0].n as number
      continue // already seeded
    }
    for (const title of titles) {
      await sql`
        INSERT INTO worksheets (course_id, title)
        VALUES (${courseId}, ${title})
      `
    }
    worksheetCounts[courseKey] = titles.length
  }

  return NextResponse.json({
    ok: true,
    curriculum: { id: curriculumId, board: 'AQA', qualification: 'GCSE' },
    courses: Object.fromEntries(
      DEMO_COURSES.map((d) => [d.label, courseIds[d.key]])
    ),
    students: studentCounts,
    worksheets: worksheetCounts,
  })
}
