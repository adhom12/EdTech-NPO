'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Mock data ─────────────────────────────────────────────────────────────────

const TOPIC_MASTERY = [
  { topic: 'Linear Equations',       mastery: 82, trend: 'up'     },
  { topic: 'Quadratic Graphs',       mastery: 61, trend: 'stable' },
  { topic: 'Probability',            mastery: 48, trend: 'down'   },
  { topic: 'Trigonometry',           mastery: 75, trend: 'up'     },
  { topic: 'Algebraic Fractions',    mastery: 34, trend: 'down'   },
  { topic: 'Simultaneous Equations', mastery: 69, trend: 'stable' },
]

const ASSIGNMENT_REPORT = {
  title: 'Algebra Fundamentals',
  topic: 'Algebraic Isolation',
  flaggedQuestion: 4,
  failureRate: 85,
  completionRate: 78,
  studentsCompleted: 18,
  classSize: 23,
  avgScore: 52,
  errorTag: 'Algebraic Isolation',
  detail:
    'Students are incorrectly applying inverse operations when rearranging equations — specifically, failing to apply the same operation to both sides consistently.',
}

const REMEDIATION_CARDS = [
  {
    id: 'r1',
    type: 'individual' as const,
    label: 'Uyi O.',
    topic: 'Fractions',
    insight:
      'Struggling with fraction accuracy — 3 consecutive low scores on fraction-based questions across recent question sets.',
    action: 'Generate Revision Set',
    severity: 'high' as const,
  },
  {
    id: 'r2',
    type: 'cluster' as const,
    label: '3 students',
    topic: 'Geometry',
    insight:
      'Conceptual gaps in Geometry flagged — consistent confusion between area and perimeter formulas across assessed work.',
    action: 'Create Group Assignment',
    severity: 'medium' as const,
  },
  {
    id: 'r3',
    type: 'individual' as const,
    label: 'Marcus T.',
    topic: 'Word Problems',
    insight:
      'Strong in core Algebra but underperforming on applied word problems — possible difficulty parsing mathematical language.',
    action: 'Generate Revision Set',
    severity: 'medium' as const,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function masteryColor(pct: number) {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#d97706'
  return '#dc2626'
}

function masteryLabel(pct: number) {
  if (pct >= 75) return { text: 'Strong',     color: '#16a34a' }
  if (pct >= 50) return { text: 'Developing', color: '#d97706' }
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
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.93 2.93l1.42 1.42M8.65 8.65l1.42 1.42M2.93 10.07l1.42-1.42M8.65 4.35l1.42-1.42" stroke="#7C3AED" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6.5" cy="6.5" r="1.8" fill="#7C3AED" />
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
        {direction === 'left'
          ? <path d="M6.5 2L3.5 5l3 3" />
          : <path d="M3.5 2L6.5 5l-3 3" />}
      </svg>
    </button>
  )
}

function SlideDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            height: 5,
            width: i === active ? 14 : 5,
            backgroundColor: i === active ? '#e8753b' : '#e5e2d9',
          }}
        />
      ))}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(71,87,77,0.1)',
        boxShadow: '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)',
      }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, badge, right }: { title: string; badge?: string; right?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ backgroundColor: '#faf9f7', borderBottom: '1px solid #e5e2d9' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>
        {title}
      </h3>
      {right ?? (badge && (
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
        >
          {badge}
        </span>
      ))}
    </div>
  )
}

