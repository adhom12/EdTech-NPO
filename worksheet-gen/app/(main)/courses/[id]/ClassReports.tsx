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
  if (pct >= 75) return '#4ADE80'
  if (pct >= 50) return '#FBBF24'
  return '#F87171'
}

function masteryLabel(pct: number) {
  if (pct >= 75) return { text: 'Strong',      color: '#4ADE80' }
  if (pct >= 50) return { text: 'Developing',  color: '#FBBF24' }
  return             { text: 'Needs work',   color: '#F87171' }
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9l4-5 4 5" /></svg>
  if (trend === 'down')
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3l4 5 4-5" /></svg>
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8" /></svg>
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.93 2.93l1.42 1.42M8.65 8.65l1.42 1.42M2.93 10.07l1.42-1.42M8.65 4.35l1.42-1.42" stroke="#A5B4FC" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6.5" cy="6.5" r="1.8" fill="#818CF8" />
    </svg>
  )
}

function ArrowBtn({ onClick, disabled, direction }: { onClick: () => void; disabled: boolean; direction: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
      style={{
        backgroundColor: 'transparent',
        color: disabled ? '#2A3540' : '#64748B',
        border: '1px solid',
        borderColor: disabled ? '#1A2832' : '#25333E',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.backgroundColor = '#25333E'; e.currentTarget.style.color = '#94A3B8' } }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = disabled ? '#2A3540' : '#64748B' }}
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
            backgroundColor: i === active ? '#06B6D4' : '#25333E',
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
      style={{ backgroundColor: '#1A242C', border: '1px solid #25333E' }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, badge, right }: { title: string; badge?: string; right?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ backgroundColor: '#141B21', borderBottom: '1px solid #25333E' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
        {title}
      </h3>
      {right ?? (badge && (
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#1A242C', color: '#64748B', border: '1px solid #25333E' }}
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
                    style={{ color: mastery < 50 ? '#FCA5A5' : '#C8CDD6' }}
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
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#141B21' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${mastery}%`, backgroundColor: color, opacity: 0.85 }}
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
      style={{ border: '1px solid rgba(251,191,36,0.22)', backgroundColor: 'rgba(251,191,36,0.04)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(251,191,36,0.14)', backgroundColor: 'rgba(251,191,36,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="#FBBF24" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6.5 5.5v3" stroke="#FBBF24" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="6.5" cy="10" r="0.6" fill="#FBBF24"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FBBF24' }}>
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
          {/* Slide 1 — General stats */}
          <div style={{ flex: '0 0 100%', minWidth: 0 }} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{r.title}</p>
                <p className="text-xs" style={{ color: '#78716C' }}>Topic: {r.topic}</p>
              </div>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                {r.failureRate}% failure rate
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Completed', value: `${r.completionRate}%`, sub: `${r.studentsCompleted}/${r.classSize} students` },
                { label: 'Avg Score',  value: `${r.avgScore}%`,      sub: 'class average' },
                { label: 'Flagged',    value: `Q${r.flaggedQuestion}`, sub: r.errorTag },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
                  style={{ backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}
                >
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: '#78716C' }}>{label}</span>
                  <span className="text-base font-bold tabular-nums" style={{ color: '#FDE68A' }}>{value}</span>
                  <span className="text-[10px] truncate" style={{ color: '#57534E' }}>{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide 2 — Red Flag */}
          <div style={{ flex: '0 0 100%', minWidth: 0 }} className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F87171' }}>
                ⚑ Red Flag
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#C8CDD6' }}>
              <span className="font-semibold text-white">{r.failureRate}%</span> of students
              failed <span className="font-medium" style={{ color: '#FDE68A' }}>Question {r.flaggedQuestion}</span> on{' '}
              <span className="font-medium text-white">{r.title}</span>.{' '}
              {r.detail}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ backgroundColor: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}
              >
                ⚠ {r.errorTag}
              </span>
              <span className="text-xs" style={{ color: '#44403C' }}>
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
  const accentColor = isHigh ? '#F87171' : '#FBBF24'
  const isIndividual = card.type === 'individual'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1A242C', border: '1px solid #25333E' }}
    >
      <div className="flex">
        <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: accentColor, opacity: 0.6 }} />
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            {isIndividual ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#1E2240', color: '#818CF8', border: '1px solid #2E3060' }}
              >
                {card.label.charAt(0)}
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#1E2A1A', border: '1px solid #2A3D25' }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#4ADE80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="4.5" r="2" /><circle cx="9" cy="5" r="1.5" />
                  <path d="M1 11c0-2.2 1.8-4 4-4s4 1.8 4 4" /><path d="M9 7c1.7 0 3 1.3 3 3" />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <span className="text-sm font-semibold text-white">{card.label}</span>
              <span
                className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#1A242C', color: '#4B5563', border: '1px solid #25333E' }}
              >
                {card.topic}
              </span>
            </div>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}88` }}
            />
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: '#94A3B8' }}>
            {card.insight}
          </p>

          <Link
            href={`/workspace/new?course_id=${courseId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-85"
            style={{ backgroundColor: '#1E2240', color: '#A5B4FC', border: '1px solid #2E3060' }}
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
      {/* Section label + arrows */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <SparkIcon />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4B5563' }}>
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
        <p className="text-xs" style={{ color: '#3D4350' }}>Individual and cluster interventions</p>
      </div>

      {/* Carousel */}
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

      <p className="text-[11px] text-center px-2" style={{ color: '#2E3340' }}>
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
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4B5563' }}>
            Class Performance
          </h3>
          <p className="text-xs" style={{ color: '#3D4350' }}>Aggregated across all students and question sets</p>
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
