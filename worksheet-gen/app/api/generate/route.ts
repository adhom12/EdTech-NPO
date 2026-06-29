import { NextRequest, NextResponse } from 'next/server'
import type { Question } from '@/lib/questions'

// ── Demo mode: always returns this question set, no AI call ───────────────────

const DEMO_QUESTIONS: Question[] = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Solve the equation $3x + 7 = 22$.' },
      { type: 'subtext', text: 'Show all your working.' },
    ],
    topic: 'Algebra',
    subtopic: 'Linear Equations',
  },
  {
    number: 2,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Factorise and solve $x^2 - 7x + 12 = 0$.' },
      { type: 'subtext', text: 'Show all your working.' },
    ],
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
  },
  {
    number: 3,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Make $r$ the subject of the formula:' },
      { type: 'display', math: 'V = \\frac{4}{3}\\pi r^3' },
    ],
    topic: 'Algebra',
    subtopic: 'Rearranging Formulae',
  },
  {
    number: 4,
    marks: 4,
    blocks: [
      { type: 'p', text: 'Simplify the following expression fully:' },
      { type: 'display', math: '\\frac{x^2 - 9}{x^2 - x - 6}' },
    ],
    topic: 'Algebra',
    subtopic: 'Algebraic Fractions',
  },
  {
    number: 5,
    marks: 5,
    blocks: [
      { type: 'p', text: 'A rectangle has length $(2x + 3)$ cm and width $(x - 1)$ cm.' },
      { type: 'p', text: 'The perimeter of the rectangle is $32$ cm.' },
      { type: 'p', text: '(a) Form an equation in $x$ and solve it. [3]' },
      { type: 'p', text: '(b) Hence find the area of the rectangle. [2]' },
    ],
    topic: 'Algebra',
    subtopic: 'Problem Solving',
  },
]

// Fake delay so the loading animation plays — looks realistic on camera
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(_request: NextRequest) {
  await sleep(1800)
  return NextResponse.json({ questions: DEMO_QUESTIONS })
}
