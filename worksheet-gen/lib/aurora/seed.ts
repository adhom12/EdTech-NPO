import type { Sql } from 'postgres'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

let _seeded = false

// ── Question snapshots ────────────────────────────────────────────────────────

const INDICES_SURDS_QUESTIONS = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Simplify $3^7 \\div 3^4$, giving your answer as a power of 3.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Index Laws',
  },
  {
    number: 2,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Evaluate $\\left(\\dfrac{2}{5}\\right)^{-2}$.' },
      { type: 'subtext', text: 'Give your answer as a fraction in its simplest form.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Negative Indices',
  },
  {
    number: 3,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Write $\\sqrt{48}$ in the form $a\\sqrt{3}$, where $a$ is an integer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Simplifying Surds',
  },
  {
    number: 4,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Expand and simplify $(3 + \\sqrt{5})(3 - \\sqrt{5})$.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Multiplying Surds',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'Rationalise the denominator and simplify fully:' },
      { type: 'display', math: '\\frac{10}{3 + \\sqrt{2}}' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Rationalising Denominators',
  },
]

const CIRCLE_THEOREMS_QUESTIONS = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'O is the centre of a circle. Points A, B and C lie on the circle.' },
      { type: 'p', text: 'Angle $AOB = 124°$.' },
      { type: 'p', text: 'Find angle $ACB$, giving a reason for your answer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Angle at the Centre',
  },
  {
    number: 2,
    marks: 2,
    blocks: [
      { type: 'p', text: '$AB$ is a diameter of a circle with centre $O$. $C$ is a point on the circumference.' },
      { type: 'p', text: 'Find angle $ACB$, giving a reason.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Angle in a Semicircle',
  },
  {
    number: 3,
    marks: 3,
    blocks: [
      { type: 'p', text: '$ABCD$ is a cyclic quadrilateral.' },
      { type: 'p', text: 'Angle $ABC = 117°$ and angle $BCD = 78°$.' },
      { type: 'p', text: '(a) Find angle $ADC$.' },
      { type: 'p', text: '(b) Find angle $DAB$.' },
      { type: 'subtext', text: 'State the circle theorem used in each part.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Cyclic Quadrilaterals',
  },
  {
    number: 4,
    marks: 3,
    blocks: [
      { type: 'p', text: 'A tangent from external point $T$ touches a circle with centre $O$ at point $A$.' },
      { type: 'p', text: '$OA = 5\\text{ cm}$ and $OT = 13\\text{ cm}$.' },
      { type: 'p', text: 'Calculate the length $AT$, giving a reason for any right angle used.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Tangent-Radius',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'A circle has centre $O$. $A$ and $B$ are points on the circle and $TA$ is a tangent to the circle at $A$.' },
      { type: 'p', text: 'Angle $OAB = 32°$.' },
      { type: 'p', text: '(a) Find angle $OBA$. Give a reason for your answer. [2]' },
      { type: 'p', text: '(b) Hence find angle $TAB$. Give a reason for your answer. [2]' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Tangent-Radius',
  },
]

const WORKSHEET_SNAPSHOTS: Record<string, object[]> = {
  'Indices & Surds — Homework 1': INDICES_SURDS_QUESTIONS,
  'Circle Theorems — Mock Exam': CIRCLE_THEOREMS_QUESTIONS,
}

// ── Schema migration ───────────────────────────────────────────────────────────

export async function ensureSchema(sql: Sql): Promise<void> {
  try {
    await sql`ALTER TABLE worksheets ADD COLUMN IF NOT EXISTS questions_snapshot JSONB`
  } catch {
    // Column already exists or table missing — either way non-fatal
  }
}

// ── Student and worksheet seed data ───────────────────────────────────────────

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

const WORKSHEETS: Record<string, string[]> = {
  '10A Mathematics': ['Indices & Surds — Homework 1'],
  '11A Mathematics': [
    'Quadratic Equations — Practice Paper',
    'Circle Theorems — Mock Exam',
  ],
}

export async function seedDemoData(sql: Sql): Promise<void> {
  if (_seeded) return
  _seeded = true

  try {
    // Remove the old Biology class if it was seeded in a previous run
    await sql`
      DELETE FROM courses WHERE teacher_id = ${DEV_TEACHER_ID} AND label = '10B Biology'
    `

    // Fast check — if demo courses already exist, bail immediately
    const existing = await sql`
      SELECT id, label FROM courses
      WHERE teacher_id = ${DEV_TEACHER_ID} AND label IN ('10A Mathematics', '10E Mathematics', '11A Mathematics')
    `
    if (existing.length >= 3) {
      // Still patch any missing data on re-runs
      await seedMissingSnapshots(sql)
      const ids = Object.fromEntries(
        existing.map((r) => [r.label as string, r.id as string])
      )
      await seedMissingEvents(sql, ids)
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

    // Worksheets
    const worksheetIds: Record<string, string> = {}
    for (const [label, titles] of Object.entries(WORKSHEETS)) {
      const courseId = courseIds[label]
      if (!courseId) continue
      for (const title of titles) {
        const check = await sql`SELECT id FROM worksheets WHERE course_id = ${courseId} AND title = ${title} LIMIT 1`
        if (check.length > 0) {
          worksheetIds[title] = check[0].id as string
        } else {
          const [row] = await sql`
            INSERT INTO worksheets (course_id, title) VALUES (${courseId}, ${title}) RETURNING id
          `
          worksheetIds[title] = row.id as string
        }
      }
    }

    // Question snapshots
    for (const [title, questions] of Object.entries(WORKSHEET_SNAPSHOTS)) {
      const worksheetId = worksheetIds[title]
      if (!worksheetId) continue
      await sql`
        UPDATE worksheets SET questions_snapshot = ${JSON.stringify(questions)}::jsonb
        WHERE id = ${worksheetId} AND questions_snapshot IS NULL
      `
    }

    // Activity stream events
    await seedMissingEvents(sql, courseIds)
  } catch (err) {
    console.error('[seed] demo data seed failed:', err)
    _seeded = false
  }
}

async function seedMissingSnapshots(sql: Sql): Promise<void> {
  try {
    for (const [title, questions] of Object.entries(WORKSHEET_SNAPSHOTS)) {
      await sql`
        UPDATE worksheets SET questions_snapshot = ${JSON.stringify(questions)}::jsonb
        WHERE title = ${title} AND questions_snapshot IS NULL
      `
    }
  } catch {
    // Non-fatal
  }
}

const SEED_EVENTS = [
  { courseLabel: '10A Mathematics', title: 'Indices & Surds — Homework 1',        daysAgo: 5 },
  { courseLabel: '11A Mathematics', title: 'Quadratic Equations — Practice Paper', daysAgo: 7 },
  { courseLabel: '11A Mathematics', title: 'Circle Theorems — Mock Exam',          daysAgo: 3 },
]

async function seedMissingEvents(sql: Sql, courseIds: Record<string, string>): Promise<void> {
  try {
    for (const ev of SEED_EVENTS) {
      const courseId = courseIds[ev.courseLabel]
      if (!courseId) continue
      const check = await sql`
        SELECT id FROM analytics_events
        WHERE course_id = ${courseId}
          AND event_type = 'worksheet_assigned'
          AND payload->>'title' = ${ev.title}
        LIMIT 1
      `
      if (check.length > 0) continue
      const ts = new Date(Date.now() - ev.daysAgo * 24 * 60 * 60 * 1000).toISOString()
      await sql`
        INSERT INTO analytics_events (course_id, event_type, payload, created_at)
        VALUES (${courseId}, 'worksheet_assigned', ${JSON.stringify({ title: ev.title })}::jsonb, ${ts}::timestamptz)
      `
    }
  } catch {
    // Non-fatal
  }
}
