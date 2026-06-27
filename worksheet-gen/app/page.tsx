import { Navbar } from '@/components/Navbar'
import { CourseCard } from '@/components/CourseCard'
import { AddCourseCard } from '@/components/AddCourseCard'
import { createClient } from '@/lib/supabase/server'

// Replace with supabase.auth.getUser() once auth is wired up
const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

type CurriculaShape = { board: string; qualification: string; syllabus_code: string }
type WorksheetCountShape = { id: string }[]

export default async function Dashboard() {
  const supabase = await createClient()

  const [
    { data: courses, error: coursesError },
    { data: curricula, error: curriculaError },
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('id, label, subject, curricula(board, qualification, syllabus_code), worksheets(id)')
      .eq('teacher_id', DEV_TEACHER_ID)
      .order('created_at', { ascending: false }),
    supabase
      .from('curricula')
      .select('id, board, qualification, syllabus_code')
      .order('board'),
  ])

  console.log('courses result:', JSON.stringify({ count: courses?.length, error: coursesError?.message }))

  if (coursesError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121417' }}>
        <p className="text-sm font-mono" style={{ color: '#F87171' }}>
          DB error (courses): {coursesError.message}
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
            {(courses ?? []).map((course) => {
              const c = course.curricula as unknown as CurriculaShape | null
              const worksheetCount = (course.worksheets as WorksheetCountShape | null)?.length ?? 0
              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  label={course.label}
                  subject={course.subject}
                  board={c?.board ?? ''}
                  qualification={c?.qualification ?? ''}
                  worksheetCount={worksheetCount}
                />
              )
            })}
            <AddCourseCard curricula={curricula ?? []} />
          </div>
        </section>
      </main>
    </div>
  )
}
