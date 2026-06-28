'use client'

import { useState } from 'react'
import Link from 'next/link'

export type WorksheetDoc = {
  id: string
  title: string
  courseId: string
  courseLabel: string
  subject: string
  board: string | null
  qualification: string | null
  createdAt: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function subjectAccent(subject: string): string {
  const s = (subject ?? '').toLowerCase()
  if (s.includes('math')) return '#6366F1'
  if (s.includes('physics')) return '#22D3EE'
  if (s.includes('chem')) return '#10B981'
  if (s.includes('bio')) return '#84CC16'
  if (s.includes('english') || s.includes('lang')) return '#F59E0B'
  if (s.includes('hist')) return '#EC4899'
  if (s.includes('comp') || s.includes('cs')) return '#3B82F6'
  return '#8B5CF6'
}

// Fixed exam-paper skeleton rows
const EXAM_QS = [
  { n: '1', marks: 2, lines: [76, 60], answers: 1 },
  { n: '2', marks: 3, lines: [82, 68], answers: 2 },
  { n: '3', marks: 1, lines: [70],     answers: 1 },
  { n: '4', marks: 4, lines: [78, 58], answers: 2 },
] as const

function DocThumbnail({ subject }: { subject: string }) {
  const accent = subjectAccent(subject)
  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ paddingBottom: '115%', backgroundColor: '#181B22', borderBottom: '1px solid #252830' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Accent header strip */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 32,
            background: `linear-gradient(90deg, ${accent}2A 0%, transparent 75%)`,
            borderBottom: `1px solid ${accent}1A`,
          }}
        />

        {/* Paper content */}
        <div className="absolute inset-0 px-5 pt-10 pb-4 flex flex-col">
          {/* Doc header block */}
          <div className="mb-3">
            <div className="h-2 rounded-sm mb-1.5" style={{ width: '58%', backgroundColor: '#323845' }} />
            <div className="h-1.5 rounded-sm"    style={{ width: '37%', backgroundColor: '#262B38' }} />
          </div>

          {/* Divider */}
          <div className="mb-3" style={{ height: 1, backgroundColor: '#21252E' }} />

          {/* Question rows */}
          {EXAM_QS.map(({ n, marks, lines, answers }) => (
            <div key={n} className="mb-3.5">
              {/* Number + text lines + marks box */}
              <div className="flex items-start gap-1.5 mb-1.5">
                <span
                  className="flex-shrink-0 font-bold"
                  style={{ fontSize: 7, color: accent + 'BB', lineHeight: 1, marginTop: 2 }}
                >
                  {n}.
                </span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {lines.map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-sm"
                      style={{ width: `${w}%`, backgroundColor: i === 0 ? '#2B3040' : '#252A38' }}
                    />
                  ))}
                </div>
                {/* Marks box */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded"
                  style={{
                    width: 20,
                    height: 14,
                    border: `0.75px solid ${accent}45`,
                    backgroundColor: `${accent}10`,
                  }}
                >
                  <span style={{ fontSize: 6, color: accent + 'AA', fontWeight: 700 }}>
                    {marks}m
                  </span>
                </div>
              </div>

              {/* Answer lines */}
              {Array.from({ length: answers }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 1,
                    borderBottom: '1px dashed #2A2D38',
                    marginLeft: 14,
                    marginBottom: 6,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectChip({ subject }: { subject: string }) {
  const accent = subjectAccent(subject)
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        backgroundColor: `${accent}18`,
        color: accent,
        border: `1px solid ${accent}30`,
      }}
    >
      {subject}
    </span>
  )
}

function CurriculumChip({ board, qualification }: { board: string; qualification: string }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        backgroundColor: '#1A1D24',
        color: '#5A6070',
        border: '1px solid #252830',
      }}
    >
      {board} {qualification}
    </span>
  )
}

function WorksheetIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color, flexShrink: 0 }}>
      <rect x="1.5" y="0.5" width="9" height="11" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.5 3.5h5M3.5 5.5h5M3.5 7.5h3" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function ThreeDotsBtn({ id }: { id: string }) {
  return (
    <button
      title="More options"
      className="p-1.5 rounded-md flex-shrink-0 transition-all"
      style={{ color: '#3D4350', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#252830'
        e.currentTarget.style.color = '#E8EAED'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = '#3D4350'
      }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <circle cx="6.5" cy="2.2" r="1.1" />
        <circle cx="6.5" cy="6.5" r="1.1" />
        <circle cx="6.5" cy="10.8" r="1.1" />
      </svg>
    </button>
  )
}

