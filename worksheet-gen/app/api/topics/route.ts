import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const syllabus = searchParams.get('syllabus')
  const subject = searchParams.get('subject')
  const q = searchParams.get('q') ?? ''

  if (!syllabus || !subject) {
    return NextResponse.json({ error: 'syllabus and subject are required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('topics')
    .select('id, name')
    .eq('syllabus', syllabus)
    .eq('subject', subject)
    .ilike('name', `${q}%`)
    .order('name')
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
