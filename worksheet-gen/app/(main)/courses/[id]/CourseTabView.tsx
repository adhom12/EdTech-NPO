'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addStudent, removeStudent } from '@/app/actions/students'
import { WorksheetCard } from '@/components/WorksheetCard'
import { SortControls } from '@/components/SortControls'
import type { Worksheet } from '@/components/WorksheetCard'

type Tab = 'overview' | 'students' | 'reports'

interface CourseData {
  label: string
  subject: string
  board: string | null
  qualification: string | null
  syllabus_code: string | null
}

interface Student {
  id: string
  student_name: string
  student_identifier: string | null
}

interface CourseEvent {
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

interface Props {
  courseId: string
  initialTab: Tab
  course: CourseData
  sortedWorksheets: Worksheet[]
  students: Student[]
  events: CourseEvent[]
  suggestedTopics: string[]
  sort: string
  reportsNode: React.ReactNode
}

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
  if (eventType === 'worksheet_assigned') {
    const title = payload.title as string | undefined
    return title ? `${title} was assigned to the class` : 'Worksheet assigned to class'
  }
  if (eventType === 'worksheet_generated') {
    const count = payload.count as number | undefined
    const difficulty = payload.difficulty as string | undefined
    const parts = ['Question set generated']
    if (count) parts.push(`${count} questions`)
    if (difficulty) parts.push(difficulty)
    return parts.join(' · ')
  }
  if (eventType === 'question_flagged') return 'Question flagged for review'
  return eventType.replace(/_/g, ' ')
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(71,87,77,0.08)',
        boxShadow: '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)',
      }}
    >
      <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: '#47574d' }}>{value}</p>
      <p className="text-sm" style={{ color: '#8a9a8f' }}>{label}</p>
    </div>
  )
}

