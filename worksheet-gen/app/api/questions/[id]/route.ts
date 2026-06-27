import { createClient } from '@/lib/supabase/server'
import { getDb } from '@/lib/aurora/client'
import { NextResponse, type NextRequest } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const sql = await getDb()
  const rows = await sql`SELECT role FROM users WHERE id = ${user.id} LIMIT 1`
  return rows[0]?.role === 'admin' ? user : null
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireAdmin()

  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const sql = await getDb()
    await sql`
      UPDATE questions
      SET verified = true, verified_by = ${user.id}, verified_at = NOW()
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireAdmin()

  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const sql = await getDb()
    await sql`DELETE FROM questions WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
