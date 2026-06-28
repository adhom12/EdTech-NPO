import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WorksheetCard, type Worksheet } from '@/components/WorksheetCard'
import { SortControls } from '@/components/SortControls'
import { getDb } from '@/lib/aurora/client'
import { addStudent, removeStudent } from '@/app/actions/students'

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

function formatEventLabel(eventType: string, payload: Record<string, unknown>): string {
  if (eventType === 'worksheet_generated') {
    const count = payload.count as number | undefined
    const difficulty = payload.difficulty as string | undefined
    const parts = ['Question set generated']
    if (count) parts.push(`${count} questions`)
    if (difficulty) parts.push(difficulty)
    return parts.join(' · ')
  }
  if (eventType === 'question_flagged') {
    return 'Question flagged for review'
  }
  return eventType.replace(/_/g, ' ')
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ backgroundColor: '#16191F', border: '1px solid #252830' }}
    >
      <p className="text-2xl font-bold tracking-tight text-white mb-0.5">{value}</p>
      <p className="text-sm" style={{ color: '#A8B0BE' }}>{label}</p>
    </div>
  )
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string; tab?: string }>
}) {
  const [{ id }, { sort = 'newest', tab }] = await Promise.all([params, searchParams])
  const activeTab = ['students', 'reports'].includes(tab ?? '') ? tab! : 'overview'

  const sql = await getDb()

  const [courseRows, worksheetRows, studentRows, eventRows] = await Promise.all([
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
    sql`
      SELECT id, student_name, student_identifier
      FROM classes
      WHERE course_id = ${id}
      ORDER BY created_at ASC
    `,
    sql`
      SELECT event_type, payload, created_at
      FROM analytics_events
      WHERE course_id = ${id}
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ])

  if (!courseRows.length) notFound()

  const course = courseRows[0]
  const syllabusLabel = course.board ? `${course.board} ${course.qualification}` : ''

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

  const createHref = `/workspace/new?course_id=${id}`

  const CreateButton = () => (
    <Link
      href={createHref}
      className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90 flex-shrink-0"
      style={{ backgroundColor: '#4D528A' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 2v10M2 7h10" />
      </svg>
      Create new question set
    </Link>
  )

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8">

      {/* ── Hero banner ── */}
      <div
        className="rounded-2xl px-8 py-8 mb-6"
        style={{
          background: 'radial-gradient(ellipse at 0% 0%, rgba(77,82,138,0.18) 0%, transparent 55%), linear-gradient(155deg, #1D1A2E 0%, #181B24 50%, #141619 100%)',
          border: '1px solid rgba(77,82,138,0.22)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(77,82,138,0.18)',
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Link href="/courses" className="transition-colors hover:text-white" style={{ color: '#A8B0BE' }}>
                Classes
              </Link>
              <span style={{ color: '#4B5563' }}>/</span>
              <span className="text-white">{course.label as string}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              {course.label as string}
            </h1>
            <p className="text-sm" style={{ color: '#A8B0BE' }}>
              {syllabusLabel} · {course.subject as string}
            </p>
          </div>
          <CreateButton />
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex gap-7 mb-8 text-sm" style={{ borderBottom: '1px solid #252830' }}>
        {(['overview', 'students', 'reports'] as const).map((t) => (
          <Link
            key={t}
            href={t === 'overview' ? `/courses/${id}` : `/courses/${id}?tab=${t}`}
            className="transition-colors"
            style={activeTab === t ? {
              color: '#E8EAED',
              borderBottom: '2px solid #7C7FF5',
              paddingBottom: '12px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            } : {
              color: '#A8B0BE',
              borderBottom: '2px solid transparent',
              paddingBottom: '12px',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-3" style={{ width: 220, flexShrink: 0 }}>
            <StatCard value={allWorksheets.length} label={allWorksheets.length === 1 ? 'question set' : 'question sets'} />
            <StatCard value={studentRows.length} label={studentRows.length === 1 ? 'student' : 'students'} />
            {course.syllabus_code && (
              <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#16191F', border: '1px solid #252830' }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>Syllabus</p>
                <p className="text-2xl font-bold tracking-tight text-white mb-0.5">{course.syllabus_code as string}</p>
                {syllabusLabel && <p className="text-xs" style={{ color: '#A8B0BE' }}>{syllabusLabel}</p>}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <section className="mb-8">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #252830', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: '#1C1F27', borderBottom: '1px solid #252830' }}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>Activity Stream</h2>
                  {eventRows.length > 0 && (
                    <span className="text-xs tabular-nums" style={{ color: '#4B5563' }}>
                      {eventRows.length} event{eventRows.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div style={{ maxHeight: 320, overflowY: 'auto', backgroundColor: '#16191F' }}>
                    {eventRows.length === 0 ? (
                      <p className="px-5 py-6 text-sm" style={{ color: '#5A6070' }}>
                        No activity yet — generate a question set to get started.
                      </p>
                    ) : (
                      eventRows.map((ev, idx) => {
                        let payload: Record<string, unknown> = {}
                        try { payload = ev.payload as Record<string, unknown> } catch {}
                        const isGenerated = ev.event_type === 'worksheet_generated'
                        return (
                          <div key={idx} className="flex items-center justify-between px-5 py-4" style={{ borderTop: idx === 0 ? 'none' : '1px solid #1E2126' }}>
                            <div className="flex items-center gap-3">
                              <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, backgroundColor: isGenerated ? '#6366F1' : '#F28B82', boxShadow: isGenerated ? '0 0 7px rgba(99,102,241,0.55)' : '0 0 7px rgba(242,139,130,0.55)' }} />
                              <span className="text-sm text-white">{formatEventLabel(ev.event_type as string, payload)}</span>
                            </div>
                            <span className="text-xs flex-shrink-0 ml-4" style={{ color: '#8B909A' }}>{formatRelative(ev.created_at as string)}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {eventRows.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 52, background: 'linear-gradient(to bottom, transparent, #16191F)' }} />
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>Question Sets</h2>
                {sorted.length > 0 && <SortControls count={sorted.length} currentSort={sort} />}
              </div>
              {sorted.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {sorted.map((ws) => <WorksheetCard key={ws.id} worksheet={ws} />)}
                  {sorted.length === 1 && (
                    <Link href={createHref} className="group block rounded-xl p-5 transition-all duration-150 hover:border-[#4D528A]" style={{ border: '1.5px dashed #2C2E33' }}>
                      <div className="h-full flex flex-col items-center justify-center gap-2.5" style={{ minHeight: 80 }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#252830]" style={{ backgroundColor: '#1A1D21' }}>
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#4B5563' }}>
                            <path d="M7 2v10M2 7h10" />
                          </svg>
                        </div>
                        <span className="text-xs transition-colors group-hover:text-[#9AA0A6]" style={{ color: '#4B5563' }}>Create another set</span>
                      </div>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-10 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(63,68,110,0.07)', border: '1px dashed rgba(77,82,138,0.28)' }}>
                  <p className="text-sm mb-5" style={{ color: '#A8B0BE' }}>No question sets yet for this course.</p>
                  {suggestedTopics.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                      {suggestedTopics.map((topic) => (
                        <span key={topic} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#1E2024', border: '1px solid #2C2E33', color: '#A8B0BE' }}>{topic}</span>
                      ))}
                    </div>
                  )}
                  <CreateButton />
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ── Students tab ── */}
      {activeTab === 'students' && (
        <div>
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid #252830', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
            <div className="grid px-5 py-3" style={{ gridTemplateColumns: '1fr 9rem 5rem', backgroundColor: '#1C1F27', borderBottom: '1px solid #252830' }}>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9AA0AC' }}>Student Name</span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9AA0AC' }}>Student ID</span>
              <span />
            </div>
            {studentRows.length === 0 ? (
              <p className="px-5 py-6 text-sm" style={{ color: '#5A6070', backgroundColor: '#16191F' }}>No students added yet.</p>
            ) : (
              studentRows.map((s, idx) => {
                const removeAction = removeStudent.bind(null, s.id as string, id)
                return (
                  <div key={s.id as string} className="grid items-center px-5 py-4" style={{ gridTemplateColumns: '1fr 9rem 5rem', borderTop: idx === 0 ? 'none' : '1px solid #1E2126', backgroundColor: '#16191F' }}>
                    <span className="text-sm font-medium text-white">{s.student_name as string}</span>
                    <span className="text-xs font-mono" style={{ color: '#7A8090' }}>{s.student_identifier ? (s.student_identifier as string) : '—'}</span>
                    <div className="flex justify-end">
                      <form action={removeAction}>
                        <button type="submit" className="text-xs font-medium transition-colors hover:text-red-300" style={{ color: '#E05C5C' }}>Remove</button>
                      </form>
                    </div>
                  </div>
                )
              })
            )}
            {studentRows.length > 0 && (
              <div className="px-5 py-2.5" style={{ backgroundColor: '#1C1F27', borderTop: '1px solid #252830' }}>
                <span className="text-xs" style={{ color: '#8B909A' }}>{studentRows.length} {studentRows.length === 1 ? 'student' : 'students'} enrolled</span>
              </div>
            )}
          </div>

          <div className="rounded-xl px-5 py-5" style={{ backgroundColor: '#16191F', border: '1px solid #252830' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9AA0AC' }}>Quick Add Student</p>
            <form action={addStudent} className="flex items-center gap-3">
              <input type="hidden" name="course_id" value={id} />
              <input type="text" name="student_name" placeholder="Full name" required className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[#5A6070]" style={{ backgroundColor: '#0F1115', border: '1px solid #2C2F38', color: '#E8EAED' }} />
              <input type="text" name="student_identifier" placeholder="Student ID (optional)" className="px-3 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[#5A6070]" style={{ width: 176, flexShrink: 0, backgroundColor: '#0F1115', border: '1px solid #2C2F38', color: '#E8EAED' }} />
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0" style={{ backgroundColor: '#4D528A' }}>Add</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Reports tab ── */}
      {activeTab === 'reports' && (
        <div className="rounded-2xl p-12 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(63,68,110,0.07)', border: '1px dashed rgba(77,82,138,0.28)' }}>
          <p className="text-sm" style={{ color: '#A8B0BE' }}>Reports coming soon.</p>
        </div>
      )}

    </div>
  )
}
