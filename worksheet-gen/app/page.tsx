import { Navbar } from '@/components/Navbar'
import { CourseCard } from '@/components/CourseCard'
import { AddCourseCard } from '@/components/AddCourseCard'
import { getDb } from '@/lib/aurora/client'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

export default async function Dashboard() {
  let courses: Record<string, unknown>[] = []
  let curricula: Record<string, unknown>[] = []
  let dbError: string | null = null

  try {
    const sql = await getDb()
    ;[courses, curricula] = await Promise.all([
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
    ])
  } catch (err) {
    dbError = String(err)
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121417' }}>
        <p className="text-sm font-mono" style={{ color: '#F87171' }}>
          DB error: {dbError}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121417' }}>
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">
          Good morning, Ms. Johnson 👋
        </h1>

        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: '#9AA0A6' }}
          >
            Your Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <AddCourseCard curricula={curricula as { id: string; board: string; qualification: string; syllabus_code: string }[]} />
          </div>
        </section>
      </main>
    </div>
  )
}
