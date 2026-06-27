import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { WorksheetCard, type Worksheet } from '@/components/WorksheetCard'
import { SortControls } from '@/components/SortControls'
import { getDb } from '@/lib/aurora/client'

function formatRelative(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const [{ id }, { sort = 'newest' }] = await Promise.all([params, searchParams])
  const sql = await getDb()

  const [courseRows, worksheetRows] = await Promise.all([
    sql`
      SELECT
        c.id, c.label, c.subject,
        cu.id AS curriculum_id, cu.board, cu.qualification, cu.syllabus_code
      FROM courses c
      LEFT JOIN curricula cu ON c.curriculum_id = cu.id
      WHERE c.id = ${id}
      LIMIT 1
    `,
    sql`
      SELECT id, title, created_at
      FROM worksheets
      WHERE course_id = ${id}
      ORDER BY created_at DESC
    `,
  ])

  if (!courseRows.length) notFound()

  const course = courseRows[0]
  const syllabusLabel = course.board ? `${course.board} ${course.qualification}` : ''

  // Fetch topic suggestions for the empty state
  let suggestedTopics: string[] = []
  if (!worksheetRows.length && course.curriculum_id) {
    const topicRows = await sql`
      SELECT DISTINCT topic
      FROM skills
      WHERE curriculum_id = ${course.curriculum_id as string}
      ORDER BY topic
      LIMIT 200
    `
    suggestedTopics = topicRows.map((r) => r.topic as string).slice(0, 8)
  }

  const allWorksheets: Worksheet[] = worksheetRows.map((ws) => ({
    id: ws.id as string,
    courseId: id,
    title: ws.title as string,
    syllabus: syllabusLabel,
    subject: course.subject as string,
    modifiedAt: formatRelative(ws.created_at as string),
  }))

  const sorted = [...allWorksheets]
  if (sort === 'oldest') sorted.reverse()
  else if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title))

  const lastActivity = worksheetRows.length
    ? formatRelative(worksheetRows[0].created_at as string)
    : null

  const createHref = `/workspace/new?course_id=${id}`

  const CreateButton = () => (
    <Link
      href={createHref}
      className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
      style={{ backgroundColor: '#4D528A' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 2v10M2 7h10" />
      </svg>
      Create new question set
    </Link>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121417' }}>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-8 py-10">
        <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#9AA0A6' }}>
          <Link href="/" className="transition-colors hover:text-white" style={{ color: '#9AA0A6' }}>
            Courses
          </Link>
          <span>/</span>
          <span className="text-white">{course.label as string}</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              {course.label as string}
            </h1>
            <p className="text-sm" style={{ color: '#9AA0A6' }}>
              {syllabusLabel} · {course.subject as string}
            </p>
          </div>
          <CreateButton />
        </div>

        <div
          className="flex items-center gap-6 px-5 py-3 rounded-xl mb-10 text-sm"
          style={{ backgroundColor: '#1A1D21', border: '1px solid #2C2E33' }}
        >
          <div>
            <span className="font-semibold text-white">{allWorksheets.length}</span>
            <span className="ml-1.5" style={{ color: '#9AA0A6' }}>
              {allWorksheets.length === 1 ? 'question set' : 'question sets'}
            </span>
          </div>
          {lastActivity && (
            <>
              <span style={{ color: '#2C2E33' }}>|</span>
              <div>
                <span style={{ color: '#9AA0A6' }}>Last activity</span>
                <span className="ml-1.5 font-medium text-white">{lastActivity}</span>
              </div>
            </>
          )}
          {course.syllabus_code && (
            <>
              <span style={{ color: '#2C2E33' }}>|</span>
              <div>
                <span style={{ color: '#9AA0A6' }}>Syllabus</span>
                <span className="ml-1.5 font-medium text-white">{course.syllabus_code as string}</span>
              </div>
            </>
          )}
        </div>

        {sorted.length > 0 ? (
          <section>
            <SortControls count={sorted.length} currentSort={sort} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((ws) => (
                <WorksheetCard key={ws.id} worksheet={ws} />
              ))}
            </div>
          </section>
        ) : (
          <div
            className="rounded-2xl p-10 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'rgba(63,68,110,0.10)', border: '1px solid rgba(77,82,138,0.20)' }}
          >
            <p className="text-sm mb-5" style={{ color: '#9AA0A6' }}>
              No question sets yet for this course.
            </p>
            {suggestedTopics.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg">
                {suggestedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#1E2024', border: '1px solid #2C2E33', color: '#9AA0A6' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
            <CreateButton />
          </div>
        )}
      </main>
    </div>
  )
}
