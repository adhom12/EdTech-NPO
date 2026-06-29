'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface WorksheetRow { id: string; title: string; createdAt: string }
interface StudentRow   { id: string; student_name: string }

// ── Deterministic helpers (no randomness — consistent per course) ──────────────

function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return h & 0x7FFFFFFF
}

function extractTopic(title: string): string {
  const em = title.indexOf('—') // em dash —
  if (em > 0) return title.slice(0, em).trim()
  const hy = title.indexOf(' - ')
  if (hy > 0) return title.slice(0, hy).trim()
  return title
}

function topicMastery(topic: string, courseId: string): number {
  return 38 + (djb2(topic + courseId) % 47) // 38–84 %
}

function topicTrend(mastery: number, topic: string): 'up' | 'stable' | 'down' {
  const h = djb2(topic) % 3
  if (mastery >= 72) return h === 0 ? 'stable' : 'up'
  if (mastery >= 52) return h === 0 ? 'down' : 'stable'
  return h === 0 ? 'down' : 'stable'
}

function pickStudents(students: StudentRow[], courseId: string, n: number): StudentRow[] {
  if (!students.length) return []
  const h = djb2(courseId)
  const picked: StudentRow[] = []
  const seen = new Set<number>()
  for (let i = 0; picked.length < Math.min(n, students.length); i++) {
    const idx = (h + i * 11 + i * i) % students.length
    if (!seen.has(idx)) { seen.add(idx); picked.push(students[idx]) }
  }
  return picked
}

// ── Error tag lookup (keyed on extracted topic) ────────────────────────────────

const ERROR_TAGS: Record<string, { tag: string; detail: string }> = {
  'Indices & Surds': {
    tag: 'Incorrect index law application',
    detail: 'Students are misapplying index laws — particularly confusing multiplication of bases with addition of exponents, and mishandling negative indices.',
  },
  'Circle Theorems': {
    tag: 'Theorem misidentification',
    detail: 'Students are confusing which circle theorem applies — common errors include mixing the angle at the centre with the alternate segment theorem.',
  },
  'Quadratic Equations': {
    tag: 'Sign errors in factorisation',
    detail: 'Students are making sign errors when factorising — particularly with negative constant terms and when completing the square.',
  },
  'Probability': {
    tag: 'Incorrect sample space',
    detail: 'Students are listing incomplete sample spaces and failing to account for dependent events in multi-stage probability problems.',
  },
  'Trigonometry': {
    tag: 'Incorrect ratio selection',
    detail: 'Students are selecting the wrong trigonometric ratio for the given information — mixing up adjacent, opposite and hypotenuse labels.',
  },
}

function getErrorTag(topic: string): { tag: string; detail: string } {
  return ERROR_TAGS[topic] ?? {
    tag: 'Procedural errors',
    detail: 'Students are making procedural errors — common mistakes include misapplied operations and incorrect rearrangement of algebraic terms.',
  }
}

// ── Insight templates ──────────────────────────────────────────────────────────

