// TEMPORARY — delete after Phase 1 connectivity is verified
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

export async function GET() {
  try {
    const sql = await getDb()
    const [ver] = await sql`SELECT version()`
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    return NextResponse.json({
      ok: true,
      version: ver.version,
      tables: tables.map((t: { table_name: string }) => t.table_name),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    )
  }
}
