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

export function AddCourseCard({ curricula }: AddCourseCardProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await createCourse(formData)
      if (result && 'error' in result) {
        setError(result.error ?? null)
      }
      // on success the server action calls redirect('/'), no client-side nav needed
    })
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true) }}
        className="rounded-xl p-5 w-full text-left transition-all duration-150"
        style={{ border: '1px dashed #2C2E33', backgroundColor: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#4D528A')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2C2E33')}
      >
        <div className="flex items-center gap-2" style={{ color: '#9AA0A6' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M7 2v10M2 7h10" />
          </svg>
          <span className="text-sm font-medium">Add course</span>
        </div>
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false) }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: '#1E2024', border: '1px solid #2C2E33' }}
          >
            <h2 className="text-base font-semibold text-white mb-5">New course</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium" style={{ color: '#9AA0A6' }}>
                  Label
                </span>
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="e.g. Year 10 Foundation Maths"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ backgroundColor: '#121417', border: '1px solid #2C2E33' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4D528A')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2C2E33')}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium" style={{ color: '#9AA0A6' }}>
                  Subject
                </span>
                <input
                  name="subject"
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                  style={{ backgroundColor: '#121417', border: '1px solid #2C2E33' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4D528A')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2C2E33')}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium" style={{ color: '#9AA0A6' }}>
                  Curriculum
                </span>
                <select
                  name="curriculum_id"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ backgroundColor: '#121417', border: '1px solid #2C2E33', color: '#ffffff' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4D528A')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2C2E33')}
                >
                  <option value="" disabled>Select curriculum…</option>
                  {curricula.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.board} {c.qualification} ({c.syllabus_code})
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: '#9AA0A6' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2C2E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#4D528A' }}
                >
                  {isPending ? 'Creating…' : 'Create course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