export function CourseTabView({
  courseId, initialTab, course, sortedWorksheets, students, events, suggestedTopics, sort, reportsNode,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [contentKey, setContentKey] = useState(0)

  const syllabusLabel = course.board ? `${course.board} ${course.qualification}` : ''
  const createHref = `/workspace/new?course_id=${courseId}`

  function switchTab(tab: Tab) {
    if (tab === activeTab) return
    setActiveTab(tab)
    setContentKey((k) => k + 1)
    const url = tab === 'overview' ? `/courses/${courseId}` : `/courses/${courseId}?tab=${tab}`
    window.history.replaceState(null, '', url)
  }

  const CreateBtn = () => (
    <Link
      href={createHref}
      className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex-shrink-0 transition-all duration-200 ease-in-out"
      style={{ backgroundColor: '#e8753b' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#d4622a' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#e8753b' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 2v10M2 7h10" />
      </svg>
      Create new question set
    </Link>
  )

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8">

      {/* ── Tab navigation ── */}
      <div className="flex gap-7 mb-8 text-sm" style={{ borderBottom: '1px solid #e5e2d9' }}>
        {(['overview', 'students', 'reports'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            style={{
              background: 'none',
              cursor: 'pointer',
              color: activeTab === t ? '#47574d' : '#b0bfb4',
              borderBottom: `2px solid ${activeTab === t ? '#e8753b' : 'transparent'}`,
              paddingBottom: '12px',
              fontWeight: activeTab === t ? 600 : 400,
              letterSpacing: activeTab === t ? '-0.01em' : 'normal',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Animated content ── */}
      <div key={contentKey} className="animate-tab-content">

        {/* ── Hero banner — overview only ── */}
        {activeTab === 'overview' && (
          <div
            className="rounded-2xl px-8 py-8 mb-6"
            style={{
              background: 'radial-gradient(ellipse at 5% 0%, rgba(232,117,59,0.1) 0%, transparent 60%), linear-gradient(155deg, #faf9f7 0%, #f7f5f0 50%, #f4f1eb 100%)',
              border: '1px solid rgba(232,117,59,0.18)',
              boxShadow: '0 4px 24px rgba(71,87,77,0.08), 0 1px 4px rgba(71,87,77,0.04)',
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Link href="/courses" className="transition-colors hover:text-[#47574d]" style={{ color: '#b0bfb4' }}>
                    Classes
                  </Link>
                  <span style={{ color: '#d5d2c8' }}>/</span>
                  <span style={{ color: '#47574d' }}>{course.label}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#47574d' }}>{course.label}</h1>
                <p className="text-sm" style={{ color: '#8a9a8f' }}>
                  {syllabusLabel} · {course.subject}
                </p>
              </div>
              <CreateBtn />
            </div>
          </div>
        )}

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div className="flex gap-8 items-start">
            <div className="flex flex-col gap-3" style={{ width: 220, flexShrink: 0 }}>
              <StatCard value={sortedWorksheets.length} label={sortedWorksheets.length === 1 ? 'question set' : 'question sets'} />
              <StatCard value={students.length} label={students.length === 1 ? 'student' : 'students'} />
              {course.syllabus_code && (
                <div
                  className="rounded-xl px-5 py-4"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(71,87,77,0.08)',
                    boxShadow: '0 1px 3px rgba(71,87,77,0.08)',
                  }}
                >
                  <p className="text-xs font-medium mb-1.5" style={{ color: '#b0bfb4' }}>Syllabus</p>
                  <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: '#47574d' }}>{course.syllabus_code}</p>
                  {syllabusLabel && <p className="text-xs" style={{ color: '#8a9a8f' }}>{syllabusLabel}</p>}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <section className="mb-8">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: '1px solid rgba(71,87,77,0.1)',
                    boxShadow: '0 1px 3px rgba(71,87,77,0.08)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ backgroundColor: '#faf9f7', borderBottom: '1px solid #e5e2d9' }}
                  >
                    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>Activity Stream</h2>
                    {events.length > 0 && (
                      <span className="text-xs tabular-nums" style={{ color: '#c0cdc5' }}>
                        {events.length} event{events.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div style={{ maxHeight: 320, overflowY: 'auto', backgroundColor: '#ffffff' }}>
                      {events.length === 0 ? (
                        <p className="px-5 py-6 text-sm" style={{ color: '#b0bfb4' }}>
                          No activity yet — generate a question set to get started.
                        </p>
                      ) : (
                        events.map((ev, idx) => {
                          let payload: Record<string, unknown> = {}
                          try { payload = ev.payload } catch {}
                          const dotColor = ev.event_type === 'worksheet_assigned' || ev.event_type === 'worksheet_generated'
                            ? '#e8753b' : '#dc2626'
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between px-5 py-4 transition-colors"
                              style={{ borderTop: idx === 0 ? 'none' : '1px solid #f0ede6' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f3ef' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="rounded-full flex-shrink-0"
                                  style={{
                                    width: 7, height: 7,
                                    backgroundColor: dotColor,
                                    boxShadow: `0 0 7px ${dotColor}80`,
                                  }}
                                />
                                <span className="text-sm" style={{ color: '#47574d' }}>{formatEventLabel(ev.event_type, payload)}</span>
                              </div>
                              <span className="text-xs flex-shrink-0 ml-4" style={{ color: '#b0bfb4' }}>{formatRelative(ev.created_at)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {events.length > 5 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 pointer-events-none"
                        style={{ height: 52, background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
                      />
                    )}
                  </div>
                </div>
              </section>

              <section>
                {sortedWorksheets.length > 0 ? (
                  <>
                    <SortControls count={sortedWorksheets.length} currentSort={sort} />
                    <div className="grid grid-cols-2 gap-4">
                      {sortedWorksheets.map((ws) => <WorksheetCard key={ws.id} worksheet={ws} />)}
                      {sortedWorksheets.length === 1 && (
                        <Link
                          href={createHref}
                          className="group block rounded-xl p-5 transition-all duration-200 ease-in-out"
                          style={{ border: '1.5px dashed rgba(71,87,77,0.18)' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8753b'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#fdf0e9' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(71,87,77,0.18)'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent' }}
                        >
                          <div className="h-full flex flex-col items-center justify-center gap-2.5" style={{ minHeight: 80 }}>
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#f0ede6' }}
                            >
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#b0bfb4' }}>
                                <path d="M7 2v10M2 7h10" />
                              </svg>
                            </div>
                            <span className="text-xs" style={{ color: '#b0bfb4' }}>Create another set</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    className="rounded-2xl p-10 flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#fdf0e9', border: '1px dashed rgba(232,117,59,0.3)' }}
                  >
                    <p className="text-sm mb-5" style={{ color: '#8a9a8f' }}>No question sets yet for this course.</p>
                    {suggestedTopics.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                        {suggestedTopics.map((topic) => (
                          <span
                            key={topic}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{ backgroundColor: '#ffffff', border: '1px solid rgba(71,87,77,0.12)', color: '#8a9a8f' }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    <CreateBtn />
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ── Students tab ── */}
        {activeTab === 'students' && (
          <div>
            <div
              className="rounded-xl overflow-hidden mb-5"
              style={{
                border: '1px solid rgba(71,87,77,0.1)',
                boxShadow: '0 1px 3px rgba(71,87,77,0.08)',
              }}
            >
              <div
                className="grid px-5 py-3"
                style={{ gridTemplateColumns: '1fr 9rem 5rem', backgroundColor: '#faf9f7', borderBottom: '1px solid #e5e2d9' }}
              >
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>Student Name</span>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b0bfb4' }}>Student ID</span>
                <span />
              </div>
              {students.length === 0 ? (
                <p className="px-5 py-6 text-sm" style={{ color: '#b0bfb4', backgroundColor: '#ffffff' }}>No students added yet.</p>
              ) : (
                students.map((s, idx) => {
                  const removeAction = removeStudent.bind(null, s.id, courseId)
                  return (
                    <div
                      key={s.id}
                      className="grid items-center px-5 py-4 transition-colors"
                      style={{
                        gridTemplateColumns: '1fr 9rem 5rem',
                        borderTop: idx === 0 ? 'none' : '1px solid #f0ede6',
                        backgroundColor: '#ffffff',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f3ef' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#ffffff' }}
                    >
                      <span className="text-sm font-medium" style={{ color: '#47574d' }}>{s.student_name}</span>
                      <span className="text-xs font-mono" style={{ color: '#8a9a8f' }}>{s.student_identifier ?? '—'}</span>
                      <div className="flex justify-end">
                        <form action={removeAction}>
                          <button
                            type="submit"
                            className="text-xs font-medium transition-colors hover:text-[#dc2626]"
                            style={{ color: '#f87171' }}
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })
              )}
              {students.length > 0 && (
                <div className="px-5 py-2.5" style={{ backgroundColor: '#faf9f7', borderTop: '1px solid #e5e2d9' }}>
                  <span className="text-xs" style={{ color: '#b0bfb4' }}>{students.length} {students.length === 1 ? 'student' : 'students'} enrolled</span>
                </div>
              )}
            </div>

            <div
              className="rounded-xl px-5 py-5"
              style={{
                backgroundColor: '#faf9f7',
                border: '1px solid rgba(71,87,77,0.1)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#b0bfb4' }}>Quick Add Student</p>
              <form action={addStudent} className="flex items-center gap-3">
                <input type="hidden" name="course_id" value={courseId} />
                <input
                  type="text"
                  name="student_name"
                  placeholder="Full name"
                  required
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all duration-200"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2d9', color: '#47574d' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e8753b')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e2d9')}
                />
                <input
                  type="text"
                  name="student_identifier"
                  placeholder="Student ID (optional)"
                  className="px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all duration-200"
                  style={{ width: 176, flexShrink: 0, backgroundColor: '#ffffff', border: '1px solid #e5e2d9', color: '#47574d' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#e8753b')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e2d9')}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all duration-200 ease-in-out hover:opacity-90"
                  style={{ backgroundColor: '#e8753b' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4622a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e8753b' }}
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Reports tab ── */}
        {activeTab === 'reports' && reportsNode}

      </div>
    </div>
  )
}
