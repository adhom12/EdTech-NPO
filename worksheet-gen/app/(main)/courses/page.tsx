import Link from 'next/link'
import { getDb } from '@/lib/aurora/client'
import { AddCourseCard } from '@/components/AddCourseCard'

const DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '—'
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function subjectAccent(subject: string): string {
  const s = (subject ?? '').toLowerCase()
  if (s.includes('math')) return '#6366F1'
  if (s.includes('physics')) return '#22D3EE'
  if (s.includes('chem')) return '#10B981'
  if (s.includes('bio')) return '#84CC16'
  if (s.includes('english') || s.includes('lang')) return '#F59E0B'
  if (s.includes('hist')) return '#EC4899'
  if (s.includes('geo')) return '#14B8A6'
  if (s.includes('comp') || s.includes('cs')) return '#3B82F6'
  return '#8B5CF6'
}

type ClassRow = {
  id: string
  label: string
  subject: string
  board: string | null
  qualification: string | null
  syllabus_code: string | null
  student_count: number
  worksheet_count: number
  latest_ws_title: string | null
  latest_ws_date: string | null
  created_at: string
}

function ClassCard({ c }: { c: ClassRow }) {
  const accent = subjectAccent(c.subject)
  const parts: string[] = []
  if (c.board) parts.push(`${c.board} ${c.qualification}`)
  if (c.syllabus_code) parts.push(c.syllabus_code)
  const meta = parts.join(' · ')

  const isRecent = c.latest_ws_date
    ? Date.now() - new Date(c.latest_ws_date).getTime() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <Link href={`/courses/${c.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="rounded-xl overflow-hidden transition-colors duration-150 group cursor-pointer flex flex-col h-full border border-[#25333E] hover:border-[#06B6D4]"
        style={{ backgroundColor: '#1A242C' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid #1A2832' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                backgroundColor: `${accent}1A`,
                border: `1px solid ${accent}40`,
                color: accent,
              }}
            >
              {c.subject.charAt(0).toUpperCase()}
            </div>
            {isRecent && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                style={{ backgroundColor: '#162A1F', color: '#4ADE80', border: '1px solid #1F3D2A' }}
              >
                Active
              </span>
            )}
          </div>
          <h3
            className="font-semibold text-base leading-snug mb-1 transition-colors"
            style={{ color: '#F8FAFC' }}
          >
            {c.label}
          </h3>
          <p className="text-xs" style={{ color: '#64748B' }}>
            {meta ? `${meta} · ` : ''}{c.subject}
          </p>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #1A2832' }}
        >
          {[
            { value: String(c.student_count), label: 'students' },
            { value: String(c.worksheet_count), label: 'question sets' },
            { value: formatRelative(c.latest_ws_date), label: 'last active' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex flex-col gap-0.5 px-5 py-4" style={i > 0 ? { borderLeft: '1px solid #1A2832' } : {}}>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: '#F8FAFC', lineHeight: 1.2 }}
              >
                {value}
              </span>
              <span className="text-xs" style={{ color: '#64748B' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Latest assignment preview */}
        <div className="px-5 py-4 flex-1">
          {c.latest_ws_title ? (
            <div>
              <p className="text-xs mb-2" style={{ color: '#64748B' }}>Latest assignment</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-0.5 h-9 rounded-full flex-shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium leading-tight truncate"
                    style={{ color: '#F8FAFC' }}
                  >
                    {c.latest_ws_title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                    {formatRelative(c.latest_ws_date)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#2E3340' }}>No assignments yet</p>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="px-5 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: '1px solid #1A1D22' }}
        >
          <span className="text-xs" style={{ color: '#64748B' }}>
            Created {formatRelative(c.created_at)}
          </span>
          <span
            className="text-xs font-medium transition-colors group-hover:text-[#06B6D4]"
            style={{ color: '#64748B' }}
          >
            Open class →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function ClassesPage() {
  const sql = await getDb()

  const [classRows, curricula] = await Promise.all([
    sql`
      SELECT
        c.id, c.label, c.subject, c.created_at,
        cu.board, cu.qualification, cu.syllabus_code,
        (SELECT COUNT(*) FROM classes cl WHERE cl.course_id = c.id)::int AS student_count,
        (SELECT COUNT(*) FROM worksheets w WHERE w.course_id = c.id)::int AS worksheet_count,
        (SELECT w.title FROM worksheets w WHERE w.course_id = c.id ORDER BY w.created_at DESC LIMIT 1) AS latest_ws_title,
        (SELECT w.created_at FROM worksheets w WHERE w.course_id = c.id ORDER BY w.created_at DESC LIMIT 1) AS latest_ws_date
      FROM courses c
      LEFT JOIN curricula cu ON c.curriculum_id = cu.id
      WHERE c.teacher_id = ${DEV_TEACHER_ID}
      ORDER BY c.created_at DESC
    `,
    sql`SELECT id, board, qualification, syllabus_code FROM curricula ORDER BY board`,
  ])

  const classes = classRows as unknown as ClassRow[]

  return (
    <div className="px-8 py-8 animate-page-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Classes</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            {classes.length} {classes.length === 1 ? 'class' : 'classes'}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {classes.map((c) => (
          <ClassCard key={c.id} c={c} />
        ))}

        {/* Add new class card */}
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            minHeight: 240,
            border: '1.5px dashed #25333E',
          }}
        >
          <AddCourseCard
            curricula={curricula as unknown as { id: string; board: string; qualification: string; syllabus_code: string }[]}
          />
        </div>
      </div>

      {classes.length === 0 && (
        <div
          className="mt-4 rounded-2xl p-14 flex flex-col items-center justify-center col-span-2"
          style={{ backgroundColor: 'rgba(63,68,110,0.06)', border: '1px dashed rgba(77,82,138,0.22)' }}
        >
          <p className="text-sm mb-2" style={{ color: '#94A3B8' }}>No classes yet.</p>
          <p className="text-xs" style={{ color: '#64748B' }}>Create your first class to get started.</p>
        </div>
      )}
    </div>
  )
}
