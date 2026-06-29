import { getDb } from '@/lib/aurora/client'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sql = await getDb()
    await sql`UPDATE questions SET verified = true WHERE id = ${id}`
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
  try {
    const sql = await getDb()
    await sql`DELETE FROM questions WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
