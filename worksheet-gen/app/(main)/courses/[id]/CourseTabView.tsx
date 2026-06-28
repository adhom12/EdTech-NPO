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
    <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#1A242C', border: '1px solid #25333E' }}>
      <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: '#F8FAFC' }}>{value}</p>
      <p className="text-sm" style={{ color: '#94A3B8' }}>{label}</p>
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
      className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex-shrink-0"
      style={{ backgroundColor: '#06B6D4', transition: 'background-color 150ms ease' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0891B2' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#06B6D4' }}
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
      <div className="flex gap-7 mb-8 text-sm" style={{ borderBottom: '1px solid #25333E' }}>
        {(['overview', 'students', 'reports'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            style={{
              background: 'none',
              cursor: 'pointer',
              color: activeTab === t ? '#F8FAFC' : '#94A3B8',
              borderBottom: `2px solid ${activeTab === t ? '#06B6D4' : 'transparent'}`,
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

      {/* ── Animated content — key changes on every tab switch to replay animation ── */}
      <div key={contentKey} className="animate-tab-content">

        {/* ── Hero banner — overview only ── */}
        {activeTab === 'overview' && (
          <div
            className="rounded-2xl px-8 py-8 mb-6"
            style={{
              background: 'radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.12) 0%, transparent 55%), linear-gradient(155deg, #0F1E26 0%, #121B22 50%, #0E1317 100%)',
              border: '1px solid rgba(6,182,212,0.18)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(6,182,212,0.12)',
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Link href="/courses" className="transition-colors hover:text-white" style={{ color: '#94A3B8' }}>
                    Classes
                  </Link>
                  <span style={{ color: '#25333E' }}>/</span>
                  <span style={{ color: '#F8FAFC' }}>{course.label}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#F8FAFC' }}>{course.label}</h1>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
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
                <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#1A242C', border: '1px solid #25333E' }}>
                  <p className="text-xs font-medium mb-1.5" style={{ color: '#64748B' }}>Syllabus</p>
                  <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: '#F8FAFC' }}>{course.syllabus_code}</p>
                  {syllabusLabel && <p className="text-xs" style={{ color: '#94A3B8' }}>{syllabusLabel}</p>}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <section className="mb-8">
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #25333E', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
                  <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: '#141B21', borderBottom: '1px solid #25333E' }}>
                    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748B' }}>Activity Stream</h2>
                    {events.length > 0 && (
                      <span className="text-xs tabular-nums" style={{ color: '#4B5563' }}>
                        {events.length} event{events.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div style={{ maxHeight: 320, overflowY: 'auto', backgroundColor: '#1A242C' }}>
                      {events.length === 0 ? (
                        <p className="px-5 py-6 text-sm" style={{ color: '#64748B' }}>
                          No activity yet — generate a question set to get started.
                        </p>
                      ) : (
                        events.map((ev, idx) => {
                          let payload: Record<string, unknown> = {}
                          try { payload = ev.payload } catch {}
                          const isGenerated = ev.event_type === 'worksheet_generated'
                          return (
                            <div key={idx} className="flex items-center justify-between px-5 py-4" style={{ borderTop: idx === 0 ? 'none' : '1px solid #1A2832' }}>
                              <div className="flex items-center gap-3">
                                <div
                                  className="rounded-full flex-shrink-0"
                                  style={{ width: 7, height: 7, backgroundColor: isGenerated ? '#06B6D4' : '#F28B82', boxShadow: isGenerated ? '0 0 7px rgba(6,182,212,0.55)' : '0 0 7px rgba(242,139,130,0.55)' }}
                                />
                                <span className="text-sm" style={{ color: '#F8FAFC' }}>{formatEventLabel(ev.event_type, payload)}</span>
                              </div>
                              <span className="text-xs flex-shrink-0 ml-4" style={{ color: '#94A3B8' }}>{formatRelative(ev.created_at)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {events.length > 5 && (
                      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 52, background: 'linear-gradient(to bottom, transparent, #1A242C)' }} />
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
                        <Link href={createHref} className="group block rounded-xl p-5 transition-all duration-150 hover:border-[#06B6D4]" style={{ border: '1.5px dashed #25333E' }}>
                          <div className="h-full flex flex-col items-center justify-center gap-2.5" style={{ minHeight: 80 }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#25333E]" style={{ backgroundColor: '#141B21' }}>
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#4B5563' }}>
                                <path d="M7 2v10M2 7h10" />
                              </svg>
                            </div>
                            <span className="text-xs transition-colors group-hover:text-[#94A3B8]" style={{ color: '#4B5563' }}>Create another set</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl p-10 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(6,182,212,0.05)', border: '1px dashed rgba(6,182,212,0.2)' }}>
                    <p className="text-sm mb-5" style={{ color: '#94A3B8' }}>No question sets yet for this course.</p>
                    {suggestedTopics.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                        {suggestedTopics.map((topic) => (
                          <span key={topic} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#1A242C', border: '1px solid #25333E', color: '#94A3B8' }}>{topic}</span>
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
            <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid #25333E', boxShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
              <div className="grid px-5 py-3" style={{ gridTemplateColumns: '1fr 9rem 5rem', backgroundColor: '#141B21', borderBottom: '1px solid #25333E' }}>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Student Name</span>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Student ID</span>
                <span />
              </div>
              {students.length === 0 ? (
                <p className="px-5 py-6 text-sm" style={{ color: '#64748B', backgroundColor: '#1A242C' }}>No students added yet.</p>
              ) : (
                students.map((s, idx) => {
                  const removeAction = removeStudent.bind(null, s.id, courseId)
                  return (
                    <div key={s.id} className="grid items-center px-5 py-4" style={{ gridTemplateColumns: '1fr 9rem 5rem', borderTop: idx === 0 ? 'none' : '1px solid #1A2832', backgroundColor: '#1A242C' }}>
                      <span className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{s.student_name}</span>
                      <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>{s.student_identifier ?? '—'}</span>
                      <div className="flex justify-end">
                        <form action={removeAction}>
                          <button type="submit" className="text-xs font-medium transition-colors hover:text-red-300" style={{ color: '#E05C5C' }}>Remove</button>
                        </form>
                      </div>
                    </div>
                  )
                })
              )}
              {students.length > 0 && (
                <div className="px-5 py-2.5" style={{ backgroundColor: '#141B21', borderTop: '1px solid #25333E' }}>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{students.length} {students.length === 1 ? 'student' : 'students'} enrolled</span>
                </div>
              )}
            </div>

            <div className="rounded-xl px-5 py-5" style={{ backgroundColor: '#1A242C', border: '1px solid #25333E' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>Quick Add Student</p>
              <form action={addStudent} className="flex items-center gap-3">
                <input type="hidden" name="course_id" value={courseId} />
                <input type="text" name="student_name" placeholder="Full name" required className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[#4B5563]" style={{ backgroundColor: '#0E1317', border: '1px solid #25333E', color: '#F8FAFC' }} />
                <input type="text" name="student_identifier" placeholder="Student ID (optional)" className="px-3 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[#4B5563]" style={{ width: 176, flexShrink: 0, backgroundColor: '#0E1317', border: '1px solid #25333E', color: '#F8FAFC' }} />
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#06B6D4' }}>Add</button>
              </form>
            </div>
          </div>
        )}

        {/* ── Reports tab — pre-rendered server node passed as prop ── */}
        {activeTab === 'reports' && reportsNode}

      </div>
    </div>
  )
}
