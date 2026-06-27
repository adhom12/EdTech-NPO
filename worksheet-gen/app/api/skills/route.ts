import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const curriculum_id = searchParams.get('curriculum_id')

  try {
    const sql = await getDb()

    const rows = curriculum_id
      ? await sql`
          SELECT id, skill_name, spec_reference, topic, subtopic
          FROM skills
          WHERE curriculum_id = ${curriculum_id}
          ORDER BY topic, subtopic, skill_name
          LIMIT 500
        `
      : await sql`
          SELECT id, skill_name, spec_reference, topic, subtopic
          FROM skills
          ORDER BY topic, subtopic, skill_name
          LIMIT 500
        `

    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
