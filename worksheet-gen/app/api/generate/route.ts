import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Block } from '@/lib/renderMath'
import type { Question } from '@/lib/questions'

const anthropic = new Anthropic()

type DbRow = Record<string, unknown>

function dbRowToQuestion(row: DbRow, index: number): Question {
  let marks = 2
  let blocks: Block[] = []

  try {
    const ms = JSON.parse(row.mark_scheme as string)
    if (typeof ms.marks === 'number') marks = ms.marks
  } catch {}

  try {
    const parsed = JSON.parse(row.question_text as string)
    if (Array.isArray(parsed)) blocks = parsed as Block[]
  } catch {
    blocks = [{ type: 'p', text: (row.question_text as string) ?? '' }]
  }

  return {
    number: index + 1,
    marks,
    blocks,
    verified: row.verified as boolean,
    source: (row.source as string) ?? undefined,
  }
}

interface Skill {
  skill_name: string
  spec_reference: string | null
}

interface GeneratedQuestion {
  marks: number
  blocks: Block[]
  mark_scheme: string
}

async function generateWithClaude(params: {
  syllabus: string
  subject: string
  grade: number
  criterion: string
  difficulty: string
  topic?: string
  skills?: Skill[]
  count: number
}): Promise<GeneratedQuestion[]> {
  const { syllabus, subject, grade, criterion, difficulty, topic, skills, count } = params

  const skillsSection = skills && skills.length > 0
    ? skills.length === 1
      ? `- Skill: ${skills[0].skill_name}${skills[0].spec_reference ? ` [${skills[0].spec_reference}]` : ''}`
      : `- Skills to cover (distribute all ${count} questions across these — do not focus only on the first):\n${skills.map((s, i) => `  ${i + 1}. ${s.skill_name}${s.spec_reference ? ` [${s.spec_reference}]` : ''}`).join('\n')}`
    : topic
      ? `- Topic: ${topic}`
      : null

  const prompt = `You are an expert ${subject} teacher creating exam-style worksheet questions.

Generate ${count} question${count > 1 ? 's' : ''} for:
- Syllabus: ${syllabus}
- Subject: ${subject}
- Grade: Grade ${grade}${skillsSection ? `\n${skillsSection}` : ''}
- Criterion: ${criterion}
- Difficulty: ${difficulty}

Return ONLY a valid JSON array (no markdown, no code fences, no explanation). Each element must have:
- "marks": integer (1-2 for Approaching, 2-3 for Meeting, 4-6 for Exceeding)
- "blocks": array of content blocks
- "mark_scheme": string with key marking points

Each block in "blocks" must be one of:
- {"type": "p", "text": "..."} — paragraph; use $...$ for inline LaTeX math
- {"type": "display", "math": "..."} — display equation (pure LaTeX, no delimiters)
- {"type": "subtext", "text": "..."} — hint or instruction line

Example for a Physics question:
[
  {
    "marks": 3,
    "blocks": [
      {"type": "p", "text": "A particle of mass $m = 2\\text{ kg}$ accelerates uniformly at $a = 3\\text{ m/s}^2$."},
      {"type": "display", "math": "F = ma"},
      {"type": "p", "text": "Calculate the net force $F$ acting on the particle."},
      {"type": "subtext", "text": "Give your answer in newtons (N)."}
    ],
    "mark_scheme": "Substitution F = 2 × 3 [1]; F = 6 N [1]; unit correct [1]"
  }
]`

  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  })

  const message = await stream.finalMessage()

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  const raw = textBlock.text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  return JSON.parse(raw) as GeneratedQuestion[]
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { syllabus, subject, grade, criterion, difficulty, topic, skills, count = 5 } = body

  if (!syllabus || !subject || !grade || !criterion || !difficulty) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const gradeNum = parseInt(String(grade).replace(/\D/g, '')) || 10
  const supabase = await createClient()

  // Look up topic_id from legacy topic string (only used when no skills provided)
  let topicId: string | null = null
  if (topic && (!skills || skills.length === 0)) {
    const { data: topicData } = await supabase
      .from('topics')
      .select('id')
      .eq('syllabus', syllabus)
      .eq('subject', subject)
      .ilike('name', topic)
      .limit(1)
      .maybeSingle()
    topicId = topicData?.id ?? null
  }

  // Query verified questions matching all filters
  let query = supabase
    .from('questions')
    .select('*')
    .eq('syllabus', syllabus)
    .eq('subject', subject)
    .eq('grade', gradeNum)
    .eq('criterion', criterion)
    .eq('difficulty', difficulty)
    .eq('verified', true)
    .limit(count)

  if (topicId) {
    query = query.eq('topic_id', topicId)
  }

  const { data: verifiedRows, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const verified = verifiedRows ?? []

  if (verified.length >= count) {
    return NextResponse.json({
      questions: verified.slice(0, count).map((row, i) => dbRowToQuestion(row as DbRow, i)),
    })
  }

  // Generate the deficit with Claude
  const deficit = count - verified.length
  let generated: GeneratedQuestion[]

  try {
    generated = await generateWithClaude({
      syllabus,
      subject,
      grade: gradeNum,
      criterion,
      difficulty,
      topic: topic || undefined,
      skills: skills?.length > 0 ? skills : undefined,
      count: deficit,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to generate questions', detail: String(err) },
      { status: 500 }
    )
  }

  // Store AI-generated questions in DB
  const insertPayload = generated.map((q) => ({
    topic_id: topicId,
    syllabus,
    subject,
    grade: gradeNum,
    criterion,
    difficulty,
    question_type: 'short_answer',
    question_text: JSON.stringify(q.blocks),
    mark_scheme: JSON.stringify({ marks: q.marks, text: q.mark_scheme }),
    source: 'ai_generated',
    verified: false,
  }))

  const { data: insertedRows } = await supabase
    .from('questions')
    .insert(insertPayload)
    .select()

  const allRows = [...verified, ...(insertedRows ?? [])]

  return NextResponse.json({
    questions: allRows.map((row, i) => dbRowToQuestion(row as DbRow, i)),
  })
}
