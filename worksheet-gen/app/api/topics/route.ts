import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const syllabus = searchParams.get('syllabus')
  const subject = searchParams.get('subject')
  const q = searchParams.get('q') ?? ''

  if (!syllabus || !subject) {
    return NextResponse.json({ error: 'syllabus and subject are required' }, { status: 400 })
  }

  try {
    const sql = await getDb()
    const rows = await sql`
      SELECT id, name
      FROM topics
      WHERE syllabus = ${syllabus}
        AND subject = ${subject}
        AND name ILIKE ${q + '%'}
      ORDER BY name
      LIMIT 10
    `
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
