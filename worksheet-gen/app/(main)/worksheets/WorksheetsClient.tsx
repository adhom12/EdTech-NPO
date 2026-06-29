'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { renameWorksheet, deleteWorksheet, assignWorksheetToCourse, createWorksheet } from '@/app/actions/worksheets'

export type WorksheetDoc = {
  id: string
  title: string
  courseId: string | null
  courseLabel: string | null
  subject: string | null
  curriculumId: string | null
  board: string | null
  qualification: string | null
  createdAt: string
}

export type CourseOption = {
  id: string
  label: string
  subject: string
  curriculumId: string | null
  board: string | null
  qualification: string | null
}

type MenuState = {
  id: string
  courseId: string
  curriculumId: string | null
  title: string
  top: number
  bottom: number
  right: number
  flipUp: boolean
}

type AssignState = {
  worksheetId: string
  currentCourseId: string
  curriculumId: string | null
}

const MENU_HEIGHT_EST = 140

const BASE_SHADOW = '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)'
const HOVER_SHADOW = '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function abbreviateBoard(board: string): string {
  const b = board.trim().toLowerCase()
  if (b.includes('cambridge assessment international')) return 'CIE'
  if (b.includes('cambridge assessment')) return 'Cambridge'
  if (b.includes('oxford cambridge')) return 'OCR'
  return board.trim()
}

function subjectAccent(subject: string | null | undefined): string {
  const s = (subject ?? '').toLowerCase()
  if (s.includes('math')) return '#4F46E5'
  if (s.includes('physics')) return '#0891B2'
  if (s.includes('chem')) return '#059669'
  if (s.includes('bio')) return '#65A30D'
  if (s.includes('english') || s.includes('lang')) return '#D97706'
  if (s.includes('hist')) return '#DB2777'
  if (s.includes('comp') || s.includes('cs')) return '#2563EB'
  return '#7C3AED'
}

const EXAM_QS = [
  { n: '1', marks: 2, lines: [76, 60], answers: 1 },
  { n: '2', marks: 3, lines: [82, 68], answers: 2 },
  { n: '3', marks: 1, lines: [70],     answers: 1 },
  { n: '4', marks: 4, lines: [78, 58], answers: 2 },
] as const

