'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createCourse } from '@/app/actions/courses'

interface Curriculum {
  id: string
  board: string
  qualification: string
  syllabus_code: string
}

interface AddCourseCardProps {
  curricula: Curriculum[]
}

const SUBJECTS = [
  'Art & Design', 'Biology', 'Business Studies', 'Chemistry',
  'Computer Science', 'Design & Technology', 'Drama', 'Economics',
  'English Language', 'English Literature', 'French', 'Further Mathematics',
  'Geography', 'German', 'History', 'Mathematics', 'Media Studies',
  'Music', 'Physical Education', 'Physics', 'Psychology',
  'Religious Studies', 'Sociology', 'Spanish',
]

const LABEL_STYLE = { color: '#94A3B8' }
const FIELD_BASE: React.CSSProperties = { backgroundColor: '#0E1317', border: '1px solid #25333E' }

const CHEVRON = (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <path d="M2 4l3.5 3.5L9 4" />
  </svg>
)

// ─── Subject combobox ────────────────────────────────────────────────────────

function SubjectCombobox({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  const [query, setQuery] = useState(selected)
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(selected) }, [selected])

  const filtered = SUBJECTS.filter(
    (s) => !query || s.toLowerCase().includes(query.toLowerCase())
  )

  function pick(subject: string) { setQuery(subject); setOpen(false); onSelect(subject) }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[hi]) pick(filtered[hi]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  useEffect(() => {
    const item = listRef.current?.children[hi] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [hi])

  return (
    <div className="relative">
      <div
        className="flex items-center rounded-lg px-3 py-2 gap-2"
        style={{ ...FIELD_BASE, borderColor: open ? '#06B6D4' : '#25333E' }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onSelect(''); setOpen(true); setHi(0) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKey}
          placeholder="Search subjects…"
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#3D4350]"
          style={{ caretColor: '#06B6D4' }}
        />
        <span style={{ color: '#3D4350', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
          {CHEVRON}
        </span>
      </div>
      <input type="hidden" name="subject" value={selected} />

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-20 w-full mt-1 rounded-xl overflow-auto py-1.5 animate-dropdown"
          style={{ maxHeight: 196, backgroundColor: '#1A242C', border: '1px solid #25333E', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {filtered.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => pick(s)}
              onMouseEnter={() => setHi(i)}
              className="w-full text-left px-4 py-2 text-sm"
              style={{ color: i === hi ? '#F8FAFC' : '#94A3B8', backgroundColor: i === hi ? '#25333E' : 'transparent' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div
          className="absolute z-20 w-full mt-1 rounded-xl px-4 py-3 text-sm animate-dropdown"
          style={{ backgroundColor: '#1A242C', border: '1px solid #25333E', color: '#4B5563' }}
        >
          No matching subjects
        </div>
      )}
    </div>
  )
}

// ─── Curriculum dropdown ─────────────────────────────────────────────────────

function CurriculumDropdown({ curricula }: { curricula: Curriculum[] }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Curriculum | null>(null)
  const [hi, setHi] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function pick(c: Curriculum) { setSelected(c); setOpen(false) }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, curricula.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(curricula[hi]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const label = selected ? `${selected.board} ${selected.qualification} (${selected.syllabus_code})` : 'Select curriculum…'

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="curriculum_id" value={selected?.id ?? ''} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm"
        style={{ ...FIELD_BASE, borderColor: open ? '#06B6D4' : '#25333E', color: selected ? '#F8FAFC' : '#4B5563' }}
      >
        <span className="truncate">{label}</span>
        <span style={{ color: '#3D4350', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
          {CHEVRON}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden py-1.5 animate-dropdown"
          style={{ backgroundColor: '#181B22', border: '1px solid #303440', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {curricula.map((c, i) => {
            const isSel = selected?.id === c.id
            const isHi = i === hi
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c)}
                onMouseEnter={() => setHi(i)}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2"
                style={{ color: isSel ? '#A5F3FC' : isHi ? '#F8FAFC' : '#94A3B8', backgroundColor: isHi ? '#25333E' : 'transparent' }}
              >
                <span>{c.board} {c.qualification} ({c.syllabus_code})</span>
                {isSel && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#06B6D4' }}>
                    <path d="M2 6.5l3.5 3.5 5.5-6" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AddCourseCard({ curricula }: AddCourseCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedSubject, setSelectedSubject] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trigger enter animation one frame after mount
  useEffect(() => {
    if (!isVisible) return
    const id = requestAnimationFrame(() => setIsAnimating(true))
    return () => cancelAnimationFrame(id)
  }, [isVisible])

  function openModal() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setError(null)
    setSelectedSubject('')
    setIsVisible(true)
  }

  function closeModal() {
    setIsAnimating(false)
    setError(null)
    closeTimer.current = setTimeout(() => {
      setIsVisible(false)
      setSelectedSubject('')
    }, 220)
  }

  useEffect(() => {
    if (!isVisible) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isVisible])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (!selectedSubject) { setError('Please select a subject from the list'); return }
    if (!formData.get('curriculum_id')) { setError('Please select a curriculum'); return }
    setError(null)
    startTransition(async () => {
      const result = await createCourse(formData)
      if (result && 'error' in result) setError(result.error ?? null)
    })
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openModal}
        className="rounded-xl p-5 w-full text-left transition-all duration-150"
        style={{ border: '1px dashed #25333E', backgroundColor: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#06B6D4')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#25333E')}
      >
        <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          <span className="text-sm font-medium">Add class</span>
        </div>
      </button>

      {/* Modal — always unmounts cleanly after exit animation */}
      {isVisible && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: `rgba(0,0,0,${isAnimating ? 0.6 : 0})`,
            transition: 'background-color 220ms ease',
            pointerEvents: isAnimating ? 'auto' : 'none',
          }}
          onClick={(e) => { if (e.target === overlayRef.current) closeModal() }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: '#1A242C',
              border: '1px solid #25333E',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              transition: 'opacity 220ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isAnimating ? 1 : 0,
              transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
            }}
          >
            <h2 className="text-base font-semibold text-white mb-6">New class</h2>

            <form key={String(isVisible)} onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={LABEL_STYLE}>Class name</label>
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="e.g. Year 10 Foundation Maths"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none placeholder:text-[#3D4350]"
                  style={FIELD_BASE}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#06B6D4')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#25333E')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={LABEL_STYLE}>Subject</label>
                <SubjectCombobox selected={selectedSubject} onSelect={setSelectedSubject} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={LABEL_STYLE}>Curriculum</label>
                <CurriculumDropdown curricula={curricula} />
              </div>

              {error && (
                <p className="text-xs -mt-1" style={{ color: '#F87171' }}>{error}</p>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.backgroundColor = '#25333E' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#06B6D4' }}
                  onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = '#0891B2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#06B6D4' }}
                >
                  {isPending ? 'Creating…' : 'Create class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
