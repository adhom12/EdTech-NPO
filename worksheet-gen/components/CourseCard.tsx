'use client'

import Link from 'next/link'

const CARD_ACCENTS = ['#0891B2', '#059669', '#2563EB', '#7C3AED', '#D97706', '#DB2777']

interface CourseCardProps {
  id: string
  label: string
  subject: string
  board: string
  qualification: string
  worksheetCount: number
  index?: number
}

const BASE_SHADOW = '0 1px 3px rgba(71,87,77,0.08), 0 1px 2px rgba(71,87,77,0.04)'
const HOVER_SHADOW = '0 8px 24px rgba(71,87,77,0.14), 0 2px 8px rgba(71,87,77,0.08)'

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
      className="block rounded-xl p-5 transition-all duration-200 ease-in-out"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(71,87,77,0.08)',
        borderTop: `2px solid ${accent}`,
        textDecoration: 'none',
        boxShadow: BASE_SHADOW,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = HOVER_SHADOW
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = BASE_SHADOW
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <h3
        className="text-sm font-semibold leading-snug mb-2"
        style={{ color: '#47574d' }}
      >
        {label}
      </h3>
      <p className="text-xs mb-3" style={{ color: '#8a9a8f' }}>
        {board} {qualification} · {subject}
      </p>
      <p className="text-xs" style={{ color: '#64748B' }}>
        {worksheetCount} question set{worksheetCount !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
