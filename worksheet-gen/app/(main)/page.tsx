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
        <p className="text-sm font-mono" style={{ color: '#dc2626' }}>
          DB error: {dbError}
        </p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 animate-page-in max-w-[1400px] mx-auto">
      {/* Greeting */}
      <h1 className="text-2xl font-bold tracking-tight mb-8" style={{ color: '#47574d' }}>
        Good morning, Teacher
      </h1>

      {/* ── Tier 1: Active Courses ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>
            Active Classes
          </h2>
          <span className="text-xs" style={{ color: '#c0cdc5' }}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.map((course, idx) => (
            <CourseCard
              key={course.id as string}
              id={course.id as string}
              label={course.label as string}
              subject={course.subject as string}
              board={(course.board as string) ?? ''}
              qualification={(course.qualification as string) ?? ''}
              worksheetCount={(course.worksheet_count as number) ?? 0}
              index={idx}
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
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>
            Recent Worksheets
          </h2>
        </div>

        {recentWorksheets.length === 0 ? (
          <div
            className="rounded-xl px-6 py-10 flex flex-col items-center justify-center"
            style={{
              backgroundColor: '#fdf0e9',
              border: '1px dashed rgba(232,117,59,0.3)',
            }}
          >
            <p className="text-sm" style={{ color: '#b0bfb4' }}>
              No worksheets yet — create one from a course page.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(71,87,77,0.1)',
              boxShadow: '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)',
            }}
          >
            {/* Table header */}
            <div
              className="grid px-5 py-3 text-xs font-semibold uppercase tracking-widest"
              style={{
                gridTemplateColumns: '1fr 10rem 6rem',
                backgroundColor: '#faf9f7',
                borderBottom: '1px solid #e5e2d9',
                color: '#b0bfb4',
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
                className="grid items-center px-5 py-3.5 bg-white hover:bg-[#f5f3ef] transition-colors duration-200"
                style={{
                  gridTemplateColumns: '1fr 10rem 6rem',
                  borderTop: idx === 0 ? 'none' : '1px solid #f0ede6',
                  textDecoration: 'none',
                }}
              >
                <span className="text-sm font-medium truncate pr-4" style={{ color: '#47574d' }}>
                  {ws.title as string}
                </span>
                <span className="text-xs truncate" style={{ color: '#8a9a8f' }}>
                  {ws.course_label as string}
                </span>
                <span className="text-xs tabular-nums" style={{ color: '#b0bfb4' }}>
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