function TopicMasteryCard() {
  return (
    <SectionCard>
      <CardHeader title="Recently Assigned Topics" badge="Class performance" />
      <div className="px-5 py-4 flex flex-col gap-4">
        {TOPIC_MASTERY.map(({ topic, mastery, trend }) => {
          const color = masteryColor(mastery)
          const lbl   = masteryLabel(mastery)
          return (
            <div key={topic}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={trend as 'up' | 'down' | 'stable'} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: mastery < 50 ? '#dc2626' : '#47574d' }}
                  >
                    {topic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: lbl.color }}>
                    {lbl.text}
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>
                    {mastery}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0ede6' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${mastery}%`, backgroundColor: color, opacity: 0.75 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

function LastAssignmentCarousel() {
  const [slide, setSlide] = useState(0)
  const r = ASSIGNMENT_REPORT

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: '1px solid rgba(217,119,6,0.25)',
        backgroundColor: 'rgba(217,119,6,0.03)',
        boxShadow: '0 1px 3px rgba(71,87,77,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(217,119,6,0.15)', backgroundColor: 'rgba(217,119,6,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="#d97706" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6.5 5.5v3" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="6.5" cy="10" r="0.6" fill="#d97706"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#d97706' }}>
            Last Assignment Report
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SlideDots total={2} active={slide} />
          <div className="flex items-center gap-1 ml-1">
            <ArrowBtn direction="left"  disabled={slide === 0} onClick={() => setSlide(0)} />
            <ArrowBtn direction="right" disabled={slide === 1} onClick={() => setSlide(1)} />
          </div>
        </div>
      </div>

      {/* Slides */}
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${slide * 100}%)`,
            transition: 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Slide 1 — Stats */}
          <div style={{ flex: '0 0 100%', minWidth: 0 }} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#47574d' }}>{r.title}</p>
                <p className="text-xs" style={{ color: '#8a9a8f' }}>Topic: {r.topic}</p>
              </div>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.22)' }}
              >
                {r.failureRate}% failure rate
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Completed', value: `${r.completionRate}%`,     sub: `${r.studentsCompleted}/${r.classSize} students` },
                { label: 'Avg Score', value: `${r.avgScore}%`,           sub: 'class average' },
                { label: 'Flagged',   value: `Q${r.flaggedQuestion}`,    sub: r.errorTag },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
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
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#dc2626' }}>
                ⚑ Red Flag
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#6b7b70' }}>
              <span className="font-semibold" style={{ color: '#47574d' }}>{r.failureRate}%</span> of students
              failed <span className="font-medium" style={{ color: '#d97706' }}>Question {r.flaggedQuestion}</span> on{' '}
              <span className="font-medium" style={{ color: '#47574d' }}>{r.title}</span>.{' '}
              {r.detail}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: '#d97706', border: '1px solid rgba(217,119,6,0.18)' }}
              >
                ⚠ {r.errorTag}
              </span>
              <span className="text-xs" style={{ color: '#b0bfb4' }}>
                · {r.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RemediationCard({
  card,
  courseId,
}: {
  card: typeof REMEDIATION_CARDS[0]
  courseId: string
}) {
  const isHigh = card.severity === 'high'
  const accentColor = isHigh ? '#dc2626' : '#d97706'
  const isIndividual = card.type === 'individual'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(71,87,77,0.08)',
        boxShadow: '0 1px 3px rgba(71,87,77,0.06)',
      }}
    >
      <div className="flex">
        <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: accentColor, opacity: 0.7 }} />
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            {isIndividual ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#f0ede6', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                {card.label.charAt(0)}
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
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
              <span
                className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
              >
                {card.topic}
              </span>
            </div>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}66` }}
            />
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: '#8a9a8f' }}>
            {card.insight}
          </p>

          <Link
            href={`/workspace/new?course_id=${courseId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-85"
            style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <SparkIcon />
            {card.action}
          </Link>
        </div>
      </div>
    </div>
  )
}

function SuggestionsCarousel({ courseId }: { courseId: string }) {
  const [slide, setSlide] = useState(0)
  const total = REMEDIATION_CARDS.length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <SparkIcon />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>
              Smart Suggestions
            </h3>
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
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${slide * 100}%)`,
            transition: 'transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {REMEDIATION_CARDS.map((card) => (
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

export function ClassReports({ courseId }: { courseId: string }) {
  return (
    <div className="flex gap-6 items-start">

      {/* ── Left column: Class Performance (2/3) ── */}
      <div className="flex flex-col gap-5" style={{ flex: '2 1 0%', minWidth: 0 }}>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#b0bfb4' }}>
            Class Performance
          </h3>
          <p className="text-xs" style={{ color: '#c0cdc5' }}>Aggregated across all students and question sets</p>
        </div>

        <TopicMasteryCard />
        <LastAssignmentCarousel />
      </div>

      {/* ── Right column: Smart Suggestions (1/3) ── */}
      <div style={{ flex: '1 1 0%', minWidth: 0 }}>
        <SuggestionsCarousel courseId={courseId} />
      </div>

    </div>
  )
}
