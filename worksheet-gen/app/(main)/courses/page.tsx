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
  if (s.includes('math')) return '#4F46E5'
  if (s.includes('physics')) return '#0891B2'
  if (s.includes('chem')) return '#059669'
  if (s.includes('bio')) return '#65A30D'
  if (s.includes('english') || s.includes('lang')) return '#D97706'
  if (s.includes('hist')) return '#DB2777'
  if (s.includes('geo')) return '#0D9488'
  if (s.includes('comp') || s.includes('cs')) return '#2563EB'
  return '#7C3AED'
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
        className="rounded-xl overflow-hidden flex flex-col h-full group cursor-pointer card-surface"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(71,87,77,0.08)',
          borderTop: `2px solid ${accent}`,
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                backgroundColor: `${accent}14`,
                border: `1px solid ${accent}28`,
                color: accent,
              }}
            >
              {c.subject.charAt(0).toUpperCase()}
            </div>
            {isRecent && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
              >
                Active
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug mb-1" style={{ color: '#47574d' }}>
            {c.label}
          </h3>
          <p className="text-xs" style={{ color: '#8a9a8f' }}>
            {meta ? `${meta} · ` : ''}{c.subject}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 flex-shrink-0" style={{ borderTop: '1px solid #f0ede6', borderBottom: '1px solid #f0ede6' }}>
          {[
            { value: String(c.student_count),    label: 'students' },
            { value: String(c.worksheet_count),  label: 'question sets' },
            { value: formatRelative(c.latest_ws_date), label: 'last active' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex flex-col gap-0.5 px-4 py-3.5" style={i > 0 ? { borderLeft: '1px solid #f0ede6' } : {}}>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#47574d', lineHeight: 1.2 }}>
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
                <div className="w-0.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate" style={{ color: '#47574d' }}>
                    {c.latest_ws_title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                    {formatRelative(c.latest_ws_date)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#c0cdc5' }}>No assignments yet</p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0" style={{ borderTop: '1px solid #f0ede6' }}>
          <span className="text-xs" style={{ color: '#64748B' }}>
            Created {formatRelative(c.created_at)}
          </span>
          <span
            className="text-xs font-medium transition-colors group-hover:text-[#e8753b]"
            style={{ color: '#b0bfb4' }}
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
    <div className="px-8 py-8 animate-page-in max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#47574d' }}>Classes</h1>
          <p className="text-sm mt-1" style={{ color: '#b0bfb4' }}>
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
          style={{ minHeight: 240, border: '1.5px dashed rgba(71,87,77,0.18)' }}
        >
          <AddCourseCard
            curricula={curricula as unknown as { id: string; board: string; qualification: string; syllabus_code: string }[]}
          />
        </div>
      </div>

      {classes.length === 0 && (
        <div
          className="mt-4 rounded-2xl p-14 flex flex-col items-center justify-center col-span-2"
          style={{ backgroundColor: '#fdf0e9', border: '1px dashed rgba(232,117,59,0.3)' }}
        >
          <p className="text-sm mb-2" style={{ color: '#8a9a8f' }}>No classes yet.</p>
          <p className="text-xs" style={{ color: '#b0bfb4' }}>Create your first class to get started.</p>
        </div>
      )}
    </div>
  )
}