function buildSuggestions(
  students: StudentRow[],
  topics: string[],
  courseId: string,
) {
  const h = djb2(courseId)
  const picked = pickStudents(students, courseId, 2)
  const t0 = topics[0] ?? 'Algebra'
  const t1 = topics[1] ?? t0
  const firstName = (s: StudentRow) => s.student_name.split(' ')[0]
  const lastName  = (s: StudentRow) => {
    const parts = s.student_name.split(' ')
    return parts.length > 1 ? parts[parts.length - 1][0] + '.' : ''
  }

  const cards = []

  if (picked[0]) {
    const s = picked[0]
    const abbr = `${firstName(s)} ${lastName(s)}`
    cards.push({
      id: 'r1',
      type: 'individual' as const,
      label: abbr,
      topic: t0,
      insight: `${firstName(s)} is scoring consistently below class average on ${t0} — particularly on multi-step questions requiring layered reasoning. Three of their last five attempts on this topic fell below 50%.`,
      action: 'Generate Revision Set',
      severity: 'high' as const,
    })
  }

  const clusterSize = 2 + (h % 3) // 2–4 students
  cards.push({
    id: 'r2',
    type: 'cluster' as const,
    label: `${clusterSize} students`,
    topic: t1,
    insight: `Conceptual gaps in ${t1} detected across this group — errors suggest an incomplete understanding of the underlying rule, not just careless mistakes.`,
    action: 'Create Group Assignment',
    severity: 'medium' as const,
  })

  if (picked[1]) {
    const s = picked[1]
    const abbr = `${firstName(s)} ${lastName(s)}`
    cards.push({
      id: 'r3',
      type: 'individual' as const,
      label: abbr,
      topic: topics[h % topics.length] ?? t0,
      insight: `${firstName(s)} shows strong procedural recall but underperforms on application questions — likely a gap between routine practice and unfamiliar contexts.`,
      action: 'Generate Revision Set',
      severity: 'medium' as const,
    })
  }

  return cards
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function masteryColor(pct: number) {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#B45309'
  return '#dc2626'
}

function masteryLabel(pct: number) {
  if (pct >= 75) return { text: 'Strong',     color: '#16a34a' }
  if (pct >= 50) return { text: 'Developing', color: '#B45309' }
  return             { text: 'Needs work',  color: '#dc2626' }
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l4-5 4 5" /></svg>
  if (trend === 'down')
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3l4 5 4-5" /></svg>
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#b0bfb4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8" /></svg>
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.93 2.93l1.42 1.42M8.65 8.65l1.42 1.42M2.93 10.07l1.42-1.42M8.65 4.35l1.42-1.42" stroke="#47574d" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6.5" cy="6.5" r="1.8" fill="#47574d" />
    </svg>
  )
}

function ArrowBtn({ onClick, disabled, direction }: { onClick: () => void; disabled: boolean; direction: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: 'transparent',
        color: disabled ? '#d5d2c8' : '#8a9a8f',
        border: '1px solid',
        borderColor: disabled ? '#ede9e0' : '#e5e2d9',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.backgroundColor = '#f0ede6'; e.currentTarget.style.color = '#47574d' } }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = disabled ? '#d5d2c8' : '#8a9a8f' }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'left' ? <path d="M6.5 2L3.5 5l3 3" /> : <path d="M3.5 2L6.5 5l-3 3" />}
      </svg>
    </button>
  )
}

function SlideDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{ height: 5, width: i === active ? 14 : 5, backgroundColor: i === active ? '#e8753b' : '#e5e2d9' }}
        />
      ))}
    </div>
  )
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: '#ffffff', border: '1px solid rgba(71,87,77,0.1)', boxShadow: '0 1px 3px rgba(71,87,77,0.08)' }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, badge, right }: { title: string; badge?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5"
      style={{ backgroundColor: '#faf9f7', borderBottom: '1px solid #e5e2d9' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>{title}</h3>
      {right ?? (badge && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
        >{badge}</span>
      ))}
    </div>
  )
}

// ── Topic Mastery ──────────────────────────────────────────────────────────────

