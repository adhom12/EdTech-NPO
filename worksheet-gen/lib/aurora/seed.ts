import type { Sql } from 'postgres'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

let _seeded = false

// ── Student data ───────────────────────────────────────────────────────────────

const STUDENTS: Record<string, string[]> = {
  '10A Mathematics': [
    'Amara Osei', 'Josh Patel', 'Chloe Thompson', 'Ethan Williams',
    'Priya Sharma', 'Finn McCarthy', 'Layla Hussain', 'Oliver Chen',
    'Sophia Nowak', 'James Okonkwo', 'Emma Rodriguez', 'Noah Fitzgerald',
  ],
  '10E Mathematics': [
    'Aisha Brown', 'Connor Walsh', 'Mei Lin', 'Tobias Müller',
    'Grace Adeyemi', "Ryan O'Brien", 'Fatima Al-Rashid', 'Lucas Kowalski',
    'Hannah Davies', 'Mohammed Hassan', 'Isla Morrison',
  ],
  '11A Mathematics': [
    'Daniel Park', 'Zara Ahmed', 'Ben Johnson', 'Sasha Petrova',
    'Tyler Brooks', 'Nadia Okafor', 'Jack Henderson', 'Amelia Tran',
    'Kai Nakamura', 'Sienna Clarke', 'Marcus Wright', 'Yara Ibrahim',
    'Sam Buchanan',
  ],
}

// daysAgo controls the worksheet created_at — drives the activity stream display
const WORKSHEETS: Record<string, { title: string; daysAgo: number }[]> = {
  '10A Mathematics': [
    { title: 'Indices & Surds — Homework 1', daysAgo: 5 },
  ],
  '11A Mathematics': [
    { title: 'Quadratic Equations — Practice Paper', daysAgo: 7 },
    { title: 'Circle Theorems — Mock Exam', daysAgo: 3 },
  ],
}

function daysAgoTs(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function seedDemoData(sql: Sql): Promise<void> {
  if (_seeded) return
  _seeded = true

  try {
    // Remove the old Biology class if it was seeded in a previous run
    await sql`
      DELETE FROM courses WHERE teacher_id = ${DEV_TEACHER_ID} AND label = '10B Biology'
    `

    // Fast check — if demo courses already exist, only backdate worksheets then return
    const existing = await sql`
      SELECT id, label FROM courses
      WHERE teacher_id = ${DEV_TEACHER_ID} AND label IN ('10A Mathematics', '10E Mathematics', '11A Mathematics')
    `
    if (existing.length >= 3) {
      const ids = Object.fromEntries(
        existing.map((r) => [r.label as string, r.id as string])
      )
      await backdateWorksheets(sql, ids)
      return
    }

    // Curriculum
    let curriculumId: string
    const curr = await sql`SELECT id FROM curricula WHERE board = 'AQA' AND qualification = 'GCSE' LIMIT 1`
    if (curr.length > 0) {
      curriculumId = curr[0].id as string
    } else {
      const [row] = await sql`INSERT INTO curricula (board, qualification) VALUES ('AQA', 'GCSE') RETURNING id`
      curriculumId = row.id as string
    }

    // Courses
    const courseDefs = [
      { label: '10A Mathematics', subject: 'Mathematics' },
      { label: '10E Mathematics', subject: 'Mathematics' },
      { label: '11A Mathematics', subject: 'Mathematics' },
    ]
    const courseIds: Record<string, string> = {}
    for (const def of courseDefs) {
      const check = await sql`
        SELECT id FROM courses WHERE teacher_id = ${DEV_TEACHER_ID} AND label = ${def.label} LIMIT 1
      `
      if (check.length > 0) {
        courseIds[def.label] = check[0].id as string
      } else {
        const [row] = await sql`
          INSERT INTO courses (teacher_id, label, subject, curriculum_id)
          VALUES (${DEV_TEACHER_ID}, ${def.label}, ${def.subject}, ${curriculumId})
          RETURNING id
        `
        courseIds[def.label] = row.id as string
      }
    }

    // Students
    for (const [label, names] of Object.entries(STUDENTS)) {
      const courseId = courseIds[label]
      if (!courseId) continue
      const count = await sql`SELECT COUNT(*)::int AS n FROM classes WHERE course_id = ${courseId}`
      if ((count[0].n as number) > 0) continue
      for (const name of names) {
        await sql`INSERT INTO classes (course_id, student_name) VALUES (${courseId}, ${name})`
      }
    }

    // Worksheets with backdated created_at for realistic activity stream
    for (const [label, defs] of Object.entries(WORKSHEETS)) {
      const courseId = courseIds[label]
      if (!courseId) continue
      for (const def of defs) {
        const ts = daysAgoTs(def.daysAgo)
        const check = await sql`SELECT id FROM worksheets WHERE course_id = ${courseId} AND title = ${def.title} LIMIT 1`
        if (check.length > 0) {
          await sql`UPDATE worksheets SET created_at = ${ts}::timestamptz WHERE id = ${check[0].id}`
        } else {
          await sql`
            INSERT INTO worksheets (course_id, title, created_at)
            VALUES (${courseId}, ${def.title}, ${ts}::timestamptz)
          `
        }
      }
    }
  } catch (err) {
    console.error('[seed] demo data seed failed:', err)
    _seeded = false
  }
}

async function backdateWorksheets(sql: Sql, courseIds: Record<string, string>): Promise<void> {
  try {
    for (const [label, defs] of Object.entries(WORKSHEETS)) {
      const courseId = courseIds[label]
      if (!courseId) continue
      for (const def of defs) {
        const ts = daysAgoTs(def.daysAgo)
        await sql`
          UPDATE worksheets SET created_at = ${ts}::timestamptz
          WHERE course_id = ${courseId} AND title = ${def.title}
        `
      }
    }
  } catch {
    // Non-fatal
  }
}
