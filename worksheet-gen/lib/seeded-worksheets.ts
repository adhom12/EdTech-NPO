import type { Question } from './questions'

const INDICES_SURDS: Question[] = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Simplify $3^7 \\div 3^4$, giving your answer as a power of 3.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Index Laws',
  },
  {
    number: 2,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Evaluate $\\left(\\dfrac{2}{5}\\right)^{-2}$.' },
      { type: 'subtext', text: 'Give your answer as a fraction in its simplest form.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Negative Indices',
  },
  {
    number: 3,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Write $\\sqrt{48}$ in the form $a\\sqrt{3}$, where $a$ is an integer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Simplifying Surds',
  },
  {
    number: 4,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Expand and simplify $(3 + \\sqrt{5})(3 - \\sqrt{5})$.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Multiplying Surds',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'Rationalise the denominator and simplify fully:' },
      { type: 'display', math: '\\frac{10}{3 + \\sqrt{2}}' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Rationalising Denominators',
  },
]

const CIRCLE_THEOREMS: Question[] = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'O is the centre of a circle. Points A, B and C lie on the circle.' },
      { type: 'p', text: 'Angle $AOB = 124°$.' },
      { type: 'p', text: 'Find angle $ACB$, giving a reason for your answer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Angle at the Centre',
  },
  {
    number: 2,
    marks: 2,
    blocks: [
      { type: 'p', text: '$AB$ is a diameter of a circle with centre $O$. $C$ is a point on the circumference.' },
      { type: 'p', text: 'Find angle $ACB$, giving a reason.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Angle in a Semicircle',
  },
  {
    number: 3,
    marks: 3,
    blocks: [
      { type: 'p', text: '$ABCD$ is a cyclic quadrilateral.' },
      { type: 'p', text: 'Angle $ABC = 117°$ and angle $BCD = 78°$.' },
      { type: 'p', text: '(a) Find angle $ADC$.' },
      { type: 'p', text: '(b) Find angle $DAB$.' },
      { type: 'subtext', text: 'State the circle theorem used in each part.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Cyclic Quadrilaterals',
  },
  {
    number: 4,
    marks: 3,
    blocks: [
      { type: 'p', text: 'A tangent from external point $T$ touches a circle with centre $O$ at point $A$.' },
      { type: 'p', text: '$OA = 5\\text{ cm}$ and $OT = 13\\text{ cm}$.' },
      { type: 'p', text: 'Calculate the length $AT$, giving a reason for any right angle used.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Tangent-Radius',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'A circle has centre $O$. $A$ and $B$ are points on the circle and $TA$ is a tangent to the circle at $A$.' },
      { type: 'p', text: 'Angle $OAB = 32°$.' },
      { type: 'p', text: '(a) Find angle $OBA$. Give a reason for your answer. [2]' },
      { type: 'p', text: '(b) Hence find angle $TAB$. Give a reason for your answer. [2]' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Circle Theorems',
    subtopic: 'Tangent-Radius',
  },
]

const QUADRATIC_EQUATIONS: Question[] = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'Factorise $x^2 - 5x + 6$.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Quadratic Equations',
    subtopic: 'Factorising',
  },
  {
    number: 2,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Solve $x^2 + 3x - 10 = 0$.' },
      { type: 'subtext', text: 'Show your working clearly.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Quadratic Equations',
    subtopic: 'Factorising',
  },
  {
    number: 3,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Express $x^2 + 6x - 7$ in the form $(x + p)^2 + q$.' },
      { type: 'subtext', text: 'State the values of $p$ and $q$.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Quadratic Equations',
    subtopic: 'Completing the Square',
  },
  {
    number: 4,
    marks: 4,
    blocks: [
      { type: 'p', text: 'Use the quadratic formula to solve $2x^2 - 5x - 3 = 0$.' },
      { type: 'subtext', text: 'Give your answers correct to 2 decimal places.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Quadratic Equations',
    subtopic: 'Quadratic Formula',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'A rectangle has length $(x + 2)$ cm and width $x$ cm.' },
      { type: 'p', text: 'Its area is $24$ cm².' },
      { type: 'p', text: 'Form a quadratic equation and solve it to find the value of $x$.' },
      { type: 'subtext', text: 'Give your answer correct to 2 decimal places.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Quadratic Equations',
    subtopic: 'Problem Solving',
  },
]

// Pre-built group remediation set — used when "Create Group Assignment" is clicked
// in the Indices & Surds smart suggestion on the demo branch
export const GROUP_ASSIGNMENT_QUESTIONS: Question[] = [
  {
    number: 1,
    marks: 2,
    blocks: [
      { type: 'p', text: 'State the value of $5^0$.' },
      { type: 'subtext', text: 'Give a reason for your answer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Zero Index',
  },
  {
    number: 2,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Simplify each expression, leaving your answer as a single power of $x$:' },
      { type: 'p', text: '(a) $x^5 \\times x^3$' },
      { type: 'p', text: '(b) $x^8 \\div x^2$' },
      { type: 'p', text: '(c) $(x^3)^4$' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Index Laws',
  },
  {
    number: 3,
    marks: 2,
    blocks: [
      { type: 'p', text: 'A student writes: $2^3 \\times 2^4 = 4^7$.' },
      { type: 'p', text: 'Identify the error and write the correct simplified answer.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Index Laws',
  },
  {
    number: 4,
    marks: 3,
    blocks: [
      { type: 'p', text: 'Write the following as a single power with a positive index:' },
      { type: 'display', math: '\\frac{x^{-2} \\times x^5}{x^{-1}}' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Negative Indices',
  },
  {
    number: 5,
    marks: 4,
    blocks: [
      { type: 'p', text: 'Evaluate:' },
      { type: 'display', math: '\\left(\\frac{27}{8}\\right)^{-\\frac{2}{3}}' },
      { type: 'subtext', text: 'Give your answer as a fraction in its simplest form.' },
    ],
    verified: true,
    source: 'seed',
    topic: 'Indices & Surds',
    subtopic: 'Fractional & Negative Indices',
  },
]

export const SEEDED_WORKSHEET_QUESTIONS: Record<string, Question[]> = {
  'Indices & Surds — Homework 1': INDICES_SURDS,
  'Circle Theorems — Mock Exam': CIRCLE_THEOREMS,
  'Quadratic Equations — Practice Paper': QUADRATIC_EQUATIONS,
}