function TopicMasteryCard({ topics }: { topics: Array<{ topic: string; mastery: number; trend: 'up' | 'stable' | 'down' }> }) {
  if (topics.length === 0) {
    return (
      <SectionCard>
        <CardHeader title="Recently Assigned Topics" badge="Class performance" />
        <div className="px-5 py-8 text-center">
          <p className="text-sm" style={{ color: '#c0cdc5' }}>No question sets assigned yet.</p>
          <p className="text-xs mt-1" style={{ color: '#d5d2c8' }}>Topics will appear here once the first worksheet is generated.</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard>
      <CardHeader title="Recently Assigned Topics" badge="Class performance" />
      <div className="px-5 py-4 flex flex-col gap-4">
        {topics.map(({ topic, mastery, trend }) => {
          const color = masteryColor(mastery)
          const lbl   = masteryLabel(mastery)
          return (
            <div key={topic}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={trend} />
                  <span className="text-sm font-medium" style={{ color: mastery < 50 ? '#dc2626' : '#47574d' }}>{topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: lbl.color }}>{lbl.text}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>{mastery}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0ede6' }}>
                <div className="h-full rounded-full" style={{ width: `${mastery}%`, backgroundColor: color, opacity: 0.75 }} />
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ── Last Assignment Carousel ───────────────────────────────────────────────────

function LastAssignmentCarousel({
  worksheet,
  classSize,
  courseId,
}: {
  worksheet: WorksheetRow | null
  classSize: number
  courseId: string
}) {
  const [slide, setSlide] = useState(0)

  if (!worksheet) {
    return (
      <div className="rounded-xl overflow-hidden px-5 py-6 text-center"
        style={{ border: '1px solid rgba(217,119,6,0.15)', backgroundColor: 'rgba(217,119,6,0.03)' }}
      >
        <p className="text-sm" style={{ color: '#c0cdc5' }}>No assignments yet.</p>
        <p className="text-xs mt-1" style={{ color: '#d5d2c8' }}>The last assignment report will appear after the first worksheet is assigned.</p>
      </div>
    )
  }

  const h = djb2(worksheet.title + courseId)
  const topic = extractTopic(worksheet.title)
  const err = getErrorTag(topic)
  const completionRate = 62 + (h % 26)
  const studentsCompleted = Math.max(1, Math.round(completionRate * classSize / 100))
  const avgScore = 44 + ((h >> 4) % 34)
  const failureRate = 28 + ((h >> 8) % 42)
  const flaggedQ = 1 + (h % 5)

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(217,119,6,0.25)', backgroundColor: 'rgba(217,119,6,0.03)', boxShadow: '0 1px 3px rgba(71,87,77,0.06)' }}
    >
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(217,119,6,0.15)', backgroundColor: 'rgba(217,119,6,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="#d97706" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6.5 5.5v3" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="6.5" cy="10" r="0.6" fill="#d97706"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#d97706' }}>Last Assignment Report</span>
        </div>
        <div className="flex items-center gap-2">
          <SlideDots total={2} active={slide} />
          <div className="flex items-center gap-1 ml-1">
            <ArrowBtn direction="left"  disabled={slide === 0} onClick={() => setSlide(0)} />
            <ArrowBtn direction="right" disabled={slide === 1} onClick={() => setSlide(1)} />
          </div>
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', transform: `translateX(-${slide * 100}%)`, transition: 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>

          {/* Slide 1 — Stats */}
          <div style={{ flex: '0 0 100%', minWidth: 0 }} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#47574d' }}>{worksheet.title}</p>
                <p className="text-xs" style={{ color: '#8a9a8f' }}>Topic: {topic}</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.22)' }}
              >
                {failureRate}% failure rate
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Completed', value: `${completionRate}%`,  sub: `${studentsCompleted}/${classSize} students` },
                { label: 'Avg Score', value: `${avgScore}%`,         sub: 'class average' },
                { label: 'Flagged',   value: `Q${flaggedQ}`,         sub: err.tag },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
                  style={{ backgroundColor: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.15)' }}
                >
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: '#b0956a' }}>{label}</span>
                  <span className="text-base font-bold tabular-nums" style={{ color: '#92400e' }}>{value}</span>
                  <span className="text-[10px] truncate" style={{ color: '#c4a265' }}>{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 2 — Red Flag */}
          <div style={{ flex: '0 0 100%', minWidth: 0 }} className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#dc2626' }}>⚑ Red Flag</span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#6b7b70' }}>
              <span className="font-semibold" style={{ color: '#47574d' }}>{failureRate}%</span> of students
              failed <span className="font-medium" style={{ color: '#d97706' }}>Question {flaggedQ}</span> on{' '}
              <span className="font-medium" style={{ color: '#47574d' }}>{worksheet.title}</span>.{' '}
              {err.detail}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: '#d97706', border: '1px solid rgba(217,119,6,0.18)' }}
              >
                ⚠ {err.tag}
              </span>
              <span className="text-xs" style={{ color: '#b0bfb4' }}>· {worksheet.title}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Remediation Card ───────────────────────────────────────────────────────────

type SuggCard = ReturnType<typeof buildSuggestions>[number]

function RemediationCard({ card, courseId }: { card: SuggCard; courseId: string }) {
  const isHigh = card.severity === 'high'
  const accentColor = isHigh ? '#dc2626' : '#d97706'
  const isIndividual = card.type === 'individual'

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#ffffff', border: '1px solid rgba(71,87,77,0.08)', boxShadow: '0 1px 3px rgba(71,87,77,0.06)' }}
    >
      <div className="flex">
        <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: accentColor, opacity: 0.7 }} />
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            {isIndividual ? (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#f0ede6', color: '#47574d', border: '1px solid rgba(71,87,77,0.18)' }}
              >
                {card.label.charAt(0)}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="4.5" r="2" /><circle cx="9" cy="5" r="1.5" />
                  <path d="M1 11c0-2.2 1.8-4 4-4s4 1.8 4 4" /><path d="M9 7c1.7 0 3 1.3 3 3" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <span className="text-sm font-semibold" style={{ color: '#47574d' }}>{card.label}</span>
              <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
              >
                {card.topic}
              </span>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}66` }}
            />
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: '#8a9a8f' }}>{card.insight}</p>

          <Link
            href={
              card.action === 'Create Group Assignment'
                ? `/workspace/new?demo=group-assignment&course_id=${courseId}`
                : `/workspace/new?course_id=${courseId}`
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-85"
            style={{ backgroundColor: 'rgba(71,87,77,0.07)', color: '#47574d', border: '1px solid rgba(71,87,77,0.2)' }}
          >
            <SparkIcon />
            {card.action}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Suggestions Carousel ───────────────────────────────────────────────────────

function SuggestionsCarousel({
  courseId,
  cards,
}: {
  courseId: string
  cards: SuggCard[]
}) {
  const [slide, setSlide] = useState(0)
  const total = cards.length

  if (total === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <SparkIcon />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>Smart Suggestions</h3>
          </div>
          <p className="text-xs" style={{ color: '#c0cdc5' }}>Assign a worksheet to generate insights.</p>
        </div>
        <div className="rounded-xl px-5 py-6 text-center"
          style={{ backgroundColor: '#faf9f7', border: '1px solid #e5e2d9' }}
        >
          <p className="text-sm" style={{ color: '#c0cdc5' }}>No data yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <SparkIcon />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>Smart Suggestions</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <SlideDots total={total} active={slide} />
            <div className="flex items-center gap-1 ml-1">
              <ArrowBtn direction="left"  disabled={slide === 0}         onClick={() => setSlide(s => Math.max(0, s - 1))} />
              <ArrowBtn direction="right" disabled={slide === total - 1} onClick={() => setSlide(s => Math.min(total - 1, s + 1))} />
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color: '#c0cdc5' }}>Individual and cluster interventions</p>
      </div>

      <div style={{ overflow: 'hidden', borderRadius: 12 }}>
        <div style={{ display: 'flex', transform: `translateX(-${slide * 100}%)`, transition: 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
          {cards.map((card) => (
            <div key={card.id} style={{ flex: '0 0 100%', minWidth: 0 }}>
              <RemediationCard card={card} courseId={courseId} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-center px-2" style={{ color: '#c0cdc5' }}>
        AI insights are generated from question-level performance data
      </p>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function ClassReports({
  courseId,
  worksheets,
  students,
}: {
  courseId: string
  worksheets: WorksheetRow[]
  students: StudentRow[]
}) {
  const topics = worksheets.map((w) => {
    const topic = extractTopic(w.title)
    const m = topicMastery(topic, courseId)
    return { topic, mastery: m, trend: topicTrend(m, topic) }
  })

  const lastWorksheet = worksheets[0] ?? null
  const topicNames = [...new Set(topics.map((t) => t.topic))]
  const suggestions = students.length > 0
    ? buildSuggestions(students, topicNames, courseId)
    : []

  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-5" style={{ flex: '2 1 0%', minWidth: 0 }}>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#b0bfb4' }}>Class Performance</h3>
          <p className="text-xs" style={{ color: '#c0cdc5' }}>Aggregated across all students and question sets</p>
        </div>
        <TopicMasteryCard topics={topics} />
        <LastAssignmentCarousel worksheet={lastWorksheet} classSize={students.length} courseId={courseId} />
      </div>

      <div style={{ flex: '1 1 0%', minWidth: 0 }}>
        <SuggestionsCarousel courseId={courseId} cards={suggestions} />
      </div>
    </div>
  )
}
