import { CourseCard } from '@/components/CourseCard'
import { AddCourseCard } from '@/components/AddCourseCard'
import { getDb } from '@/lib/aurora/client'
import Link from 'next/link'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

function formatRelative(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function Dashboard() {
  let courses: Record<string, unknown>[] = []
  let curricula: Record<string, unknown>[] = []
  let recentWorksheets: Record<string, unknown>[] = []
  let dbError: string | null = null

  try {
    const sql = await getDb()
    ;[courses, curricula, recentWorksheets] = await Promise.all([
      sql`
        SELECT
          c.id, c.label, c.subject,
          cu.board, cu.qualification, cu.syllabus_code,
          (SELECT COUNT(*) FROM worksheets w WHERE w.course_id = c.id)::int AS worksheet_count
        FROM courses c
        LEFT JOIN curricula cu ON c.curriculum_id = cu.id
        WHERE c.teacher_id = ${DEV_TEACHER_ID}
        ORDER BY c.created_at DESC
      `,
      sql`
        SELECT id, board, qualification, syllabus_code
        FROM curricula
        ORDER BY board
      `,
      sql`
        SELECT w.id, w.title, w.created_at, c.label AS course_label, c.id AS course_id
        FROM worksheets w
        JOIN courses c ON w.course_id = c.id
        WHERE c.teacher_id = ${DEV_TEACHER_ID}
        ORDER BY w.created_at DESC
        LIMIT 8
      `,
    ])
  } catch (err) {
    dbError = String(err)
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm font-mono" style={{ color: '#F87171' }}>
          DB error: {dbError}
        </p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      {/* Greeting */}
      <h1 className="text-2xl font-bold text-white tracking-tight mb-8">
        Good morning, Teacher
      </h1>

      {/* ── Tier 1: Active Courses ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#6B7280' }}
          >
            Active Courses
          </h2>
          <span className="text-xs" style={{ color: '#4B5563' }}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id as string}
              id={course.id as string}
              label={course.label as string}
              subject={course.subject as string}
              board={(course.board as string) ?? ''}
              qualification={(course.qualification as string) ?? ''}
              worksheetCount={(course.worksheet_count as number) ?? 0}
            />
          ))}
          <AddCourseCard
            curricula={
              curricula as {
                id: string
                board: string
                qualification: string
                syllabus_code: string
              }[]
            }
          />
        </div>
      </section>

      {/* ── Tier 2: Recent Worksheets ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#6B7280' }}
          >
            Recent Worksheets
          </h2>
        </div>

        {recentWorksheets.length === 0 ? (
          <div
            className="rounded-xl px-6 py-10 flex flex-col items-center justify-center"
            style={{
              backgroundColor: 'rgba(63,68,110,0.07)',
              border: '1px dashed rgba(77,82,138,0.25)',
            }}
          >
            <p className="text-sm" style={{ color: '#6B7280' }}>
              No worksheets yet — create one from a course page.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #252830' }}
          >
            {/* Table header */}
            <div
              className="grid px-5 py-3 text-xs font-semibold uppercase tracking-widest"
              style={{
                gridTemplateColumns: '1fr 10rem 6rem',
                backgroundColor: '#16191F',
                borderBottom: '1px solid #252830',
                color: '#6B7280',
              }}
            >
              <span>Title</span>
              <span>Course</span>
              <span>Created</span>
            </div>

            {recentWorksheets.map((ws, idx) => (
              <Link
                key={ws.id as string}
                href={`/workspace/${ws.id as string}`}
                className="grid items-center px-5 py-3.5 transition-colors hover:bg-[#1C1F27]"
                style={{
                  gridTemplateColumns: '1fr 10rem 6rem',
                  borderTop: idx === 0 ? 'none' : '1px solid #1E2126',
                  backgroundColor: '#16191F',
                  textDecoration: 'none',
                }}
              >
                <span className="text-sm font-medium text-white truncate pr-4">
                  {ws.title as string}
                </span>
                <span className="text-xs truncate" style={{ color: '#8B909A' }}>
                  {ws.course_label as string}
                </span>
                <span className="text-xs tabular-nums" style={{ color: '#4B5563' }}>
                  {formatRelative(ws.created_at as string)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