function DocThumbnail({ subject }: { subject: string | null }) {
  const accent = subjectAccent(subject)
  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ paddingBottom: '62%', backgroundColor: '#f5f3ef', borderBottom: '1px solid #e5e2d9' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 32,
            background: `linear-gradient(90deg, ${accent}18 0%, transparent 75%)`,
            borderBottom: `1px solid ${accent}20`,
          }}
        />
        <div className="absolute inset-0 px-5 pt-10 pb-4 flex flex-col">
          <div className="mb-3">
            <div className="h-2 rounded-sm mb-1.5" style={{ width: '58%', backgroundColor: '#dddad3' }} />
            <div className="h-1.5 rounded-sm" style={{ width: '37%', backgroundColor: '#e5e2d9' }} />
          </div>
          <div className="mb-3" style={{ height: 1, backgroundColor: '#e5e2d9' }} />
          {EXAM_QS.map(({ n, marks, lines, answers }) => (
            <div key={n} className="mb-3.5">
              <div className="flex items-start gap-1.5 mb-1.5">
                <span className="flex-shrink-0 font-bold" style={{ fontSize: 7, color: accent + '99', lineHeight: 1, marginTop: 2 }}>
                  {n}.
                </span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {lines.map((w, i) => (
                    <div key={i} className="h-1.5 rounded-sm" style={{ width: `${w}%`, backgroundColor: i === 0 ? '#d5d2cb' : '#dddad5' }} />
                  ))}
                </div>
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded"
                  style={{ width: 20, height: 14, border: `0.75px solid ${accent}35`, backgroundColor: `${accent}0C` }}
                >
                  <span style={{ fontSize: 6, color: accent + '99', fontWeight: 700 }}>{marks}m</span>
                </div>
              </div>
              {Array.from({ length: answers }).map((_, i) => (
                <div key={i} style={{ height: 1, borderBottom: '1px dashed #dddad5', marginLeft: 14, marginBottom: 6 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectChip({ subject }: { subject: string | null }) {
  const accent = subjectAccent(subject)
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: `${accent}12`, color: accent, border: `1px solid ${accent}28` }}
    >
      {subject}
    </span>
  )
}

function CurriculumChip({ board, qualification }: { board: string; qualification: string }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: '#f0ede6', color: '#8a9a8f', border: '1px solid #e5e2d9' }}
    >
      {abbreviateBoard(board)} {qualification}
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

function ThreeDotsBtn({ onMenu }: { onMenu: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      title="More options"
      className="p-1.5 rounded-md flex-shrink-0 transition-all duration-200"
      style={{ color: '#c0cdc5', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0ede6'; e.currentTarget.style.color = '#6b7b70' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c0cdc5' }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMenu(e) }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <circle cx="6.5" cy="2.2" r="1.1" />
        <circle cx="6.5" cy="6.5" r="1.1" />
        <circle cx="6.5" cy="10.8" r="1.1" />
      </svg>
    </button>
  )
}

function MenuItem({
  label, onClick, danger = false, disabled = false, icon, chevron = false,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
  icon: React.ReactNode
  chevron?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors"
      style={{
        color: disabled ? '#c0cdc5' : danger ? '#dc2626' : '#6b7b70',
        backgroundColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = '#f0ede6' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {chevron && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: '#c0cdc5', flexShrink: 0 }}>
          <path d="M3.5 2l3 3-3 3" />
        </svg>
      )}
    </button>
  )
}

function GridCard({
  ws, displayTitle, onMenu,
}: {
  ws: WorksheetDoc
  displayTitle: string
  onMenu: (e: React.MouseEvent<HTMLButtonElement>, ws: WorksheetDoc) => void
}) {
  const accent = subjectAccent(ws.subject)
  return (
    <Link href={`/workspace/${ws.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="rounded-xl overflow-hidden flex flex-col h-full group transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(71,87,77,0.08)',
          boxShadow: BASE_SHADOW,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = HOVER_SHADOW
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = BASE_SHADOW
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        <DocThumbnail subject={ws.subject} />
        <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1 min-w-0">
          <p
            className="text-[15px] font-semibold leading-snug mb-2.5 transition-colors group-hover:text-[#e8753b]"
            style={{
              color: '#47574d',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayTitle}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mb-auto">
            <SubjectChip subject={ws.subject} />
            {ws.board && ws.qualification && (
              <CurriculumChip board={ws.board} qualification={ws.qualification} />
            )}
          </div>
          <div className="flex items-end justify-between gap-2 mt-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <WorksheetIcon color={accent} />
                <span className="text-xs truncate" style={{ color: '#8a9a8f' }}>{ws.courseLabel}</span>
              </div>
              <span className="text-xs" style={{ color: '#c0cdc5' }}>
                Last edited {formatDateLong(ws.createdAt)}
              </span>
            </div>
            <ThreeDotsBtn onMenu={(e) => onMenu(e, ws)} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ToolBtn({
  active, onClick, title, children,
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
      className="flex items-center justify-center rounded-md transition-all duration-200"
      style={{
        padding: '6px',
        backgroundColor: active ? '#faf9f7' : 'transparent',
        border: active ? '1px solid #e5e2d9' : '1px solid transparent',
        color: active ? '#47574d' : '#b0bfb4',
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = '#f0ede6'; e.currentTarget.style.color = '#6b7b70' } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b0bfb4' } }}
    >
      {children}
    </button>
  )
}

export function WorksheetsClient({ worksheets, courses }: { worksheets: WorksheetDoc[]; courses: CourseOption[] }) {
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'newest' | 'az'>('newest')

  const [creating, setCreating] = useState(false)
  const [createAnimating, setCreateAnimating] = useState(false)
  const [createTitle, setCreateTitle] = useState('Untitled worksheet')
  const [createCourseIds, setCreateCourseIds] = useState<string[]>([])
  const [createSubject, setCreateSubject] = useState('')
  const [createSyllabus, setCreateSyllabus] = useState('')
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false)
  const [syllabusDropdownOpen, setSyllabusDropdownOpen] = useState(false)
  const [createPending, setCreatePending] = useState(false)
  const createTitleRef = useRef<HTMLInputElement>(null)
  const createCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const classDropdownRef = useRef<HTMLDivElement>(null)
  const subjectDropdownRef = useRef<HTMLDivElement>(null)
  const syllabusDropdownRef = useRef<HTMLDivElement>(null)

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [menuAnimating, setMenuAnimating] = useState(false)
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null)
  const [renameAnimating, setRenameAnimating] = useState(false)
  const [renameInput, setRenameInput] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const renameCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [assigning, setAssigning] = useState<AssignState | null>(null)
  const [assignAnimating, setAssignAnimating] = useState(false)
  const [assignPending, setAssignPending] = useState(false)
  const assignCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [localTitles, setLocalTitles] = useState<Record<string, string>>({})
  const [localCourseIds, setLocalCourseIds] = useState<Record<string, string>>({})

  // Menu enter animation
  useEffect(() => {
    if (!menu) return
    const id = requestAnimationFrame(() => setMenuAnimating(true))
    return () => cancelAnimationFrame(id)
  }, [menu])

  // Outside click to close menu
  useEffect(() => {
    if (!menu) return
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menu])

  function closeMenu() {
    setMenuAnimating(false)
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
    menuCloseTimer.current = setTimeout(() => setMenu(null), 150)
  }

  function dismissMenu() {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
    setMenuAnimating(false)
    setMenu(null)
  }

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, ws: WorksheetDoc) {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const flipUp = spaceBelow < MENU_HEIGHT_EST + 8
    setMenuAnimating(false)
    setMenu({
      id: ws.id,
      courseId: localCourseIds[ws.id] ?? ws.courseId,
      curriculumId: ws.curriculumId,
      title: localTitles[ws.id] ?? ws.title,
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      right: window.innerWidth - rect.right,
      flipUp,
    })
  }

  // Rename lifecycle
  useEffect(() => {
    if (!renaming) return
    const id = requestAnimationFrame(() => {
      setRenameAnimating(true)
      renameInputRef.current?.select()
    })
    return () => cancelAnimationFrame(id)
  }, [renaming])

  function startRename() {
    if (!menu) return
    setRenameInput(menu.title)
    setRenameAnimating(false)
    setRenaming({ id: menu.id, title: menu.title })
    dismissMenu()
  }

  function closeRenameModal() {
    setRenameAnimating(false)
    if (renameCloseTimer.current) clearTimeout(renameCloseTimer.current)
    renameCloseTimer.current = setTimeout(() => setRenaming(null), 200)
  }

  async function confirmRename() {
    if (!renaming) return
    const trimmed = renameInput.trim()
    const { id } = renaming
    if (!trimmed || trimmed === renaming.title) { closeRenameModal(); return }
    setLocalTitles(prev => ({ ...prev, [id]: trimmed }))
    closeRenameModal()
    await renameWorksheet(id, trimmed)
  }

  // Assign lifecycle
  useEffect(() => {
    if (!assigning) return
    const id = requestAnimationFrame(() => setAssignAnimating(true))
    return () => cancelAnimationFrame(id)
  }, [assigning])

  function startAssign() {
    if (!menu) return
    setAssigning({ worksheetId: menu.id, currentCourseId: menu.courseId, curriculumId: menu.curriculumId })
    setAssignAnimating(false)
    dismissMenu()
  }

  function closeAssignModal() {
    setAssignAnimating(false)
    if (assignCloseTimer.current) clearTimeout(assignCloseTimer.current)
    assignCloseTimer.current = setTimeout(() => setAssigning(null), 200)
  }

  async function handleAssign(courseId: string) {
    if (!assigning || assignPending) return
    const { worksheetId } = assigning
    setAssignPending(true)
    setLocalCourseIds(prev => ({ ...prev, [worksheetId]: courseId }))
    closeAssignModal()
    await assignWorksheetToCourse(worksheetId, courseId)
    setAssignPending(false)
  }

  // Derived options for subject / syllabus dropdowns
  const uniqueSubjects = useMemo(
    () => [...new Set(courses.map((c) => c.subject))].sort(),
    [courses]
  )
  const uniqueSyllabuses = useMemo(() => {
    const s = new Set<string>()
    courses.forEach((c) => { if (c.board && c.qualification) s.add(`${abbreviateBoard(c.board)} ${c.qualification}`) })
    return [...s].sort()
  }, [courses])

  function courseMatches(c: CourseOption): boolean {
    const subjectOk = !createSubject || c.subject.toLowerCase() === createSubject.toLowerCase()
    const syllabusOk = !createSyllabus || (c.board ? `${abbreviateBoard(c.board)} ${c.qualification ?? ''}`.trim() === createSyllabus : false)
    return subjectOk && syllabusOk
  }

  // Clear class selections that no longer match when filters change
  useEffect(() => {
    if (!creating) return
    setCreateCourseIds((prev) => prev.filter((id) => {
      const c = courses.find((x) => x.id === id)
      return c ? courseMatches(c) : false
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createSubject, createSyllabus, creating])

  // Outside-click handlers for custom dropdowns
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) setClassDropdownOpen(false)
    }
    if (classDropdownOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [classDropdownOpen])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target as Node)) setSubjectDropdownOpen(false)
    }
    if (subjectDropdownOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [subjectDropdownOpen])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (syllabusDropdownRef.current && !syllabusDropdownRef.current.contains(e.target as Node)) setSyllabusDropdownOpen(false)
    }
    if (syllabusDropdownOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [syllabusDropdownOpen])

  // Create new worksheet lifecycle
  useEffect(() => {
    if (!creating) return
    const id = requestAnimationFrame(() => {
      setCreateAnimating(true)
      setTimeout(() => { createTitleRef.current?.select() }, 50)
    })
    return () => cancelAnimationFrame(id)
  }, [creating])

  function openCreate() {
    setCreateTitle('Untitled worksheet')
    setCreateCourseIds([])
    setCreateSubject('')
    setCreateSyllabus('')
    setClassDropdownOpen(false)
    setSubjectDropdownOpen(false)
    setSyllabusDropdownOpen(false)
    setCreateAnimating(false)
    setCreating(true)
  }

  function closeCreate() {
    setCreateAnimating(false)
    if (createCloseTimer.current) clearTimeout(createCloseTimer.current)
    createCloseTimer.current = setTimeout(() => setCreating(false), 200)
  }

  async function handleCreate() {
    const title = createTitle.trim() || 'Untitled worksheet'
    if (createCourseIds.length === 0 || createPending) return
    setCreatePending(true)
    const results = await Promise.all(createCourseIds.map((id) => createWorksheet(id, title)))
    setCreatePending(false)
    const first = results.find((r): r is { id: string } => 'id' in r)
    if (first) {
      closeCreate()
      router.push(`/workspace/${first.id}`)
    }
  }

  async function handleDelete() {
    if (!menu) return
    const { id, courseId } = menu
    dismissMenu()
    await deleteWorksheet(id, courseId)
  }

  const getTitle = (ws: WorksheetDoc) => localTitles[ws.id] ?? ws.title
  const getCourseLabel = (ws: WorksheetDoc) => {
    const overrideId = localCourseIds[ws.id]
    if (!overrideId) return ws.courseLabel
    return courses.find(c => c.id === overrideId)?.label ?? ws.courseLabel
  }

  const sorted = [...worksheets].sort((a, b) =>
    sort === 'az'
      ? getTitle(a).localeCompare(getTitle(b))
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="px-8 py-7 animate-page-in max-w-[1400px] mx-auto">
      {/* Control header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#47574d' }}>Recent worksheets</h1>
        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: '#e8753b' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M6 1v10M1 6h10" />
            </svg>
            New worksheet
          </button>
          <div style={{ width: 1, height: 18, backgroundColor: '#e5e2d9' }} />
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
            style={{ color: '#8a9a8f', backgroundColor: '#faf9f7', border: '1px solid #e5e2d9' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8753b' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e2d9' }}
          >
            Owned by anyone
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 4l3 3 3-3" />
            </svg>
          </button>
          <div style={{ width: 1, height: 18, backgroundColor: '#e5e2d9' }} />
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

      {sorted.length > 0 && (
        <p className="text-xs mb-5" style={{ color: '#b0bfb4' }}>
          {sorted.length} {sorted.length === 1 ? 'worksheet' : 'worksheets'}
        </p>
      )}

      {sorted.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#fdf0e9', border: '1px dashed rgba(232,117,59,0.3)' }}
        >
          <p className="text-sm mb-1" style={{ color: '#8a9a8f' }}>No worksheets yet.</p>
          <p className="text-xs" style={{ color: '#b0bfb4' }}>Open a class and create your first question set.</p>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && sorted.length > 0 && (
        <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {sorted.map((ws) => (
            <GridCard
              key={ws.id}
              ws={{ ...ws, courseLabel: getCourseLabel(ws) }}
              displayTitle={getTitle(ws)}
              onMenu={openMenu}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && sorted.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(71,87,77,0.1)', boxShadow: BASE_SHADOW }}
        >
          <div
            className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '2.5rem 1fr 11rem 7rem 2rem',
              backgroundColor: '#faf9f7',
              borderBottom: '1px solid #e5e2d9',
              color: '#b0bfb4',
            }}
          >
            <span /><span>Name</span><span>Class</span><span>Modified</span><span />
          </div>
          {sorted.map((ws, idx) => {
            const accent = subjectAccent(ws.subject)
            return (
              <Link key={ws.id} href={`/workspace/${ws.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="grid items-center px-5 py-3 transition-all duration-200 group"
                  style={{
                    gridTemplateColumns: '2.5rem 1fr 11rem 7rem 2rem',
                    borderTop: idx === 0 ? 'none' : '1px solid #f0ede6',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f3ef' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#ffffff' }}
                >
                  <div className="rounded overflow-hidden flex-shrink-0" style={{ width: 28, height: 36, backgroundColor: '#f0ede6', border: '1px solid #e5e2d9' }}>
                    <div className="w-full h-full flex flex-col" style={{ padding: '3px 3px 2px' }}>
                      <div className="rounded-sm mb-0.5" style={{ height: 3, width: '65%', backgroundColor: '#dddad3' }} />
                      <div style={{ height: 1, backgroundColor: '#e5e2d9', marginBottom: 2 }} />
                      {[72, 58, 78, 62, 70].map((w, i) => (
                        <div key={i} className="rounded-sm mb-0.5" style={{ height: 2, width: `${w}%`, backgroundColor: '#dddad3' }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <WorksheetIcon color={accent} />
                      <span className="text-sm font-medium truncate group-hover:text-[#e8753b] transition-colors" style={{ color: '#47574d' }}>
                        {getTitle(ws)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SubjectChip subject={ws.subject} />
                      {ws.board && ws.qualification && (
                        <CurriculumChip board={ws.board} qualification={ws.qualification} />
                      )}
                    </div>
                  </div>
                  <span className="text-xs truncate pr-4" style={{ color: '#8a9a8f' }}>{getCourseLabel(ws)}</span>
                  <span className="text-xs" style={{ color: '#b0bfb4' }}>{formatDate(ws.createdAt)}</span>
                  <div className="flex justify-end">
                    <ThreeDotsBtn onMenu={(e) => openMenu(e, ws)} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Dropdown menu ── */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-xl overflow-hidden py-1.5"
          style={{
            right: menu.right,
            ...(menu.flipUp ? { bottom: menu.bottom } : { top: menu.top }),
            backgroundColor: '#ffffff',
            border: '1px solid rgba(71,87,77,0.1)',
            boxShadow: '0 8px 20px rgba(71,87,77,0.12), 0 2px 6px rgba(71,87,77,0.06)',
            minWidth: 172,
            transformOrigin: menu.flipUp ? 'bottom right' : 'top right',
            transition: 'opacity 150ms ease, transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: menuAnimating ? 1 : 0,
            transform: menuAnimating
              ? 'translateY(0) scale(1)'
              : (menu.flipUp ? 'translateY(4px) scale(0.96)' : 'translateY(-4px) scale(0.96)'),
            pointerEvents: menuAnimating ? 'auto' : 'none',
          }}
        >
          <MenuItem
            label="Rename"
            onClick={startRename}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" />
              </svg>
            }
          />
          <MenuItem
            label="Assign to class"
            onClick={startAssign}
            chevron
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="12" height="9" rx="1.5" />
                <path d="M1 6h12" />
                <circle cx="7" cy="9" r="1" fill="currentColor" stroke="none" />
              </svg>
            }
          />
          <div style={{ height: 1, backgroundColor: '#f0ede6', margin: '4px 0' }} />
          <MenuItem
            label="Delete"
            danger
            onClick={handleDelete}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5 3.5l.5 8M9 3.5l-.5 8" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── New worksheet modal ── */}
      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: `rgba(71,87,77,${createAnimating ? 0.3 : 0})`,
            transition: 'background-color 200ms ease',
            pointerEvents: createAnimating ? 'auto' : 'none',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeCreate() }}
        >
          <div
            className="rounded-2xl w-full"
            style={{
              maxWidth: 440,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(71,87,77,0.08)',
              boxShadow: '0 24px 64px rgba(71,87,77,0.2), 0 8px 24px rgba(71,87,77,0.1)',
              transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: createAnimating ? 1 : 0,
              transform: createAnimating ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
            }}
          >
            <div className="px-6 pt-6 pb-5">
              <h3 className="text-sm font-semibold mb-5" style={{ color: '#47574d' }}>New worksheet</h3>

              <div className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0bfb4' }}>
                    Title
                  </label>
                  <input
                    ref={createTitleRef}
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') closeCreate() }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                    style={{ backgroundColor: '#f5f3ef', border: '1px solid #e5e2d9', color: '#47574d' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#e8753b' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e2d9' }}
                    placeholder="Worksheet title"
                  />
                </div>

                {/* Subject + Syllabus side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Subject */}
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0bfb4' }}>
                      Subject
                    </label>
                    <div ref={subjectDropdownRef} className="relative">
                      <button
                        onClick={() => { setSubjectDropdownOpen((o) => !o); setSyllabusDropdownOpen(false); setClassDropdownOpen(false) }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                        style={{
                          backgroundColor: '#f5f3ef',
                          border: `1px solid ${subjectDropdownOpen ? '#e8753b' : '#e5e2d9'}`,
                          color: createSubject ? '#47574d' : '#b0bfb4',
                        }}
                      >
                        <span className="truncate">{createSubject || 'Any'}</span>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#8a9a8f" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 ml-2" style={{ transform: subjectDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                          <path d="M2.5 4l3 3 3-3" />
                        </svg>
                      </button>
                      {subjectDropdownOpen && (
                        <div
                          className="absolute left-0 right-0 z-50 rounded-xl py-1 overflow-hidden"
                          style={{
                            top: 'calc(100% + 4px)',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e8753b',
                            boxShadow: '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)',
                            maxHeight: 200,
                            overflowY: 'auto',
                          }}
                        >
                          {['', ...uniqueSubjects].map((opt) => (
                            <button
                              key={opt || '__any'}
                              onClick={() => { setCreateSubject(opt); setSubjectDropdownOpen(false) }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                              style={{
                                backgroundColor: createSubject === opt ? 'rgba(204,218,229,0.5)' : 'transparent',
                                color: '#47574d',
                              }}
                              onMouseEnter={(e) => { if (createSubject !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(204,218,229,0.35)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = createSubject === opt ? 'rgba(204,218,229,0.5)' : 'transparent' }}
                            >
                              {opt || <span style={{ color: '#b0bfb4' }}>Any</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Syllabus */}
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0bfb4' }}>
                      Syllabus
                    </label>
                    <div ref={syllabusDropdownRef} className="relative">
                      <button
                        onClick={() => { setSyllabusDropdownOpen((o) => !o); setSubjectDropdownOpen(false); setClassDropdownOpen(false) }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                        style={{
                          backgroundColor: '#f5f3ef',
                          border: `1px solid ${syllabusDropdownOpen ? '#e8753b' : '#e5e2d9'}`,
                          color: createSyllabus ? '#47574d' : '#b0bfb4',
                        }}
                      >
                        <span className="truncate">{createSyllabus || 'Any'}</span>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#8a9a8f" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 ml-2" style={{ transform: syllabusDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                          <path d="M2.5 4l3 3 3-3" />
                        </svg>
                      </button>
                      {syllabusDropdownOpen && (
                        <div
                          className="absolute left-0 right-0 z-50 rounded-xl py-1 overflow-hidden"
                          style={{
                            top: 'calc(100% + 4px)',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e8753b',
                            boxShadow: '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)',
                            maxHeight: 200,
                            overflowY: 'auto',
                          }}
                        >
                          {['', ...uniqueSyllabuses].map((opt) => (
                            <button
                              key={opt || '__any'}
                              onClick={() => { setCreateSyllabus(opt); setSyllabusDropdownOpen(false) }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                              style={{
                                backgroundColor: createSyllabus === opt ? 'rgba(204,218,229,0.5)' : 'transparent',
                                color: '#47574d',
                              }}
                              onMouseEnter={(e) => { if (createSyllabus !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(204,218,229,0.35)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = createSyllabus === opt ? 'rgba(204,218,229,0.5)' : 'transparent' }}
                            >
                              {opt || <span style={{ color: '#b0bfb4' }}>Any</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Classes multi-select */}
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0bfb4' }}>
                    Classes{createCourseIds.length > 0 ? ` · ${createCourseIds.length} selected` : ''}
                  </label>
                  {courses.length === 0 ? (
                    <p className="text-xs" style={{ color: '#b0bfb4' }}>No classes yet. Create a class first.</p>
                  ) : (
                    <div ref={classDropdownRef} className="relative">
                      <button
                        onClick={() => { setClassDropdownOpen((o) => !o); setSubjectDropdownOpen(false); setSyllabusDropdownOpen(false) }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                        style={{
                          backgroundColor: '#f5f3ef',
                          border: `1px solid ${classDropdownOpen ? '#e8753b' : '#e5e2d9'}`,
                          color: createCourseIds.length > 0 ? '#47574d' : '#b0bfb4',
                        }}
                      >
                        <span className="truncate">
                          {createCourseIds.length === 0
                            ? 'Select classes…'
                            : createCourseIds.length === 1
                              ? courses.find((c) => c.id === createCourseIds[0])?.label ?? '1 class'
                              : `${createCourseIds.length} classes selected`}
                        </span>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#8a9a8f" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 ml-2" style={{ transform: classDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                          <path d="M2.5 4l3 3 3-3" />
                        </svg>
                      </button>

                      {classDropdownOpen && (
                        <div
                          className="absolute left-0 right-0 z-50 rounded-xl py-1"
                          style={{
                            top: 'calc(100% + 4px)',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e8753b',
                            boxShadow: '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)',
                            maxHeight: 220,
                            overflowY: 'auto',
                          }}
                        >
                          {courses.map((course) => {
                            const matches = courseMatches(course)
                            const isSelected = createCourseIds.includes(course.id)
                            return (
                              <button
                                key={course.id}
                                onClick={() => {
                                  if (!matches) return
                                  setCreateCourseIds((prev) =>
                                    prev.includes(course.id)
                                      ? prev.filter((id) => id !== course.id)
                                      : [...prev, course.id]
                                  )
                                }}
                                className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors"
                                style={{
                                  backgroundColor: isSelected ? 'rgba(204,218,229,0.5)' : 'transparent',
                                  cursor: matches ? 'pointer' : 'default',
                                  opacity: matches ? 1 : 0.4,
                                }}
                                onMouseEnter={(e) => { if (matches && !isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(204,218,229,0.35)' }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? 'rgba(204,218,229,0.5)' : 'transparent' }}
                              >
                                {/* Checkbox indicator */}
                                <span
                                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs"
                                  style={{
                                    border: `1.5px solid ${isSelected ? '#e8753b' : '#c0cdc5'}`,
                                    backgroundColor: isSelected ? '#e8753b' : 'transparent',
                                    color: '#ffffff',
                                  }}
                                >
                                  {isSelected && (
                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1.5 4.5l2 2 4-4" />
                                    </svg>
                                  )}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium truncate" style={{ color: '#47574d' }}>{course.label}</span>
                                  <span className="text-xs truncate" style={{ color: '#8a9a8f' }}>
                                    {course.subject}{course.board ? ` · ${abbreviateBoard(course.board)} ${course.qualification}` : ''}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0ede6' }}>
              <button
                onClick={closeCreate}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{ color: '#8a9a8f' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7b70'; e.currentTarget.style.backgroundColor = '#f0ede6' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8a9a8f'; e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createPending || createCourseIds.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
                style={{
                  backgroundColor: createPending || createCourseIds.length === 0 ? '#c0cdc5' : '#e8753b',
                  cursor: createPending ? 'wait' : createCourseIds.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!createPending && createCourseIds.length > 0) e.currentTarget.style.backgroundColor = '#d4622a' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = createPending || createCourseIds.length === 0 ? '#c0cdc5' : '#e8753b' }}
              >
                {createPending ? 'Creating…' : `Create${createCourseIds.length > 1 ? ` (${createCourseIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ── */}
      {renaming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: `rgba(71,87,77,${renameAnimating ? 0.3 : 0})`,
            transition: 'background-color 200ms ease',
            pointerEvents: renameAnimating ? 'auto' : 'none',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeRenameModal() }}
        >
          <div
            className="rounded-2xl p-6 w-full"
            style={{
              maxWidth: 360,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(71,87,77,0.08)',
              boxShadow: '0 24px 64px rgba(71,87,77,0.2), 0 8px 24px rgba(71,87,77,0.1)',
              transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: renameAnimating ? 1 : 0,
              transform: renameAnimating ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
            }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#47574d' }}>Rename worksheet</h3>
            <input
              ref={renameInputRef}
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename()
                if (e.key === 'Escape') closeRenameModal()
              }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
              style={{ backgroundColor: '#f5f3ef', border: '1px solid #e8753b', color: '#47574d' }}
              placeholder="Worksheet name"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeRenameModal}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{ color: '#8a9a8f' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7b70'; e.currentTarget.style.backgroundColor = '#f0ede6' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8a9a8f'; e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#e8753b' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4622a' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e8753b' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign to class modal ── */}
      {assigning && (() => {
        const matchingCourses = assigning.curriculumId
          ? courses.filter(c => c.curriculumId === assigning.curriculumId)
          : courses
        const displayCourses = matchingCourses.length > 0 ? matchingCourses : courses
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: `rgba(71,87,77,${assignAnimating ? 0.3 : 0})`,
              transition: 'background-color 200ms ease',
              pointerEvents: assignAnimating ? 'auto' : 'none',
            }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) closeAssignModal() }}
          >
            <div
              className="rounded-2xl w-full overflow-hidden"
              style={{
                maxWidth: 400,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(71,87,77,0.08)',
                boxShadow: '0 24px 64px rgba(71,87,77,0.2), 0 8px 24px rgba(71,87,77,0.1)',
                transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: assignAnimating ? 1 : 0,
                transform: assignAnimating ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
              }}
            >
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0ede6' }}>
                <h3 className="text-sm font-semibold" style={{ color: '#47574d' }}>Assign to class</h3>
                <p className="text-xs mt-0.5" style={{ color: '#b0bfb4' }}>
                  {assigning.curriculumId ? 'Showing classes with matching curriculum' : 'All classes'}
                </p>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {displayCourses.length === 0 ? (
                  <p className="px-5 py-6 text-sm" style={{ color: '#b0bfb4' }}>No other classes available.</p>
                ) : (
                  displayCourses.map((course) => {
                    const isCurrent = course.id === assigning.currentCourseId
                    return (
                      <button
                        key={course.id}
                        onClick={() => { if (!isCurrent) handleAssign(course.id) }}
                        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-all duration-200"
                        style={{
                          backgroundColor: 'transparent',
                          borderBottom: '1px solid #f5f3ef',
                          cursor: isCurrent ? 'default' : 'pointer',
                        }}
                        onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f3ef' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium truncate" style={{ color: isCurrent ? '#e8753b' : '#47574d' }}>
                            {course.label}
                          </span>
                          <span className="text-xs" style={{ color: '#8a9a8f' }}>
                            {course.subject}{course.board ? ` · ${abbreviateBoard(course.board)} ${course.qualification}` : ''}
                          </span>
                        </div>
                        {isCurrent && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e8753b', flexShrink: 0 }}>
                            <path d="M2 7l4 4 6-6" />
                          </svg>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
              <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid #f0ede6' }}>
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{ color: '#8a9a8f' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0ede6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
