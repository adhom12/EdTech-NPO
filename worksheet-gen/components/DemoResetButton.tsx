'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DemoResetButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const router = useRouter()

  async function handleReset() {
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/demo-reset', { method: 'POST' })
      if (!res.ok) throw new Error('reset failed')
      setState('done')
      router.refresh()
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const label =
    state === 'loading' ? 'Resetting…' :
    state === 'done'    ? 'Reset!' :
    state === 'error'   ? 'Error' :
    'Reset demo'

  return (
    <button
      onClick={handleReset}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
      style={{
        color: state === 'done' ? '#2d7a4f' : state === 'error' ? '#b91c1c' : '#92713a',
        backgroundColor: state === 'done' ? '#d1fae5' : state === 'error' ? '#fee2e2' : '#fef3c7',
        border: '1px solid',
        borderColor: state === 'done' ? '#6ee7b7' : state === 'error' ? '#fca5a5' : '#fde68a',
        cursor: state === 'loading' ? 'wait' : 'pointer',
      }}
    >
      {/* rotate icon when loading */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        style={{
          flexShrink: 0,
          transition: 'transform 0.6s',
          transform: state === 'loading' ? 'rotate(360deg)' : 'rotate(0deg)',
        }}
      >
        <path d="M10 6A4 4 0 1 1 6 2" />
        <path d="M10 2v4h-4" />
      </svg>
      {label}
    </button>
  )
}
