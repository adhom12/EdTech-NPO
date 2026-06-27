import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const curriculum_id = searchParams.get('curriculum_id')

  const supabase = await createClient()

  let query = supabase
    .from('skills')
    .select('id, skill_name, spec_reference, topic, subtopic')
    .order('topic')
    .order('subtopic')
    .order('skill_name')
    .limit(500)

  if (curriculum_id) {
    query = query.eq('curriculum_id', curriculum_id)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
