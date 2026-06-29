'use client'

import { useTransition } from 'react'
import { deleteCourse } from '@/app/actions/courses'

export function DeleteCourseButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${label}"? This will remove all worksheets and students in this class.`)) return
    startTransition(() => { deleteCourse(id) })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs transition-colors"
      style={{ color: pending ? '#c0cdc5' : '#c0cdc5' }}
      onMouseEnter={(e) => { if (!pending) (e.currentTarget as HTMLElement).style.color = '#e8753b' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#c0cdc5' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h8M5 3V2h2v1M4.5 3v6.5h3V3" />
      </svg>
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
