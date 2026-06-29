import { NextRequest, NextResponse } from 'next/server'

// ── Demo mode: any command transforms Q3 into a real-world context version ────
// Suggested script: type "turn question 3 into a real-world context question"

const MUTATED_Q3 = {
  number: 3,
  marks: 4,
  blocks: [
    { type: 'p', text: 'A manufacturer produces spherical glass ornaments. Each ornament must have a volume of exactly $\\frac{500}{3}\\pi$ cm³.' },
    { type: 'p', text: 'Given that $V = \\frac{4}{3}\\pi r^3$, find the radius $r$ of each ornament.' },
    { type: 'subtext', text: 'Give your answer in exact simplified form.' },
  ],
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  const { questions } = await request.json()

  await sleep(1200)

  const mutated = (questions as Array<{ number: number; marks: number; blocks: unknown[] }>).map((q) =>
    q.number === 3 ? { ...q, ...MUTATED_Q3 } : q
  )

  return NextResponse.json({ questions: mutated })
}
