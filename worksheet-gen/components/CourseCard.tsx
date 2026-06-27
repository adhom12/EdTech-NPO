'use client'

import Link from 'next/link'

interface CourseCardProps {
  id: string
  label: string
  subject: string
  board: string
  qualification: string
  worksheetCount: number
}

export function CourseCard({
  id,
  label,
  subject,
  board,
  qualification,
  worksheetCount,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="block rounded-xl p-5 transition-all duration-150"
      style={{
        backgroundColor: '#1E2024',
        border: '1px solid #2C2E33',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3A3D44')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2C2E33')}
    >
      <h3
        className="text-sm font-semibold leading-snug mb-2"
        style={{ color: '#FFFFFF' }}
      >
        {label}
      </h3>
      <p className="text-xs mb-3" style={{ color: '#9AA0A6' }}>
        {board} {qualification} · {subject}
      </p>
      <p className="text-xs" style={{ color: '#6B7280' }}>
        {worksheetCount} question set{worksheetCount !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
