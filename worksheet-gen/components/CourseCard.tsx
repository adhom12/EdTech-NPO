'use client'

import Link from 'next/link'

const CARD_ACCENTS = ['#06B6D4', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899']

interface CourseCardProps {
  id: string
  label: string
  subject: string
  board: string
  qualification: string
  worksheetCount: number
  index?: number
}

export function CourseCard({
  id,
  label,
  subject,
  board,
  qualification,
  worksheetCount,
  index = 0,
}: CourseCardProps) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

  return (
    <Link
      href={`/courses/${id}`}
      className="block rounded-xl p-5 transition-all duration-150"
      style={{
        backgroundColor: '#1A242C',
        border: '1px solid #25333E',
        borderTop: `2px solid ${accent}`,
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#25333E'
        e.currentTarget.style.borderTopColor = accent
      }}
    >
      <h3
        className="text-sm font-semibold leading-snug mb-2"
        style={{ color: '#F8FAFC' }}
      >
        {label}
      </h3>
      <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
        {board} {qualification} · {subject}
      </p>
      <p className="text-xs" style={{ color: '#64748B' }}>
        {worksheetCount} question set{worksheetCount !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
