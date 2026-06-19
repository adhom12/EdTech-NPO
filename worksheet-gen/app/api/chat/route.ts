import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Block } from '@/lib/renderMath'
import type { Question } from '@/lib/questions'

const anthropic = new Anthropic()

interface MutatePayload {
  command: string
  questions: Question[]
  parameters: Record<string, string>
}

export async function POST(request: NextRequest) {
  const { command, questions, parameters }: MutatePayload = await request.json()

  if (!command || !questions?.length) {
    return NextResponse.json({ error: 'command and questions are required' }, { status: 400 })
  }

  const prompt = `You are an expert ${parameters.subject ?? 'science'} teacher editing exam worksheet questions.

Current worksheet context:
- Syllabus: ${parameters.syllabus ?? 'unknown'}
- Subject: ${parameters.subject ?? 'unknown'}
- Grade: ${parameters.grade ?? 'unknown'}
- Difficulty: ${parameters.difficulty ?? 'unknown'}

The teacher has sent this instruction: "${command}"

Here are the question(s) to modify (as JSON):
${JSON.stringify(questions.map(q => ({ number: q.number, marks: q.marks, blocks: q.blocks })), null, 2)}

Apply the instruction to each question and return ONLY a valid JSON array with the same structure. Each element must have:
- "number": same question number (integer)
- "marks": updated mark total (integer)
- "blocks": updated array of content blocks

Each block must be one of:
- {"type": "p", "text": "..."} — paragraph; use $...$ for inline LaTeX math
- {"type": "display", "math": "..."} — display equation (pure LaTeX, no delimiters)
- {"type": "subtext", "text": "..."} — hint or instruction line

Return ONLY the JSON array. No markdown, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'No response from Claude' }, { status: 500 })
  }

  const raw = textBlock.text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  let mutated: Array<{ number: number; marks: number; blocks: Block[] }>
  try {
    mutated = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Failed to parse Claude response', raw }, { status: 500 })
  }

  return NextResponse.json({ questions: mutated })
}