function GridCard({ ws }: { ws: WorksheetDoc }) {
  const accent = subjectAccent(ws.subject)
  return (
    <Link href={`/workspace/${ws.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="rounded-xl overflow-hidden flex flex-col group transition-colors duration-150 border border-[#252830] hover:border-[#5254A3]"
        style={{ backgroundColor: '#16191F' }}
      >
        <DocThumbnail subject={ws.subject} />

        {/* Footer */}
        <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2.5 min-w-0">
          {/* Title — allow two lines, no hard truncate */}
          <p
            className="text-[15px] font-semibold leading-snug group-hover:text-[#C4C8FF] transition-colors"
            style={{
              color: '#E8EAED',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {ws.title}
          </p>

          {/* Topic / curriculum chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <SubjectChip subject={ws.subject} />
            {ws.board && ws.qualification && (
              <CurriculumChip board={ws.board} qualification={ws.qualification} />
            )}
          </div>

          {/* Class + date row — full text, no truncation */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <WorksheetIcon color={accent} />
              <span className="text-xs leading-relaxed" style={{ color: '#5A6070' }}>
                {ws.courseLabel}
                <span style={{ color: '#2E3340' }}> · </span>
                Last edited {formatDateLong(ws.createdAt)}
              </span>
            </div>
            <ThreeDotsBtn id={ws.id} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick?: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center rounded-md transition-all"
      style={{
        padding: '6px',
        backgroundColor: active ? '#1C1F28' : 'transparent',
        border: active ? '1px solid #303440' : '1px solid transparent',
        color: active ? '#7C7FF5' : '#6B7280',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#1A1D24' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {children}
    </button>
  )
}

export function WorksheetsClient({ worksheets }: { worksheets: WorksheetDoc[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'newest' | 'az'>('newest')

  const sorted = [...worksheets].sort((a, b) =>
    sort === 'az'
      ? a.title.localeCompare(b.title)
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="px-8 py-7">
      {/* ── Control header ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold" style={{ color: '#E8EAED', letterSpacing: '-0.01em' }}>
          Recent worksheets
        </h2>

        <div className="flex items-center gap-2.5">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{ color: '#A8B0BE', backgroundColor: '#1A1D24', border: '1px solid #2C2E33' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4B5563' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2C2E33' }}
          >
            Owned by anyone
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 4l3 3 3-3" />
            </svg>
          </button>

          <div style={{ width: 1, height: 18, backgroundColor: '#252830' }} />

          <div className="flex items-center gap-0.5">
            <ToolBtn active={view === 'grid'} onClick={() => setView('grid')} title="Grid view">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="5.5" height="5.5" rx="0.8" />
                <rect x="8.5" y="1" width="5.5" height="5.5" rx="0.8" />
                <rect x="1" y="8.5" width="5.5" height="5.5" rx="0.8" />
                <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="0.8" />
              </svg>
            </ToolBtn>
            <ToolBtn active={view === 'list'} onClick={() => setView('list')} title="List view">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4.5 4h8M4.5 7.5h8M4.5 11h8" />
                <circle cx="2" cy="4" r="0.75" fill="currentColor" stroke="none" />
                <circle cx="2" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
                <circle cx="2" cy="11" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </ToolBtn>
          </div>

          <ToolBtn active={sort === 'az'} onClick={() => setSort(sort === 'az' ? 'newest' : 'az')} title="Sort A–Z">
            <span className="text-[11px] font-bold px-0.5" style={{ letterSpacing: '0.03em' }}>A–Z</span>
          </ToolBtn>

          <ToolBtn active={false} title="Folders (coming soon)">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4a1 1 0 0 1 1-1h3.5l1.5 1.5H13a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
            </svg>
          </ToolBtn>
        </div>
      </div>

      {/* Count */}
      {sorted.length > 0 && (
        <p className="text-xs mb-5" style={{ color: '#3D4350' }}>
          {sorted.length} {sorted.length === 1 ? 'worksheet' : 'worksheets'}
        </p>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(63,68,110,0.06)', border: '1px dashed rgba(77,82,138,0.22)' }}
        >
          <p className="text-sm mb-1" style={{ color: '#A8B0BE' }}>No worksheets yet.</p>
          <p className="text-xs" style={{ color: '#4B5563' }}>Open a class and create your first question set.</p>
        </div>
      )}

      {/* ── Grid view ── */}
      {view === 'grid' && sorted.length > 0 && (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {sorted.map((ws) => <GridCard key={ws.id} ws={ws} />)}
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && sorted.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #252830' }}>
          {/* Header */}
          <div
            className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '2.5rem 1fr 11rem 7rem 2rem',
              backgroundColor: '#1C1F27',
              borderBottom: '1px solid #252830',
              color: '#3D4350',
            }}
          >
            <span />
            <span>Name</span>
            <span>Class</span>
            <span>Modified</span>
            <span />
          </div>

          {sorted.map((ws, idx) => {
            const accent = subjectAccent(ws.subject)
            return (
              <Link key={ws.id} href={`/workspace/${ws.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="grid items-center px-5 py-3 transition-colors group"
                  style={{
                    gridTemplateColumns: '2.5rem 1fr 11rem 7rem 2rem',
                    borderTop: idx === 0 ? 'none' : '1px solid #1A1D22',
                    backgroundColor: '#16191F',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1C1F27' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#16191F' }}
                >
                  {/* Mini thumbnail */}
                  <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 28, height: 36, backgroundColor: '#181B22', border: '1px solid #252830' }}>
                    <div className="w-full h-full flex flex-col" style={{ padding: '3px 3px 2px' }}>
                      <div className="rounded-sm mb-0.5" style={{ height: 3, width: '65%', backgroundColor: '#323845' }} />
                      <div style={{ height: 1, backgroundColor: '#21252E', marginBottom: 2 }} />
                      {[72, 58, 78, 62, 70].map((w, i) => (
                        <div key={i} className="rounded-sm mb-0.5" style={{ height: 2, width: `${w}%`, backgroundColor: '#2B3040' }} />
                      ))}
                    </div>
                  </div>

                  {/* Name + chips */}
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <WorksheetIcon color={accent} />
                      <span className="text-sm font-medium truncate group-hover:text-[#C4C8FF] transition-colors" style={{ color: '#E8EAED' }}>
                        {ws.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pl-0">
                      <SubjectChip subject={ws.subject} />
                      {ws.board && ws.qualification && (
                        <CurriculumChip board={ws.board} qualification={ws.qualification} />
                      )}
                    </div>
                  </div>

                  {/* Class */}
                  <span className="text-xs truncate pr-4" style={{ color: '#6B7280' }}>
                    {ws.courseLabel}
                  </span>

                  {/* Date */}
                  <span className="text-xs" style={{ color: '#3D4350' }}>
                    {formatDate(ws.createdAt)}
                  </span>

                  {/* 3-dot */}
                  <div className="flex justify-end">
                    <ThreeDotsBtn id={ws.id} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
