import Link from 'next/link'

// ── Mock data ─────────────────────────────────────────────────────────────────
// Replace with live DB/analytics queries when available.

const TOPIC_MASTERY = [
  { topic: 'Linear Equations',       mastery: 82, trend: 'up'     },
  { topic: 'Quadratic Graphs',       mastery: 61, trend: 'stable' },
  { topic: 'Probability',            mastery: 48, trend: 'down'   },
  { topic: 'Trigonometry',           mastery: 75, trend: 'up'     },
  { topic: 'Algebraic Fractions',    mastery: 34, trend: 'down'   },
  { topic: 'Simultaneous Equations', mastery: 69, trend: 'stable' },
]

const SYSTEMIC_ALERT = {
  worksheetTitle: 'Algebra Fundamentals',
  questionNumber: 4,
  failureRate: 85,
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
  if (pct >= 75) return { text: 'Strong',    color: '#4ADE80' }
  if (pct >= 50) return { text: 'Developing', color: '#FBBF24' }
  return             { text: 'Needs work',  color: '#F87171' }
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: 'rgba(22,25,31,0.8)', border: '1px solid #252830' }}
    >
      {children}
    </div>
  )
}

function CardHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ backgroundColor: '#1C1F27', borderBottom: '1px solid #252830' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
        {title}
      </h3>
      {badge && (
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#1A1D28', color: '#818CF8', border: '1px solid #2E3060' }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

function TopicMasteryCard() {
  return (
    <SectionCard>
      <CardHeader title="Topic Mastery" badge="Mock data" />
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
              {/* Progress track */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1E2126' }}>
                <div
                  className="h-full rounded-full transition-all"
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

function SystemicAlertCard() {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        backgroundColor: 'rgba(251,191,36,0.05)',
        border: '1px solid rgba(251,191,36,0.18)',
      }}
    >
      {/* Alert header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" stroke="#FBBF24" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6.5 5.5v3" stroke="#FBBF24" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="6.5" cy="10" r="0.6" fill="#FBBF24"/>
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FBBF24' }}>
          Class Anomaly Detected
        </span>
        <span
          className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          {SYSTEMIC_ALERT.failureRate}% failure rate
        </span>
      </div>

      {/* Alert body */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: '#C8CDD6' }}>
        <span className="font-semibold text-white">{SYSTEMIC_ALERT.failureRate}%</span> of students
        failed <span className="font-medium" style={{ color: '#FDE68A' }}>Question {SYSTEMIC_ALERT.questionNumber}</span> on{' '}
        <span className="font-medium text-white">{SYSTEMIC_ALERT.worksheetTitle}</span>.{' '}
        {SYSTEMIC_ALERT.detail}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-lg font-medium"
          style={{ backgroundColor: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          ⚠ {SYSTEMIC_ALERT.errorTag}
        </span>
        <span className="text-xs" style={{ color: '#4B5563' }}>
          · {SYSTEMIC_ALERT.worksheetTitle}
        </span>
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
      style={{ backgroundColor: '#16191F', border: '1px solid #252830' }}
    >
      {/* Left accent strip + content */}
      <div className="flex">
        <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: accentColor, opacity: 0.6 }} />
        <div className="flex-1 px-4 py-4">
          {/* Student / cluster label */}
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
                style={{ backgroundColor: '#1A1D24', color: '#5A6070', border: '1px solid #252830' }}
              >
                {card.topic}
              </span>
            </div>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 5px ${accentColor}88`,
              }}
            />
          </div>

          {/* Insight text */}
          <p className="text-xs leading-relaxed mb-3" style={{ color: '#8B909A' }}>
            {card.insight}
          </p>

          {/* CTA */}
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

// ── Main export ────────────────────────────────────────────────────────────────

export function ClassReports({ courseId }: { courseId: string }) {
  return (
    <div className="flex gap-6 items-start">

      {/* ── Left column: Class Diagnostics (2/3) ── */}
      <div className="flex flex-col gap-5" style={{ flex: '2 1 0%', minWidth: 0 }}>

        {/* Section label */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#4B5563' }}>
            Class Diagnostics
          </h3>
          <p className="text-xs" style={{ color: '#3D4350' }}>Aggregated across all students and question sets</p>
        </div>

        <TopicMasteryCard />
        <SystemicAlertCard />
      </div>

      {/* ── Right column: AI Action Feed (1/3) ── */}
      <div className="flex flex-col gap-4" style={{ flex: '1 1 0%', minWidth: 0 }}>

        {/* Section label */}
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <SparkIcon />
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4B5563' }}>
              AI Action Feed
            </h3>
          </div>
          <p className="text-xs" style={{ color: '#3D4350' }}>Individual and cluster interventions</p>
        </div>

        {REMEDIATION_CARDS.map((card) => (
          <RemediationCard key={card.id} card={card} courseId={courseId} />
        ))}

        {/* Footer note */}
        <p className="text-[11px] text-center px-2" style={{ color: '#2E3340' }}>
          AI insights are generated from question-level performance data
        </p>
      </div>

    </div>
  )
}
